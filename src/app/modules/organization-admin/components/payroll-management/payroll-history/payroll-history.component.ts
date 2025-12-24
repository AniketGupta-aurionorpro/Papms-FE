import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';

import { PayrollService } from '../../../../../services/payroll.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { PayrollBatchResponse, PayrollStatus } from '../../../../../models/payroll.models';
import { PageEvent, PaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-payroll-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent, LoadingSpinnerComponent],
  templateUrl: './payroll-history.component.html',
  styleUrls: ['./payroll-history.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PayrollHistoryComponent implements OnInit, OnDestroy {
  payrolls: PayrollBatchResponse[] = [];
  isLoading = true;
  error: string | null = null;
  organizationId!: number;

  // Filtering
  statusFilter: string = 'ALL';
  yearFilter: number = new Date().getFullYear();
  years: number[] = [];
  statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'PROCESSING', label: 'Processing' }
  ];

  // Pagination
  totalRecords = 0;
  currentPage = 0;
  pageSize = 10;

  private filterSubject = new Subject<void>();
  private filterSubscription!: Subscription;

  constructor(
    private payrollService: PayrollService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (!userInfo || !userInfo.organizationId) {
      this.error = 'Could not identify your organization.';
      this.isLoading = false;
      return;
    }
    this.organizationId = userInfo.organizationId;
    this.populateYears();
    this.loadPayrollHistory();

    this.filterSubscription = this.filterSubject
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadPayrollHistory();
      });
  }

  ngOnDestroy(): void {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  populateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 50; i++) {
      this.years.push(currentYear - i);
    }
  }

  loadPayrollHistory(): void {
    this.isLoading = true;
    this.error = null;
    this.payrollService.getPayrollsForOrganization(
      this.organizationId,
      this.currentPage,
      this.pageSize,
      this.statusFilter,
      this.yearFilter
    ).pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: (response) => {
        this.payrolls = response.content;
        this.totalRecords = response.totalElements;
      },
      error: (err) => {
        // --- FIX IS HERE ---
        const errorMessage = err.error?.message || 'Failed to load payroll history.';
        this.error = errorMessage;
        this.notificationService.showError(errorMessage);
        // --- END FIX ---
      }
    });
  }

  onFilterChange(): void {
    this.filterSubject.next();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadPayrollHistory();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400';
      case 'PENDING_APPROVAL': return 'bg-amber-500/20 text-amber-400';
      case 'REJECTED': return 'bg-red-500/20 text-red-400';
      case 'PROCESSING': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-600 text-slate-300';
    }
  }

  viewPayrollDetails(id: number): void {
    this.router.navigate(['/org-admin/payroll/details', id]);
  }

  getMonthName(monthNumber: number): string {
    return new Date(0, monthNumber - 1).toLocaleString('default', { month: 'long' });
  }
}
