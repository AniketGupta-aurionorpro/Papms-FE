import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PayrollBatchResponse, PayrollStatus } from '../../../../../models/payroll.models';
import { LoadingService } from '../../../../../services/loading.service';
import { PayrollService } from '../../../../../services/payroll.service';

@Component({
  selector: 'app-payroll-history',
  templateUrl: './payroll-history.component.html',
  styleUrls: ['./payroll-history.component.css'],
  standalone: false,
})
export class PayrollHistoryComponent implements OnInit {
  payrolls: PayrollBatchResponse[] = [];
  filteredPayrolls: PayrollBatchResponse[] = [];
  isLoading = true;
  error = '';
  searchTerm = '';
  statusFilter = 'ALL';
  dateFilter = 'ALL';

  statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: PayrollStatus.APPROVED, label: 'Approved' },
    { value: PayrollStatus.REJECTED, label: 'Rejected' },
    { value: PayrollStatus.PROCESSED, label: 'Processed' }
  ];

  dateOptions = [
    { value: 'ALL', label: 'All Time' },
    { value: 'THIS_MONTH', label: 'This Month' },
    { value: 'LAST_MONTH', label: 'Last Month' },
    { value: 'THIS_QUARTER', label: 'This Quarter' },
    { value: 'THIS_YEAR', label: 'This Year' }
  ];

  constructor(
    private payrollService: PayrollService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPayrollHistory();
  }

  loadPayrollHistory(): void {
    this.isLoading = true;

    // Load all payrolls and filter out pending ones for history
    this.payrollService.getPendingPayrolls().subscribe({
      next: (response) => {
        const allPayrolls = response.content || [];
        // Filter out PENDING_APPROVAL status for history view
        this.payrolls = allPayrolls.filter((payroll: PayrollBatchResponse) =>
          payroll.status !== PayrollStatus.PENDING_APPROVAL
        );
        this.filteredPayrolls = this.payrolls;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load payroll history';
        this.isLoading = false;
        this.payrolls = [];
        this.filteredPayrolls = [];
      }
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredPayrolls = this.payrolls.filter(payroll => {
      const matchesSearch = payroll.organizationName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           payroll.submittedBy.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === 'ALL' || payroll.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case PayrollStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case PayrollStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case PayrollStatus.PROCESSED:
        return 'bg-blue-100 text-blue-800';
      case PayrollStatus.PENDING_APPROVAL:
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case PayrollStatus.APPROVED:
        return 'checkmark-circle-outline';
      case PayrollStatus.REJECTED:
        return 'close-circle-outline';
      case PayrollStatus.PROCESSED:
        return 'checkmark-done-outline';
      case PayrollStatus.PENDING_APPROVAL:
        return 'time-outline';
      default:
        return 'help-circle-outline';
    }
  }

  viewPayrollDetails(batchId: number): void {
    this.router.navigate(['/bank-admin/payroll-approval', batchId]);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'Unknown';
  }

  getTotalApproved(): number {
    return this.payrolls.filter(p =>
      p.status === PayrollStatus.APPROVED || p.status === PayrollStatus.PROCESSED
    ).length;
  }

  getTotalRejected(): number {
    return this.payrolls.filter(p => p.status === PayrollStatus.REJECTED).length;
  }

  getTotalAmount(): number {
    return this.payrolls.reduce((sum, payroll) => sum + payroll.totalAmount, 0);
  }
}
