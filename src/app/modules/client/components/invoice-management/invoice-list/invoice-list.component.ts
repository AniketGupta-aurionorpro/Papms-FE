import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { InvoiceService, InvoicePaymentRequest, InvoicePaymentResponse } from '../../../../../services/invoice.service';
import { ClientPortalService } from '../../../../../services/client-portal.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { InvoiceResponseDto, InvoiceStatus } from '../../../../../models/invoice.models';
import { ClientDto } from '../../../../../models/client-portal.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-client-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientInvoiceListComponent implements OnInit {
  invoices: InvoiceResponseDto[] = [];
  filteredInvoices: InvoiceResponseDto[] = [];
  isLoading = true;
  error: string | null = null;
  profile: ClientDto | null = null;

  // Filters
  searchTerm = '';
  statusFilter: string = 'ALL';
  statuses = ['ALL', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];

  // Stats
  totalInvoices = 0;
  pendingAmount = 0;
  paidAmount = 0;

  // Payment Modal
  showPayModal = false;
  selectedInvoice: InvoiceResponseDto | null = null;
  paymentMode: 'FULL' | 'PARTIAL' = 'FULL';
  partialAmount = 0;
  isPaying = false;

  InvoiceStatus = InvoiceStatus;

  constructor(
    private invoiceService: InvoiceService,
    private clientPortalService: ClientPortalService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    this.clientPortalService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loadInvoices(profile.id);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = 'Failed to load profile';
        this.notificationService.showError(this.error);
      }
    });
  }

  loadInvoices(clientId: number): void {
    this.invoiceService.getClientInvoices(clientId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (invoices: InvoiceResponseDto[]) => {
          this.invoices = invoices;
          this.calculateStats();
          this.applyFilters();
        },
        error: (err: any) => {
          this.error = 'Failed to load invoices';
          this.notificationService.showError(this.error);
        }
      });
  }

  calculateStats(): void {
    this.totalInvoices = this.invoices.length;
    this.paidAmount = this.invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
    this.pendingAmount = this.invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0);
  }

  applyFilters(): void {
    let result = [...this.invoices];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(i =>
        i.invoiceNumber.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter !== 'ALL') {
      result = result.filter(i => i.status === this.statusFilter);
    }

    this.filteredInvoices = result;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.applyFilters();
  }

  downloadPdf(invoice: InvoiceResponseDto): void {
    this.notificationService.showInfo('Generating PDF...');
    this.invoiceService.downloadPdf(invoice.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_${invoice.invoiceNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.showSuccess('PDF downloaded successfully!');
      },
      error: () => this.notificationService.showError('Failed to download PDF')
    });
  }

  // Payment Methods
  openPayModal(invoice: InvoiceResponseDto): void {
    this.selectedInvoice = invoice;
    this.paymentMode = 'FULL';
    this.partialAmount = 0;
    this.showPayModal = true;
  }

  closePayModal(): void {
    this.showPayModal = false;
    this.selectedInvoice = null;
    this.paymentMode = 'FULL';
    this.partialAmount = 0;
  }

  getDueAmount(): number {
    if (!this.selectedInvoice) return 0;
    return this.selectedInvoice.amount - (this.selectedInvoice.paidAmount || 0);
  }

  confirmPayment(): void {
    if (!this.selectedInvoice) return;

    const dueAmount = this.getDueAmount();

    if (this.paymentMode === 'PARTIAL') {
      if (this.partialAmount <= 0) {
        this.notificationService.showError('Please enter a valid amount');
        return;
      }
      if (this.partialAmount > dueAmount) {
        this.notificationService.showError('Amount cannot exceed due amount');
        return;
      }
    }

    // Check wallet balance
    const payAmount = this.paymentMode === 'FULL' ? dueAmount : this.partialAmount;
    if (this.profile && this.profile.balance < payAmount) {
      this.notificationService.showError('Insufficient wallet balance');
      return;
    }

    this.isPaying = true;
    const request: InvoicePaymentRequest = {
      paymentMode: this.paymentMode,
      amount: this.paymentMode === 'PARTIAL' ? this.partialAmount : undefined
    };

    this.invoiceService.payInvoice(this.selectedInvoice.id, request)
      .pipe(finalize(() => this.isPaying = false))
      .subscribe({
        next: (response: InvoicePaymentResponse) => {
          this.notificationService.showSuccess(response.message);
          this.closePayModal();
          this.loadData(); // Reload to refresh balance and invoices
        },
        error: (err: any) => {
          this.notificationService.showError(err.error?.message || 'Payment failed');
        }
      });
  }

  canPay(invoice: InvoiceResponseDto): boolean {
    return invoice.status === 'SENT' || invoice.status === 'OVERDUE';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'SENT': 'text-blue-400 bg-blue-500/20',
      'PAID': 'text-green-400 bg-green-500/20',
      'OVERDUE': 'text-red-400 bg-red-500/20',
      'CANCELLED': 'text-slate-400 bg-slate-500/20'
    };
    return colors[status] || 'text-slate-400 bg-slate-500/20';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  isOverdue(invoice: InvoiceResponseDto): boolean {
    if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') return false;
    return new Date(invoice.dueDate) < new Date();
  }
}
