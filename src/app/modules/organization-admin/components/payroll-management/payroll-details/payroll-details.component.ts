import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { PayrollService } from '../../../../../services/payroll.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { PayrollBatchResponse, PayrollPaymentResponse } from '../../../../../models/payroll.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

type NumericPayrollPaymentKeys = 'basicSalary' | 'hra' | 'da' | 'otherAllowances' | 'pfContribution' | 'totalEarnings' | 'totalDeductions' | 'netSalaryPaid';

@Component({
  selector: 'app-payroll-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './payroll-details.component.html',
  styleUrls: ['./payroll-details.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PayrollDetailsComponent implements OnInit {
  payroll: PayrollBatchResponse | null = null;
  isLoading = true;
  error = '';
  activeTab = 'overview';

  tabs = [
    { id: 'overview', label: 'Overview', icon: 'information-circle-outline' },
    { id: 'payments', label: 'Employee Payments', icon: 'people-outline' },
    { id: 'breakdown', label: 'Salary Breakdown', icon: 'pie-chart-outline' }
  ];

  // Search, Filter, Pagination for Employee Payments
  searchQuery = '';
  selectedStatus = 'ALL';
  showOnlyModified = false;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private payrollService: PayrollService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const batchId = this.route.snapshot.paramMap.get('id');
    if (batchId) {
      this.loadPayrollDetails(+batchId);
    } else {
      this.router.navigate(['/org-admin/payroll/history']);
    }
  }

  loadPayrollDetails(batchId: number): void {
    this.isLoading = true;
    this.payrollService.getPayrollById(batchId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (payroll) => {
          this.payroll = payroll;
        },
        error: (err) => {
          this.error = this.extractErrorMessage(err);
          this.notificationService.showError(this.error);
        }
      });
  }

  // Filtered payments based on search and status
  get filteredPayments(): PayrollPaymentResponse[] {
    if (!this.payroll?.payments) return [];
    let result = this.payroll.payments;

    // Search by name or code
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.employeeName.toLowerCase().includes(query) ||
        p.employeeCode.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (this.selectedStatus !== 'ALL') {
      result = result.filter(p => p.status === this.selectedStatus);
    }

    // Filter by modified salary
    if (this.showOnlyModified) {
      result = result.filter(p => p.salaryModified === true);
    }

    return result;
  }

  // Paginated payments
  get paginatedPayments(): PayrollPaymentResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPayments.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPayments.length / this.pageSize);
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(total, 5);
      else start = Math.max(1, total - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400';
      case 'PENDING_APPROVAL': return 'bg-amber-500/20 text-amber-400';
      case 'REJECTED': return 'bg-red-500/20 text-red-400';
      case 'PROCESSING': return 'bg-blue-500/20 text-blue-400';
      case 'PROCESSED': return 'bg-green-500/20 text-green-400';
      case 'PENDING': return 'bg-amber-500/20 text-amber-400';
      case 'PAID': return 'bg-green-500/20 text-green-400';
      case 'FAILED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-600 text-slate-300';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'checkmark-circle-outline';
      case 'PENDING_APPROVAL': return 'time-outline';
      case 'REJECTED': return 'close-circle-outline';
      case 'PROCESSING': return 'sync-outline';
      case 'PROCESSED': return 'checkmark-circle-outline';
      case 'PENDING': return 'time-outline';
      case 'PAID': return 'checkmark-circle-outline';
      case 'FAILED': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  }

  formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getEmployeeInitials(name: string): string {
    if (!name) return '?';
    const words = name.split(' ').filter(Boolean);
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  goBack(): void {
    this.router.navigate(['/org-admin/payroll/history']);
  }

  getMonthName(month: number): string {
    return new Date(0, month - 1).toLocaleString('default', { month: 'long' });
  }

  getTotal(key: NumericPayrollPaymentKeys): number {
    if (!this.payroll || !this.payroll.payments) {
      return 0;
    }
    return this.payroll.payments.reduce((sum, p) => sum + (p[key] as number || 0), 0);
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view this payroll.';
    if (err.status === 404) return 'Payroll not found.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load payroll details. Please try again.';
  }
}

