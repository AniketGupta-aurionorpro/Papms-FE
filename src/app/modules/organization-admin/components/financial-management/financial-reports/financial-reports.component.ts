import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { OrganizationService } from '../../../../../services/organization.service';
import { TransactionService } from '../../../../../services/transaction.service';
import { TransactionDto, TransactionType, TransactionSourceType } from '../../../../../models/transaction.models';
import { FinancialSummaryDto } from '../../../../../models/organization.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './financial-reports.component.html',
  styleUrls: ['./financial-reports.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FinancialReportsComponent implements OnInit {
  organizationId!: number;
  isLoading = true;
  error: string | null = null;

  // Financial Summary
  summary: FinancialSummaryDto | null = null;

  // Recent Transactions
  recentTransactions: TransactionDto[] = [];

  // Report Generation
  reportPeriod = 'THIS_MONTH';
  reportType = 'ALL';
  isExporting = false;

  // Period options
  periods = [
    { value: 'THIS_MONTH', label: 'This Month' },
    { value: 'LAST_MONTH', label: 'Last Month' },
    { value: 'THIS_QUARTER', label: 'This Quarter' },
    { value: 'THIS_YEAR', label: 'This Year' },
    { value: 'ALL_TIME', label: 'All Time' }
  ];

  // Report type options
  reportTypes = [
    { value: 'ALL', label: 'All Transactions' },
    { value: 'CREDITS', label: 'Credits Only' },
    { value: 'DEBITS', label: 'Debits Only' }
  ];

  // Stats cards
  stats = [
    { title: 'Current Balance', value: '₹0', icon: 'wallet-outline', color: 'from-emerald-600 to-green-500', key: 'balance' },
    { title: 'Total Credits', value: '₹0', icon: 'trending-up-outline', color: 'from-blue-600 to-blue-500', key: 'credits' },
    { title: 'Total Debits', value: '₹0', icon: 'trending-down-outline', color: 'from-red-600 to-red-500', key: 'debits' },
    { title: 'Transactions', value: '0', icon: 'receipt-outline', color: 'from-purple-600 to-purple-500', key: 'count' }
  ];

  constructor(
    private authService: AuthService,
    private organizationService: OrganizationService,
    private transactionService: TransactionService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (!userInfo?.organizationId) {
      this.error = 'Could not identify your organization.';
      this.isLoading = false;
      return;
    }
    this.organizationId = userInfo.organizationId;
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    // Load financial summary
    this.organizationService.getFinancialSummary(this.organizationId)
      .subscribe({
        next: (summary) => {
          this.summary = summary;
          this.updateStatsCards();
        },
        error: (err) => {
          console.error('Failed to load summary:', err);
        }
      });

    // Load recent transactions
    this.transactionService.getTransactions(this.organizationId, 0, 5)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.recentTransactions = response.content;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load data.';
        }
      });
  }

  updateStatsCards(): void {
    if (!this.summary) return;
    this.stats[0].value = this.formatCurrency(this.summary.currentBalance || 0);
    this.stats[1].value = this.formatCurrency(this.summary.totalCredits || 0);
    this.stats[2].value = this.formatCurrency(this.summary.totalDebits || 0);
    this.stats[3].value = (this.summary.totalTransactions || 0).toString();
  }

  exportReport(): void {
    this.isExporting = true;
    this.notificationService.showInfo('Generating financial report...');
    this.transactionService.downloadTransactionReport(this.organizationId)
      .pipe(finalize(() => this.isExporting = false))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `financial-report-${new Date().toISOString().split('T')[0]}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.notificationService.showSuccess('Financial report downloaded successfully!');
        },
        error: () => {
          this.notificationService.showError('Failed to download report. Please try again.');
        }
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return this.formatDate(dateString);
  }

  getTypeColor(type: TransactionType): string {
    return type === TransactionType.CREDIT ? 'text-green-400' : 'text-red-400';
  }

  getTypeIcon(type: TransactionType): string {
    return type === TransactionType.CREDIT ? 'arrow-down-outline' : 'arrow-up-outline';
  }

  getTypeBgColor(type: TransactionType): string {
    return type === TransactionType.CREDIT ? 'bg-green-500/20' : 'bg-red-500/20';
  }

  // Calculate credit vs debit percentage for visual indicator
  get creditPercentage(): number {
    if (!this.summary) return 50;
    const total = (this.summary.totalCredits || 0) + (this.summary.totalDebits || 0);
    if (total === 0) return 50;
    return Math.round(((this.summary.totalCredits || 0) / total) * 100);
  }

  get debitPercentage(): number {
    return 100 - this.creditPercentage;
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view financial reports.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load data. Please try again.';
  }
}
