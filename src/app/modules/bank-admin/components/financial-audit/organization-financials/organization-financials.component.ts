import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FinancialSummaryDto } from '../../../../../models/financial-summary.models';
import { OrganizationResponseDto } from '../../../../../models/organization.models';
import { BankAdminService } from '../../../../../services/bank-admin.service';
import { LoadingService } from '../../../../../services/loading.service';
import { OrganizationService } from '../../../../../services/organization.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-organization-financials',
  templateUrl: './organization-financials.component.html',
  styleUrls: ['./organization-financials.component.css'],
  standalone: false,
})
export class OrganizationFinancialsComponent implements OnInit {
  organizations: OrganizationResponseDto[] = [];
  financialSummaries: Map<number, FinancialSummaryDto> = new Map();
  isLoading = true;
  error = '';
  searchTerm = '';
  statusFilter = 'ALL';

  statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'PENDING_APPROVAL', label: 'Pending' },
  ];

  sortBy = 'balance';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Financial health stats
  healthyOrganizationsCount = 0;
  lowBalanceOrganizationsCount = 0;
  zeroBalanceOrganizationsCount = 0;
  pendingApprovalCount = 0;

  constructor(
    private organizationService: OrganizationService,
    private bankAdminService: BankAdminService,
    private loadingService: LoadingService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.isLoading = true;
    this.organizationService.getAllOrganizations().subscribe({
      next: (organizations) => {
        this.organizations = organizations;
        this.loadFinancialSummaries();
      },
      error: (error) => {
        this.error = this.extractErrorMessage(error);
        this.notificationService.showError(this.error);
        this.isLoading = false;
        this.organizations = [];
      },
    });
  }

  loadFinancialSummaries(): void {
    const summaryPromises = this.organizations.map((org) =>
      this.bankAdminService.getFinancialSummary(org.id).toPromise()
    );

    Promise.all(summaryPromises)
      .then((summaries) => {
        summaries.forEach((summary, index) => {
          if (summary) {
            this.financialSummaries.set(this.organizations[index].id, summary);
          }
        });
        this.calculateFinancialHealthStats();
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = 'Failed to load financial summaries';
        this.notificationService.showError(this.error);
        this.isLoading = false;
      });
  }

  calculateFinancialHealthStats(): void {
    this.healthyOrganizationsCount = this.organizations.filter(
      (org) =>
        org.status === 'ACTIVE' && this.getOrganizationBalance(org.id) > 10000
    ).length;

    this.lowBalanceOrganizationsCount = this.organizations.filter(
      (org) =>
        this.getOrganizationBalance(org.id) < 5000 &&
        this.getOrganizationBalance(org.id) > 0
    ).length;

    this.zeroBalanceOrganizationsCount = this.organizations.filter(
      (org) => this.getOrganizationBalance(org.id) <= 0
    ).length;

    this.pendingApprovalCount = this.organizations.filter(
      (org) => org.status === 'PENDING_APPROVAL'
    ).length;
  }

  getOrganizationBalance(organizationId: number): number {
    const summary = this.financialSummaries.get(organizationId);
    return summary?.currentBalance || 0;
  }

  getFilteredOrganizations(): OrganizationResponseDto[] {
    let filtered = this.organizations.filter((org) => {
      const matchesSearch =
        org.companyName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        org.contactEmail.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        this.statusFilter === 'ALL' || org.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort organizations
    filtered.sort((a, b) => {
      const valueA = this.getSortValue(a);
      const valueB = this.getSortValue(b);

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortOrder === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Fallback for mixed types
      return 0;
    });

    return filtered;
  }

  getSortValue(org: OrganizationResponseDto): string | number {
    const summary = this.financialSummaries.get(org.id);

    switch (this.sortBy) {
      case 'balance':
        return summary?.currentBalance || org.internalBalance || 0;
      case 'credits':
        return summary?.totalCredits || 0;
      case 'debits':
        return summary?.totalDebits || 0;
      case 'transactions':
        return summary?.totalTransactions || 0;
      case 'name':
        return org.companyName.toLowerCase();
      default:
        return 0;
    }
  }

  onSearchChange(): void {
    // Filtering is handled in getFilteredOrganizations()
  }

  onStatusFilterChange(): void {
    // Filtering is handled in getFilteredOrganizations()
  }

  onSortChange(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'desc';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING_APPROVAL':
        return 'bg-amber-100 text-amber-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'checkmark-circle-outline';
      case 'PENDING_APPROVAL':
        return 'time-outline';
      case 'SUSPENDED':
        return 'pause-circle-outline';
      case 'REJECTED':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  }

  viewOrganizationDetails(organizationId: number): void {
    this.router.navigate(['/bank-admin/organizations', organizationId]);
  }

  viewTransactionAudit(organizationId: number): void {
    this.router.navigate([
      '/bank-admin/financial-audit/transactions',
      organizationId,
    ]);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  getTotalBalance(): number {
    return this.organizations.reduce((sum, org) => {
      return sum + this.getOrganizationBalance(org.id);
    }, 0);
  }

  getTotalCredits(): number {
    return Array.from(this.financialSummaries.values()).reduce(
      (sum, summary) => sum + (summary?.totalCredits || 0),
      0
    );
  }

  getTotalDebits(): number {
    return Array.from(this.financialSummaries.values()).reduce(
      (sum, summary) => sum + (summary?.totalDebits || 0),
      0
    );
  }

  getTotalTransactions(): number {
    return Array.from(this.financialSummaries.values()).reduce(
      (sum, summary) => sum + (summary?.totalTransactions || 0),
      0
    );
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) return 'swap-vertical-outline';
    return this.sortOrder === 'asc' ? 'arrow-up-outline' : 'arrow-down-outline';
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view financial data.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load organization financials. Please try again.';
  }
}
