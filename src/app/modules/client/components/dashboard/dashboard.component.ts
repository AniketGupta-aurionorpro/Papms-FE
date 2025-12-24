import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { ClientPortalService } from '../../../../services/client-portal.service';
import { InvoiceService } from '../../../../services/invoice.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ClientDto } from '../../../../models/client-portal.models';
import { InvoiceResponseDto, InvoiceStatus } from '../../../../models/invoice.models';
import { LoadingSpinnerComponent } from '../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientDashboardComponent implements OnInit {
  clientProfile: ClientDto | null = null;
  invoices: InvoiceResponseDto[] = [];
  recentInvoices: InvoiceResponseDto[] = [];
  isLoading = true;
  error: string | null = null;

  // Stats
  totalInvoices = 0;
  pendingInvoices = 0;
  paidInvoices = 0;
  totalDue = 0;

  constructor(
    private clientPortalService: ClientPortalService,
    private invoiceService: InvoiceService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    // Load client profile
    this.clientPortalService.getMyProfile()
      .subscribe({
        next: (profile: ClientDto) => {
          this.clientProfile = profile;
          this.loadInvoices(profile.id);
        },
        error: (err: any) => {
          this.error = this.extractErrorMessage(err);
          this.notificationService.showError(this.error);
          this.isLoading = false;
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
          this.recentInvoices = invoices
            .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
            .slice(0, 5);
        },
        error: (err: any) => {
          this.notificationService.showError('Failed to load invoices');
        }
      });
  }

  calculateStats(): void {
    this.totalInvoices = this.invoices.length;
    this.paidInvoices = this.invoices.filter(i => i.status === 'PAID').length;
    this.pendingInvoices = this.invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').length;
    this.totalDue = this.invoices
      .filter(i => i.status === 'SENT' || i.status === 'OVERDUE')
      .reduce((sum, i) => sum + i.amount, 0);
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
        this.notificationService.showSuccess('PDF downloaded!');
      },
      error: () => this.notificationService.showError('Failed to download PDF')
    });
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
    if (err.status === 403) return 'Access denied.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load data. Please try again.';
  }
}
