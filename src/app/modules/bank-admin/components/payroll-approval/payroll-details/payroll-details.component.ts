import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollBatchResponse } from '../../../../../models/payroll.models';
import { LoadingService } from '../../../../../services/loading.service';
import { PayrollService } from '../../../../../services/payroll.service';


@Component({
  selector: 'app-payroll-details',
  templateUrl: './payroll-details.component.html',
  styleUrls: ['./payroll-details.component.css'],
  standalone: false,
})
export class PayrollDetailsComponent implements OnInit {
  payroll: PayrollBatchResponse | null = null;
  isLoading = true;
  error = '';
  activeTab = 'overview';

  tabs = [
    { id: 'overview', label: 'Overview', icon: 'information-circle-outline' },
    { id: 'payments', label: 'Payments', icon: 'cash-outline' },
    { id: 'breakdown', label: 'Breakdown', icon: 'pie-chart-outline' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private payrollService: PayrollService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    const batchId = this.route.snapshot.paramMap.get('id');
    if (batchId) {
      this.loadPayrollDetails(+batchId);
    } else {
      this.router.navigate(['/bank-admin/payroll-approval']);
    }
  }

  loadPayrollDetails(batchId: number): void {
    this.isLoading = true;
    this.payrollService.getPayrollById(batchId).subscribe({
      next: (payroll) => {
        this.payroll = payroll;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load payroll details';
        this.isLoading = false;
      }
    });
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

  approvePayroll(): void {
    if (this.payroll) {
      this.payrollService.approvePayroll(this.payroll.id).subscribe({
        next: () => {
          this.loadPayrollDetails(this.payroll!.id);
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to approve payroll';
        }
      });
    }
  }

  rejectPayroll(): void {
    if (this.payroll) {
      const reason = prompt('Please enter rejection reason:');
      if (reason) {
        this.payrollService.rejectPayroll(this.payroll.id, reason).subscribe({
          next: () => {
            this.loadPayrollDetails(this.payroll!.id);
          },
          error: (error) => {
            this.error = error.error?.message || 'Failed to reject payroll';
          }
        });
      }
    }
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  goBack(): void {
    this.router.navigate(['/bank-admin/payroll-approval']);
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

  getTotalEarnings(): number {
    if (!this.payroll?.payments) return 0;
    return this.payroll.payments.reduce((sum, payment) => sum + payment.totalEarnings, 0);
  }

  getTotalDeductions(): number {
    if (!this.payroll?.payments) return 0;
    return this.payroll.payments.reduce((sum, payment) => sum + payment.totalDeductions, 0);
  }

  getTotalNetSalary(): number {
    if (!this.payroll?.payments) return 0;
    return this.payroll.payments.reduce((sum, payment) => sum + payment.netSalaryPaid, 0);
  }

  // Helper methods for breakdown calculations
  getBasicSalaryTotal(): number {
    if (!this.payroll?.payments) return 0;
    return this.payroll.payments.reduce((sum, payment) => sum + payment.basicSalary, 0);
  }

  getHraTotal(): number {
    if (!this.payroll?.payments) return 0;
    return this.payroll.payments.reduce((sum, payment) => sum + payment.hra, 0);
  }

  getDaTotal(): number {
    if (!this.payroll?.payments) return 0;
    return this.payroll.payments.reduce((sum, payment) => sum + payment.da, 0);
  }

  getOtherAllowancesTotal(): number {
    if (!this.payroll?.payments) return 0;
    return this.payroll.payments.reduce((sum, payment) => sum + payment.otherAllowances, 0);
  }

  getPfContributionTotal(): number {
    if (!this.payroll?.payments) return 0;
    return this.payroll.payments.reduce((sum, payment) => sum + payment.pfContribution, 0);
  }

  getEmployeeInitials(employeeName: string): string {
    if (!employeeName) return '??';
    return employeeName.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
