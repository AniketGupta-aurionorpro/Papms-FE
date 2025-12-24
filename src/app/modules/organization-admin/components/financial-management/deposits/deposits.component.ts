import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DepositService } from '../../../../../services/deposit.service';
import { TransactionService } from '../../../../../services/transaction.service';
import { OrganizationService } from '../../../../../services/organization.service';
import { TransactionDto, TransactionSourceType } from '../../../../../models/transaction.models';
import { PageEvent, PaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

interface QuickAmount {
  value: number;
  label: string;
}

@Component({
  selector: 'app-deposits',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PaginationComponent, LoadingSpinnerComponent],
  templateUrl: './deposits.component.html',
  styleUrls: ['./deposits.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DepositsComponent implements OnInit {
  depositForm: FormGroup;
  organizationId!: number;

  // Balance info
  currentBalance: number = 0;
  isLoadingBalance = true;

  // Transaction history
  history: TransactionDto[] = [];
  isLoadingHistory = true;
  isSubmitting = false;
  error: string | null = null;

  // Pagination
  totalRecords = 0;
  currentPage = 0;
  pageSize = 5;

  // Stats
  totalDepositsThisMonth = 0;
  depositCountThisMonth = 0;
  lastDepositAmount = 0;
  lastDepositDate: string | null = null;

  // Quick amounts
  quickAmounts: QuickAmount[] = [
    { value: 10000, label: '₹10,000' },
    { value: 25000, label: '₹25,000' },
    { value: 50000, label: '₹50,000' },
    { value: 100000, label: '₹1,00,000' },
    { value: 250000, label: '₹2,50,000' },
    { value: 500000, label: '₹5,00,000' }
  ];

  // Confirmation modal
  showConfirmModal = false;
  pendingAmount = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private depositService: DepositService,
    private transactionService: TransactionService,
    private organizationService: OrganizationService,
    private notificationService: NotificationService
  ) {
    this.depositForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      reference: ['']
    });
  }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (!userInfo?.organizationId) {
      this.error = "Could not identify your organization.";
      this.isLoadingHistory = false;
      this.isLoadingBalance = false;
      return;
    }
    this.organizationId = userInfo.organizationId;
    this.loadBalance();
    this.loadHistory();
  }

  loadBalance(): void {
    this.isLoadingBalance = true;
    console.log('Loading balance for org:', this.organizationId);
    this.organizationService.getFinancialSummary(this.organizationId)
      .pipe(finalize(() => this.isLoadingBalance = false))
      .subscribe({
        next: (summary) => {
          console.log('Financial summary response:', summary);
          this.currentBalance = summary.currentBalance || 0;
        },
        error: (err) => {
          console.error('Error loading balance:', err);
          this.currentBalance = 0;
        }
      });
  }

  loadHistory(): void {
    this.isLoadingHistory = true;
    this.error = null;
    this.transactionService.getTransactions(
      this.organizationId,
      this.currentPage,
      this.pageSize,
      null,
      null,
      null,
      null,
      TransactionSourceType.DEPOSIT
    ).pipe(finalize(() => this.isLoadingHistory = false))
      .subscribe({
        next: (response) => {
          this.history = response.content;
          this.totalRecords = response.totalElements;
          this.calculateStats();
        },
        error: (err) => {
          this.error = err.error?.message || "Failed to load deposit history.";
        }
      });
  }

  calculateStats(): void {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Filter this month's deposits
    const thisMonthDeposits = this.history.filter(t => {
      const date = new Date(t.transactionDate);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    this.depositCountThisMonth = thisMonthDeposits.length;
    this.totalDepositsThisMonth = thisMonthDeposits.reduce((sum, t) => sum + t.amount, 0);

    // Last deposit
    if (this.history.length > 0) {
      this.lastDepositAmount = this.history[0].amount;
      this.lastDepositDate = this.history[0].transactionDate;
    }
  }

  selectQuickAmount(amount: number): void {
    this.depositForm.patchValue({ amount });
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

  openConfirmModal(): void {
    if (this.depositForm.invalid) {
      this.depositForm.markAllAsTouched();
      this.notificationService.showError("Please enter a valid deposit amount.");
      return;
    }
    this.pendingAmount = this.depositForm.value.amount;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.pendingAmount = 0;
  }

  confirmDeposit(): void {
    this.showConfirmModal = false;
    this.submitDeposit();
  }

  submitDeposit(): void {
    this.isSubmitting = true;
    const request = { amount: this.depositForm.value.amount };

    this.depositService.makeSelfDeposit(request)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccess(`Successfully deposited ${this.formatCurrency(response.amountDeposited)}`);
          this.depositForm.reset();
          this.currentBalance = response.balanceAfterDeposit;
          this.loadHistory();
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || "Deposit failed. Please try again.");
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadHistory();
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to make deposits.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Deposit failed. Please try again.';
  }
}
