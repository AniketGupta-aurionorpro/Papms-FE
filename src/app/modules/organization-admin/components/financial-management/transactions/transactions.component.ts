import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs'; // Fixed imports

import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { TransactionService } from '../../../../../services/transaction.service';
import { TransactionDto, TransactionType, TransactionSourceType } from '../../../../../models/transaction.models';
import { PageEvent, PaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent, LoadingSpinnerComponent],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TransactionsComponent implements OnInit {
  organizationId!: number;
  transactions: TransactionDto[] = [];
  isLoading = true;
  error: string | null = null;

  // Pagination
  totalRecords = 0;
  currentPage = 0;
  pageSize = 15;

  // Filters
  searchTerm = '';
  selectedType: TransactionType | 'ALL' = 'ALL';
  selectedSourceType: TransactionSourceType | 'ALL' = 'ALL';
  startDate: string = '';
  endDate: string = '';

  private searchSubject = new Subject<string>(); // Added missing property

  // Dropdown options
  transactionTypes = [
    { value: 'ALL', label: 'All Types' },
    { value: TransactionType.CREDIT, label: 'Credits' },
    { value: TransactionType.DEBIT, label: 'Debits' }
  ];

  sourceTypes = [
    { value: 'ALL', label: 'All Sources' },
    { value: TransactionSourceType.DEPOSIT, label: 'Deposits' },
    { value: TransactionSourceType.PAYROLL, label: 'Payroll' },
    { value: TransactionSourceType.INVOICE, label: 'Invoices' },
    { value: TransactionSourceType.VENDOR_PAYMENT, label: 'Vendor Payments' }
  ];

  isExporting = false;

  constructor(
    private authService: AuthService,
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
    this.organizationId = userInfo.organizationId;
    this.setupSearchSubscription();
    this.loadTransactions();
  }

  setupSearchSubscription(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 0;
      this.loadTransactions();
    });
  }

  onSearchInput(term: string): void {
    this.searchSubject.next(term);
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.error = null;

    const type = this.selectedType === 'ALL' ? null : this.selectedType;
    const sourceType = this.selectedSourceType === 'ALL' ? null : this.selectedSourceType;

    this.transactionService.getTransactions(
      this.organizationId,
      this.currentPage,
      this.pageSize,
      this.searchTerm || null,
      this.startDate || null,
      this.endDate || null,
      type,
      sourceType
    ).pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.transactions = response.content;
          this.totalRecords = response.totalElements;
          if (this.transactions.length === 0 && this.currentPage === 0) {
            this.notificationService.showInfo('No transactions found for the selected filters.');
          }
        },
        error: (err) => {
          this.error = this.extractErrorMessage(err);
          this.notificationService.showError(this.error);
        }
      });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadTransactions();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = 'ALL';
    this.selectedSourceType = 'ALL';
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 0;
    this.loadTransactions();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadTransactions();
  }

  exportReport(): void {
    this.isExporting = true;
    this.notificationService.showInfo('Generating report...');
    this.transactionService.downloadTransactionReport(this.organizationId)
      .pipe(finalize(() => this.isExporting = false))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `transactions-${new Date().toISOString().split('T')[0]}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.notificationService.showSuccess('Report downloaded successfully!');
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTypeColor(type: TransactionType): string {
    return type === TransactionType.CREDIT ? 'text-green-400' : 'text-red-400';
  }

  getTypeBgColor(type: TransactionType): string {
    return type === TransactionType.CREDIT ? 'bg-green-500/20' : 'bg-red-500/20';
  }

  getTypeIcon(type: TransactionType): string {
    return type === TransactionType.CREDIT ? 'arrow-down-outline' : 'arrow-up-outline';
  }

  getSourceLabel(sourceType: TransactionSourceType): string {
    const source = this.sourceTypes.find(s => s.value === sourceType);
    return source?.label || sourceType;
  }

  getSourceIcon(sourceType: TransactionSourceType): string {
    switch (sourceType) {
      case TransactionSourceType.DEPOSIT: return 'wallet-outline';
      case TransactionSourceType.PAYROLL: return 'people-outline';
      case TransactionSourceType.INVOICE: return 'document-text-outline';
      case TransactionSourceType.VENDOR_PAYMENT: return 'business-outline';
      default: return 'cash-outline';
    }
  }

  getSourceColor(sourceType: TransactionSourceType): string {
    switch (sourceType) {
      case TransactionSourceType.DEPOSIT: return 'bg-emerald-500/20 text-emerald-400';
      case TransactionSourceType.PAYROLL: return 'bg-blue-500/20 text-blue-400';
      case TransactionSourceType.INVOICE: return 'bg-amber-500/20 text-amber-400';
      case TransactionSourceType.VENDOR_PAYMENT: return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view transactions.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load transactions. Please try again.';
  }
}
