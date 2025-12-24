import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { PayrollService } from '../../../../../services/payroll.service';
import { EmployeeService } from '../../../../../services/employee.service';
import { FileDownloadService } from '../../../../../services/file-download.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { PayrollBatchResponse, PayrollStatus } from '../../../../../models/payroll.models';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface QuickStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-payroll-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payroll-reports.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PayrollReportsComponent implements OnInit {
  isLoading = false;
  isLoadingStats = false;
  organizationId!: number;

  // Report Configuration
  selectedReportType = 'monthly';
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  selectedQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  exportFormat = 'xlsx';

  years: number[] = [];
  months: { value: number, name: string }[] = [];
  quarters = [
    { value: 1, name: 'Q1 (Jan - Mar)' },
    { value: 2, name: 'Q2 (Apr - Jun)' },
    { value: 3, name: 'Q3 (Jul - Sep)' },
    { value: 4, name: 'Q4 (Oct - Dec)' }
  ];

  reportTypes: ReportType[] = [
    { id: 'monthly', name: 'Monthly Summary', description: 'Detailed breakdown of salaries for a specific month', icon: 'calendar-outline' },
    { id: 'quarterly', name: 'Quarterly Report', description: 'Aggregated payroll data for a quarter', icon: 'stats-chart-outline' },
    { id: 'yearly', name: 'Annual Summary', description: 'Complete year-end payroll summary', icon: 'analytics-outline' },
    { id: 'employee', name: 'Employee-wise Report', description: 'Individual salary statements for all employees', icon: 'people-outline' }
  ];

  exportFormats = [
    { id: 'xlsx', name: 'Excel (.xlsx)', icon: 'document-outline' },
    { id: 'pdf', name: 'PDF Document', icon: 'document-text-outline' },
    { id: 'csv', name: 'CSV File', icon: 'grid-outline' }
  ];

  // Stats
  quickStats: QuickStat[] = [];
  recentPayrolls: PayrollBatchResponse[] = [];

  constructor(
    private payrollService: PayrollService,
    private employeeService: EmployeeService,
    private fileDownloadService: FileDownloadService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (!userInfo?.organizationId) {
      this.notificationService.showError("Organization not found.");
      return;
    }
    this.organizationId = userInfo.organizationId;
    this.populateYears();
    this.populateMonths();
    this.loadQuickStats();
  }

  populateYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];
  }

  populateMonths(): void {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.months = monthNames.map((name, index) => ({ value: index + 1, name }));
  }

  loadQuickStats(): void {
    this.isLoadingStats = true;
    this.payrollService.getPayrollsByYear(this.organizationId, this.selectedYear)
      .pipe(finalize(() => this.isLoadingStats = false))
      .subscribe({
        next: (payrolls) => {
          this.recentPayrolls = payrolls.slice(0, 5);

          const totalPaid = payrolls
            .filter(p => p.status === PayrollStatus.COMPLETED || p.status === PayrollStatus.PROCESSED)
            .reduce((sum, p) => sum + p.totalAmount, 0);

          const totalEmployees = payrolls.length > 0 ? payrolls[0].totalEmployees : 0;
          const completedMonths = payrolls.filter(p => p.status === PayrollStatus.COMPLETED || p.status === PayrollStatus.PROCESSED).length;
          const avgMonthly = completedMonths > 0 ? totalPaid / completedMonths : 0;

          this.quickStats = [
            { label: 'Total Payroll YTD', value: this.formatCurrency(totalPaid), icon: 'cash-outline', color: 'green' },
            { label: 'Months Processed', value: completedMonths.toString(), icon: 'calendar-outline', color: 'blue' },
            { label: 'Avg Monthly Payout', value: this.formatCurrency(avgMonthly), icon: 'trending-up-outline', color: 'purple' },
            { label: 'Total Employees', value: totalEmployees.toString(), icon: 'people-outline', color: 'amber' }
          ];
        },
        error: () => {
          this.quickStats = [];
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

  getMonthName(month: number): string {
    return this.months[month - 1]?.name || '';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED':
      case 'PROCESSED': return 'bg-green-500/20 text-green-400';
      case 'PENDING_APPROVAL': return 'bg-amber-500/20 text-amber-400';
      case 'REJECTED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-600 text-slate-300';
    }
  }

  selectReportType(type: string): void {
    this.selectedReportType = type;
  }

  generateReport(): void {
    this.isLoading = true;

    // For now, all report types use the monthly endpoint
    // In a real app, you'd have different backend endpoints for each report type
    this.employeeService.downloadPayrollReport(this.organizationId, this.selectedYear, this.selectedMonth)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (blob) => {
          const reportName = this.getReportFileName();
          this.fileDownloadService.downloadFile(blob, reportName);
          this.notificationService.showSuccess('Report download started successfully.');
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to generate report. Please ensure payroll exists for selected period.');
        }
      });
  }

  getReportFileName(): string {
    const ext = this.exportFormat;
    switch (this.selectedReportType) {
      case 'monthly':
        return `payroll_monthly_${this.selectedYear}_${this.getMonthName(this.selectedMonth)}.${ext}`;
      case 'quarterly':
        return `payroll_Q${this.selectedQuarter}_${this.selectedYear}.${ext}`;
      case 'yearly':
        return `payroll_annual_${this.selectedYear}.${ext}`;
      case 'employee':
        return `payroll_employee_statements_${this.selectedYear}_${this.selectedMonth}.${ext}`;
      default:
        return `payroll_report.${ext}`;
    }
  }

  onYearChange(): void {
    this.loadQuickStats();
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to generate reports.';
    if (err.status === 404) return 'No payroll data found for selected period.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to generate report. Please try again.';
  }
}
