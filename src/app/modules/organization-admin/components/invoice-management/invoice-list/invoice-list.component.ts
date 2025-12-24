import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { InvoiceService } from '../../../../../services/invoice.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { InvoiceResponseDto, InvoiceStatus } from '../../../../../models/invoice.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InvoiceListComponent implements OnInit {
  invoices: InvoiceResponseDto[] = [];
  filteredInvoices: InvoiceResponseDto[] = [];
  isLoading = true;
  error: string | null = null;

  // Filters
  searchTerm = '';
  statusFilter: string = 'ALL';
  statuses = ['ALL', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];

  // Stats
  totalInvoices = 0;
  paidCount = 0;
  pendingCount = 0;
  totalAmount = 0;
  paidAmount = 0;
  pendingAmount = 0;

  // Modal state
  showCreateModal = false;
  selectedInvoice: InvoiceResponseDto | null = null;
  isProcessing = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalRecords = 0;

  InvoiceStatus = InvoiceStatus; // For template access

  constructor(
    private invoiceService: InvoiceService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.error = null;
    this.invoiceService.getInvoices()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (invoices: InvoiceResponseDto[]) => {
          this.invoices = invoices;
          this.calculateStats();
          this.applyFilters();
          if (invoices.length === 0) {
            this.notificationService.showInfo('No invoices found. Create your first invoice!');
          }
        },
        error: (err: any) => {
          this.error = this.extractErrorMessage(err);
          this.notificationService.showError(this.error);
        }
      });
  }

  calculateStats(): void {
    this.totalInvoices = this.invoices.length;
    this.paidCount = this.invoices.filter(i => i.status === 'PAID').length;
    this.pendingCount = this.invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').length;
    this.totalAmount = this.invoices.reduce((sum, i) => sum + i.amount, 0);
    this.paidAmount = this.invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
    this.pendingAmount = this.invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0);
  }

  applyFilters(): void {
    let result = [...this.invoices];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(i =>
        i.invoiceNumber.toLowerCase().includes(term) ||
        i.clientCompanyName.toLowerCase().includes(term) ||
        (i.clientEmail && i.clientEmail.toLowerCase().includes(term))
      );
    }

    if (this.statusFilter !== 'ALL') {
      result = result.filter(i => i.status === this.statusFilter);
    }

    this.filteredInvoices = result;
    this.totalRecords = result.length;
    this.currentPage = 0; // Reset to first page
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
  }

  get paginatedInvoices(): InvoiceResponseDto[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredInvoices.slice(start, end);
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
      error: () => this.notificationService.showError('Failed to download PDF. Please try again.')
    });
  }

  sendEmail(invoice: InvoiceResponseDto): void {
    if (!confirm(`Send invoice #${invoice.invoiceNumber} to ${invoice.clientEmail}?`)) return;

    this.isProcessing = true;
    this.invoiceService.sendInvoiceEmail(invoice.id)
      .pipe(finalize(() => this.isProcessing = false))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Invoice sent to ${invoice.clientEmail}`);
        },
        error: (err: any) => {
          this.notificationService.showError(err.error?.message || 'Failed to send email');
        }
      });
  }

  markAsPaid(invoice: InvoiceResponseDto): void {
    if (!confirm(`Mark invoice #${invoice.invoiceNumber} as paid?`)) return;

    this.invoiceService.markAsPaid(invoice.id).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Invoice #${invoice.invoiceNumber} marked as paid`);
        this.loadInvoices();
      },
      error: (err: any) => {
        this.notificationService.showError(err.error?.message || 'Failed to update invoice');
      }
    });
  }

  cancelInvoice(invoice: InvoiceResponseDto): void {
    if (!confirm(`Are you sure you want to cancel invoice #${invoice.invoiceNumber}?`)) return;

    this.invoiceService.cancelInvoice(invoice.id).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Invoice #${invoice.invoiceNumber} cancelled`);
        this.loadInvoices();
      },
      error: (err: any) => {
        this.notificationService.showError(err.error?.message || 'Failed to cancel invoice');
      }
    });
  }

  canPerformActions(invoice: InvoiceResponseDto): boolean {
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
    const dueDate = new Date(invoice.dueDate);
    return dueDate < new Date();
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view invoices.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load invoices. Please try again.';
  }
}
