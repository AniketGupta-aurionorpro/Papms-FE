import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationService } from '../../../../services/organization.service';
import { PayrollService } from '../../../../services/payroll.service';
import { TransactionService } from '../../../../services/transaction.service';
import { LoadingService } from '../../../../services/loading.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  standalone: false,
})
export class ReportsComponent implements OnInit {
  isLoading = false;
  error = '';
  selectedReportType = 'FINANCIAL_SUMMARY';
  dateRange = 'LAST_30_DAYS';
  organizationId = 'ALL';

  reportTypes = [
    { value: 'FINANCIAL_SUMMARY', label: 'Financial Summary', icon: 'analytics-outline' },
    { value: 'PAYROLL_REPORT', label: 'Payroll Report', icon: 'cash-outline' },
    { value: 'TRANSACTION_REPORT', label: 'Transaction Report', icon: 'swap-horizontal-outline' },
    { value: 'ORGANIZATION_REPORT', label: 'Organization Report', icon: 'business-outline' }
  ];

  dateRanges = [
    { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
    { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { value: 'LAST_90_DAYS', label: 'Last 90 Days' },
    { value: 'THIS_MONTH', label: 'This Month' },
    { value: 'LAST_MONTH', label: 'Last Month' },
    { value: 'THIS_QUARTER', label: 'This Quarter' },
    { value: 'THIS_YEAR', label: 'This Year' }
  ];

  organizations: any[] = [
    { id: 'ALL', name: 'All Organizations' },
    { id: '1', name: 'Tech Solutions Inc' },
    { id: '2', name: 'Global Services Ltd' },
    { id: '3', name: 'Innovate Corp' }
  ];

  generatedReports: any[] = [
    {
      id: 1,
      name: 'Financial Summary - November 2024',
      type: 'FINANCIAL_SUMMARY',
      generatedAt: '2024-11-20T10:30:00Z',
      size: '2.4 MB',
      status: 'COMPLETED'
    },
    {
      id: 2,
      name: 'Payroll Report - October 2024',
      type: 'PAYROLL_REPORT',
      generatedAt: '2024-10-31T14:45:00Z',
      size: '1.8 MB',
      status: 'COMPLETED'
    },
    {
      id: 3,
      name: 'Transaction Audit - Q3 2024',
      type: 'TRANSACTION_REPORT',
      generatedAt: '2024-09-30T09:15:00Z',
      size: '3.2 MB',
      status: 'COMPLETED'
    }
  ];

  constructor(
    private organizationService: OrganizationService,
    private payrollService: PayrollService,
    private transactionService: TransactionService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    // In a real app, load organizations from service
  }

  generateReport(): void {
    this.isLoading = true;

    // Simulate report generation
    setTimeout(() => {
      const newReport = {
        id: this.generatedReports.length + 1,
        name: `${this.getReportTypeLabel()} - ${new Date().toLocaleDateString()}`,
        type: this.selectedReportType,
        generatedAt: new Date().toISOString(),
        size: '1.5 MB',
        status: 'COMPLETED'
      };

      this.generatedReports.unshift(newReport);
      this.isLoading = false;

      // Show success message
      this.error = '';
    }, 2000);
  }

  downloadReport(report: any): void {
    // Implement download logic based on report type
    switch (report.type) {
      case 'PAYROLL_REPORT':
        this.downloadPayrollReport();
        break;
      case 'TRANSACTION_REPORT':
        this.downloadTransactionReport();
        break;
      default:
        this.downloadFinancialReport();
    }
  }

  downloadPayrollReport(): void {
    // if (this.organizationId !== 'ALL') {
    //   this.payrollService.downloadPayrollReport(+this.organizationId, 2024, 11).subscribe({
    //     next: (blob) => {
    //       this.handleDownload(blob, 'payroll-report.xlsx');
    //     },
    //     error: (error) => {
    //       this.error = 'Failed to download payroll report';
    //     }
    //   });
    // }
  }

  downloadTransactionReport(): void {
    if (this.organizationId !== 'ALL') {
      this.transactionService.downloadTransactionReport(+this.organizationId).subscribe({
        next: (blob) => {
          this.handleDownload(blob, 'transaction-report.xlsx');
        },
        error: (error) => {
          this.error = 'Failed to download transaction report';
        }
      });
    }
  }

  downloadFinancialReport(): void {
    // Implement financial report download
    const blob = new Blob(['Financial Report Data'], { type: 'application/vnd.ms-excel' });
    this.handleDownload(blob, 'financial-report.xlsx');
  }

  handleDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getReportTypeLabel(): string {
    const type = this.reportTypes.find(t => t.value === this.selectedReportType);
    return type ? type.label : 'Report';
  }

  getReportIcon(type: string): string {
    const reportType = this.reportTypes.find(t => t.value === type);
    return reportType ? reportType.icon : 'document-outline';
  }

  getStatusColor(status: string): string {
    return status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';
  }

  getStatusIcon(status: string): string {
    return status === 'COMPLETED' ? 'checkmark-circle-outline' : 'time-outline';
  }

  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
