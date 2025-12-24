import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { PayrollService } from '../../../../../services/payroll.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { PayrollBatchResponse, PayrollPreviewItem, SalaryOverride } from '../../../../../models/payroll.models';

interface Month {
  value: number;
  name: string;
  isCompleted: boolean;
}

@Component({
  selector: 'app-create-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './create-payroll.component.html',
  styleUrls: ['./create-payroll.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreatePayrollComponent implements OnInit {
  organizationId!: number;
  isLoading = false;
  yearIsLoading = false;
  previewLoading = false;
  error: string | null = null;

  // Step management: 'select' | 'preview'
  currentStep: 'select' | 'preview' = 'select';

  selectedYear: number = new Date().getFullYear();
  selectedMonth: number | null = null;
  years: number[] = [];
  months: Month[] = [];

  // Preview data
  previewData: PayrollPreviewItem[] = [];
  originalData: PayrollPreviewItem[] = []; // Store original values for comparison

  // Search, Filter, Pagination
  searchQuery = '';
  selectedDepartment = 'ALL';
  departments: string[] = [];
  showOnlyModified = false;

  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private payrollService: PayrollService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (!userInfo || !userInfo.organizationId) {
      this.error = 'Could not identify your organization.';
      this.isLoading = false;
      return;
    }
    this.organizationId = userInfo.organizationId;
    this.populateYears();
    this.initializeMonths();
    this.onYearChange();
  }

  populateYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = [
      currentYear + 1,
      currentYear,
      currentYear - 1,
      currentYear - 2,
      currentYear - 3
    ];
    this.selectedYear = currentYear;
  }

  initializeMonths(): void {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.months = monthNames.map((name, index) => ({
      value: index + 1,
      name: name,
      isCompleted: false
    }));
  }

  onYearChange(): void {
    this.yearIsLoading = true;
    this.selectedMonth = null;
    this.payrollService.getPayrollsByYear(this.organizationId, this.selectedYear)
      .pipe(finalize(() => this.yearIsLoading = false))
      .subscribe({
        next: (completedPayrolls: PayrollBatchResponse[]) => {
          const completedMonths = new Set(completedPayrolls.map(p => p.payrollMonth));
          this.months.forEach(month => {
            month.isCompleted = completedMonths.has(month.value);
          });
        },
        error: (err) => {
          this.notificationService.showError("Could not fetch payroll history for the selected year.");
        }
      });
  }

  selectMonth(month: Month): void {
    if (!month.isCompleted) {
      this.selectedMonth = month.value;
    }
  }

  // Step 1 → Step 2: Load preview
  loadPreview(): void {
    if (!this.selectedMonth) {
      this.notificationService.showWarning("Please select a month to prepare the payroll.");
      return;
    }

    this.previewLoading = true;
    this.payrollService.getPayrollPreview(this.organizationId, this.selectedMonth, this.selectedYear)
      .pipe(finalize(() => this.previewLoading = false))
      .subscribe({
        next: (data) => {
          this.previewData = data.map(item => ({ ...item, isModified: false }));
          this.originalData = JSON.parse(JSON.stringify(data)); // Deep copy for comparison
          this.extractDepartments();
          this.resetFilters();
          this.currentStep = 'preview';
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to load payroll preview.');
        }
      });
  }

  // Extract unique departments for filter dropdown
  extractDepartments(): void {
    const deptSet = new Set(this.previewData.map(item => item.department || 'Unassigned'));
    this.departments = ['ALL', ...Array.from(deptSet).sort()];
  }

  // Reset filters
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedDepartment = 'ALL';
    this.showOnlyModified = false;
    this.currentPage = 1;
  }

  // Filter and search logic
  get filteredData(): PayrollPreviewItem[] {
    let result = this.previewData;

    // Search by name or code
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(item =>
        item.employeeName.toLowerCase().includes(query) ||
        item.employeeCode.toLowerCase().includes(query)
      );
    }

    // Filter by department
    if (this.selectedDepartment !== 'ALL') {
      result = result.filter(item => (item.department || 'Unassigned') === this.selectedDepartment);
    }

    // Show only modified
    if (this.showOnlyModified) {
      result = result.filter(item => item.isModified);
    }

    return result;
  }

  // Paginated data
  get paginatedData(): PayrollPreviewItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];

    // Show max 5 pages
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
    this.currentPage = 1; // Reset to first page on filter change
  }

  // Step 2: Go back to step 1
  goBackToSelect(): void {
    this.currentStep = 'select';
    this.previewData = [];
  }

  // Update salary field and recalculate totals
  onSalaryChange(item: PayrollPreviewItem): void {
    // Recalculate totals
    item.totalEarnings = item.basicSalary + item.hra + item.da + item.otherAllowances;
    item.totalDeductions = item.pfContribution;
    item.netSalary = item.totalEarnings - item.totalDeductions;

    // Check if modified from original
    const original = this.originalData.find(o => o.employeeId === item.employeeId);
    if (original) {
      item.isModified = (
        item.basicSalary !== original.basicSalary ||
        item.hra !== original.hra ||
        item.da !== original.da ||
        item.otherAllowances !== original.otherAllowances ||
        item.pfContribution !== original.pfContribution
      );
    }
  }

  // Get modified employees as salary overrides
  getModifiedOverrides(): SalaryOverride[] {
    return this.previewData
      .filter(item => item.isModified)
      .map(item => ({
        employeeId: item.employeeId,
        basicSalary: item.basicSalary,
        hra: item.hra,
        da: item.da,
        otherAllowances: item.otherAllowances,
        pfContribution: item.pfContribution
      }));
  }

  // Calculate totals for summary (using ALL data, not filtered)
  getTotalEarnings(): number {
    return this.previewData.reduce((sum, item) => sum + item.totalEarnings, 0);
  }

  getTotalDeductions(): number {
    return this.previewData.reduce((sum, item) => sum + item.totalDeductions, 0);
  }

  getTotalNetSalary(): number {
    return this.previewData.reduce((sum, item) => sum + item.netSalary, 0);
  }

  getModifiedCount(): number {
    return this.previewData.filter(item => item.isModified).length;
  }

  getMonthName(month: number): string {
    return this.months[month - 1]?.name || '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Step 2: Confirm and submit payroll
  confirmPayroll(): void {
    if (!this.selectedMonth) return;

    this.isLoading = true;
    const overrides = this.getModifiedOverrides();

    this.payrollService.createPayroll(this.organizationId, {
      payrollYear: this.selectedYear,
      payrollMonth: this.selectedMonth,
      salaryOverrides: overrides.length > 0 ? overrides : undefined
    }).pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          const modifiedMsg = overrides.length > 0 ? ` with ${overrides.length} salary adjustments` : '';
          this.notificationService.showSuccess(`Payroll for ${this.getMonthName(this.selectedMonth!)} ${this.selectedYear}${modifiedMsg} has been submitted for approval.`);
          this.router.navigate(['/org-admin/payroll/history']);
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to create payroll batch.');
        }
      });
  }
}

