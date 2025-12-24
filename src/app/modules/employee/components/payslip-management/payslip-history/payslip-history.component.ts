import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { EmployeeService } from '../../../../../services/employee.service';
import { EmployeeDashboardService } from '../../../../../services/employee-dashboard.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { MyPayslipHistoryDto } from '../../../../../models/employee.models';

@Component({
  selector: 'app-payslip-history',
  templateUrl: './payslip-history.component.html',
  styleUrls: ['./payslip-history.component.css'],
  standalone: false
})
export class PayslipHistoryComponent implements OnInit {
  isLoading = true;
  error = '';
  payslips: MyPayslipHistoryDto[] = [];
  filteredPayslips: MyPayslipHistoryDto[] = [];
  organizationId = 0;

  // Filters
  selectedYear: number | null = null;
  selectedMonth: number | null = null;
  availableYears: number[] = [];
  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private employeeService: EmployeeService,
    private employeeDashboardService: EmployeeDashboardService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadOrganizationAndPayslips();
  }

  loadOrganizationAndPayslips(): void {
    this.employeeDashboardService.getMyDashboard().subscribe({
      next: (data) => {
        this.organizationId = data.employeeProfile.organizationId;
        this.loadPayslips();
      },
      error: (err) => {
        this.error = 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

  loadPayslips(): void {
    this.isLoading = true;
    this.error = '';

    this.employeeService.getMyPayslipHistory(this.currentPage, this.pageSize)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: any) => {
          // Sort payslips in descending order (newest first)
          this.payslips = (response.content || []).sort((a: MyPayslipHistoryDto, b: MyPayslipHistoryDto) => {
            if (a.payrollYear !== b.payrollYear) {
              return b.payrollYear - a.payrollYear;
            }
            return b.payrollMonth - a.payrollMonth;
          });

          // Extract available years for filter
          const years = new Set<number>();
          this.payslips.forEach(p => years.add(p.payrollYear));
          this.availableYears = Array.from(years).sort((a, b) => b - a);

          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.applyFilters();
        },
        error: (err) => {
          this.error = 'Failed to load payslip history';
          this.notificationService.showError(this.error);
        }
      });
  }

  applyFilters(): void {
    let result = [...this.payslips];

    // Year filter
    if (this.selectedYear !== null) {
      result = result.filter(p => p.payrollYear === this.selectedYear);
    }

    // Month filter
    if (this.selectedMonth !== null) {
      result = result.filter(p => p.payrollMonth === this.selectedMonth);
    }

    this.filteredPayslips = result;
  }

  onYearChange(year: string): void {
    this.selectedYear = year ? parseInt(year, 10) : null;
    this.applyFilters();
  }

  onMonthChange(month: string): void {
    this.selectedMonth = month ? parseInt(month, 10) : null;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedYear = null;
    this.selectedMonth = null;
    this.applyFilters();
  }

  viewPayslip(paymentId: number): void {
    this.router.navigate(['/employee/payslips', paymentId]);
  }

  downloadPayslip(paymentId: number, event: Event): void {
    event.stopPropagation();

    this.employeeService.downloadPayslip(paymentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip-${paymentId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.showSuccess('Payslip downloaded successfully!');
      },
      error: (err) => {
        this.notificationService.showError('Failed to download payslip');
      }
    });
  }

  getMonthName(month: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
        return 'bg-green-900/50 text-green-400 border-green-700/50';
      case 'PENDING':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700/50';
      case 'FAILED':
        return 'bg-red-900/50 text-red-400 border-red-700/50';
      default:
        return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
    }
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPayslips();
    }
  }

  get pages(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    let startPage = Math.max(0, this.currentPage - 2);
    let endPage = Math.min(this.totalPages - 1, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(0, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
