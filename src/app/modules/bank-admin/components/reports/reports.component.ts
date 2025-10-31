import { Component, OnInit } from '@angular/core';
import { OrganizationService } from '../../../../services/organization.service';
import { OrganizationResponseDto } from '../../../../models/organization.models';
import { BankAdminReportService, ReportRequest } from '../../../../services/bank-admin-report.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  standalone: false
})
export class ReportsComponent implements OnInit {
  isLoading = false;
  error = '';
  selectedReportType = 'TRANSACTION_REPORT';
  dateRange = 'LAST_30_DAYS';
  organizationId: number | 'ALL' = 'ALL';

  reportTypes = [
    { value: 'TRANSACTION_REPORT', label: 'Transaction Report', icon: 'swap-horizontal-outline' },
    { value: 'PAYROLL_REPORT', label: 'Payroll Report', icon: 'cash-outline' },
    { value: 'ORGANIZATION_REPORT', label: 'Organization Report', icon: 'business-outline' },
    { value: 'EMPLOYEE_REPORT', label: 'Employee Report', icon: 'people-outline' },
    { value: 'VENDOR_REPORT', label: 'Vendor Report', icon: 'pricetags-outline' }
  ];

  dateRanges = [
    { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
    { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { value: 'LAST_90_DAYS', label: 'Last 90 Days' },
    { value: 'THIS_MONTH', label: 'This Month' },
    { value: 'LAST_MONTH', label: 'Last Month' },
    { value: 'CUSTOM', label: 'Custom Range' }
  ];

  organizations: OrganizationResponseDto[] = [];
  customStartDate: string = '';
  customEndDate: string = '';

  constructor(
    private organizationService: OrganizationService,
    private reportService: BankAdminReportService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  isDateRangeDisabled(): boolean {
    const disabledTypes = ['ORGANIZATION_REPORT', 'EMPLOYEE_REPORT', 'VENDOR_REPORT'];
    return disabledTypes.includes(this.selectedReportType);
  }

  isOrganizationDisabled(): boolean {
    return this.selectedReportType === 'ORGANIZATION_REPORT';
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganizations(0, 1000).subscribe({
      next: (response) => {
        this.organizations = response.content || [];
      },
      error: (error) => {
        this.error = 'Failed to load organizations';
        this.notificationService.showError(this.error);
      }
    });
  }

  generateReport(): void {
    this.isLoading = true;
    this.error = '';

    const [startDate, endDate] = this.calculateDateRange();

    const request: ReportRequest = {
      reportType: this.selectedReportType,
      organizationId: this.isOrganizationDisabled() ? 'ALL' : this.organizationId,
      startDate: this.isDateRangeDisabled() ? null : startDate,
      endDate: this.isDateRangeDisabled() ? null : endDate,
    };

    this.reportService.generateReport(request).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (blob) => {
        this.downloadFile(blob, `${request.reportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.notificationService.showSuccess('Report generated and download started.');
      },
      error: (err) => {
        this.error = 'Failed to generate the report. Please try again.';
        this.notificationService.showError(this.error);
        console.error(err);
      }
    });
  }

  private calculateDateRange(): [string | null, string | null] {
    if (this.isDateRangeDisabled()) {
      return [null, null];
    }

    if (this.dateRange === 'CUSTOM') {
      return [this.customStartDate || null, this.customEndDate || null];
    }

    const today = new Date();
    let startDate = new Date();

    switch (this.dateRange) {
      case 'LAST_7_DAYS':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'LAST_30_DAYS':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'LAST_90_DAYS':
        startDate.setDate(today.getDate() - 90);
        break;
      case 'THIS_MONTH':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'LAST_MONTH':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return [this.formatDate(startDate), this.formatDate(lastDayLastMonth)];
    }
    return [this.formatDate(startDate), this.formatDate(today)];
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private downloadFile(data: Blob, filename: string): void {
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  getReportIcon(type: string): string {
    return this.reportTypes.find(t => t.value === type)?.icon || 'document-outline';
  }
}
