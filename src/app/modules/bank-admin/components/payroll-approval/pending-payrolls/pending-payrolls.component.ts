import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PayrollBatchResponse } from '../../../../../models/payroll.models';
import { LoadingService } from '../../../../../services/loading.service';
import { PayrollService } from '../../../../../services/payroll.service';


@Component({
  selector: 'app-pending-payrolls',
  templateUrl: './pending-payrolls.component.html',
  styleUrls: ['./pending-payrolls.component.css'],
  standalone: false,
})
export class PendingPayrollsComponent implements OnInit {
  payrolls: PayrollBatchResponse[] = [];
  filteredPayrolls: PayrollBatchResponse[] = [];
  isLoading = true;
  error = '';
  searchTerm = '';

  constructor(
    private payrollService: PayrollService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPendingPayrolls();
  }

  loadPendingPayrolls(): void {
    this.isLoading = true;
    this.payrollService.getPendingPayrolls().subscribe({
      next: (response) => {
        this.payrolls = response.content || response;
        this.filteredPayrolls = this.payrolls;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load pending payrolls';
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    this.filteredPayrolls = this.payrolls.filter(payroll =>
      payroll.organizationName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      payroll.submittedBy.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'bg-amber-500/20 text-amber-400';
      case 'APPROVED':
        return 'bg-green-500/20 text-green-400';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400';
      case 'PROCESSED':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-slate-600 text-slate-300';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'time-outline';
      case 'APPROVED':
        return 'checkmark-circle-outline';
      case 'REJECTED':
        return 'close-circle-outline';
      case 'PROCESSED':
        return 'checkmark-done-outline';
      default:
        return 'help-circle-outline';
    }
  }

  viewPayrollDetails(batchId: number): void {
    this.router.navigate(['/bank-admin/payroll-approval', batchId]);
  }

  approvePayroll(batchId: number): void {
    this.payrollService.approvePayroll(batchId).subscribe({
      next: () => {
        this.loadPendingPayrolls();
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to approve payroll';
      }
    });
  }

  rejectPayroll(batchId: number): void {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      this.payrollService.rejectPayroll(batchId, reason).subscribe({
        next: () => {
          this.loadPendingPayrolls();
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to reject payroll';
        }
      });
    }
  }

  getTotalAmount(): number {
    return this.payrolls.reduce((sum, payroll) => sum + payroll.totalAmount, 0);
  }

  getTotalEmployees(): number {
    return this.payrolls.reduce((sum, payroll) => sum + payroll.totalEmployees, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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
}
