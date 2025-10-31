import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { OrganizationResponseDto } from '../../../../../models/organization.models';
import { OrganizationService } from '../../../../../services/organization.service';
import { PayrollService } from '../../../../../services/payroll.service';


@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.css'],
  standalone: false,
})
export class OrganizationListComponent implements OnInit {
  organizations: OrganizationResponseDto[] = [];
  filteredOrganizations: OrganizationResponseDto[] = [];
  isLoading = true;
  error = '';
  searchTerm = '';

  // Store pending payroll counts with organization ID as the key
  pendingPayrollCounts: Map<number, number> = new Map();

  constructor(
    private organizationService: OrganizationService,
    private payrollService: PayrollService, // Injected PayrollService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = '';

    // Use forkJoin to fetch organizations and payroll counts in parallel
    forkJoin({
      orgsPage: this.organizationService.getAllOrganizations(0, 1000), // Fetch a large number to get all orgs
      pendingCounts: this.payrollService.getPendingPayrollCounts()
    }).pipe(
      map(({ orgsPage, pendingCounts }) => {
        // Convert the pendingCounts object to a Map
        const countsMap = new Map<number, number>();
        for (const key in pendingCounts) {
          if (Object.prototype.hasOwnProperty.call(pendingCounts, key)) {
            countsMap.set(Number(key), pendingCounts[key]);
          }
        }
        return { organizations: orgsPage.content, pendingCounts: countsMap };
      })
    ).subscribe({
      next: ({ organizations, pendingCounts }) => {
        this.organizations = organizations;
        this.filteredOrganizations = organizations;
        this.pendingPayrollCounts = pendingCounts;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load organization data. Please try again later.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.searchTerm) {
      this.filteredOrganizations = this.organizations;
      return;
    }
    this.filteredOrganizations = this.organizations.filter(org =>
      org.companyName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  viewOrganization(organizationId: number): void {
    this.router.navigate(['/bank-admin/organizations', organizationId]);
  }

  // Helper to get pending count for a specific organization
  getPendingCountForOrg(orgId: number): number {
    return this.pendingPayrollCounts.get(orgId) || 0;
  }

  // Helper to get initials from a company name
  getInitials(name: string): string {
    if (!name) return '??';
    const words = name.split(' ').filter(Boolean);
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400';
      case 'PENDING_APPROVAL':
        return 'bg-amber-500/20 text-amber-400';
      case 'SUSPENDED':
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-600 text-slate-300';
    }
  }
}
