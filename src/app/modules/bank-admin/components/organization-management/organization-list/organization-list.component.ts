import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrganizationResponseDto } from '../../../../../models/organization.models';
import { LoadingService } from '../../../../../services/loading.service';
import { OrganizationService } from '../../../../../services/organization.service';


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
  statusFilter = 'ALL';

  statusOptions = [
    { value: 'ALL', label: 'All Status', color: 'gray' },
    { value: 'PENDING_APPROVAL', label: 'Pending', color: 'amber' },
    { value: 'ACTIVE', label: 'Active', color: 'green' },
    { value: 'SUSPENDED', label: 'Suspended', color: 'red' },
    { value: 'REJECTED', label: 'Rejected', color: 'red' }
  ];

  constructor(
    private organizationService: OrganizationService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.isLoading = true;
    this.organizationService.getAllOrganizations().subscribe({
      next: (organizations) => {
        this.organizations = organizations;
        this.filteredOrganizations = organizations;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load organizations';
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredOrganizations = this.organizations.filter(org => {
      const matchesSearch = org.companyName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           org.contactEmail.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === 'ALL' || org.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
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

  viewOrganization(organizationId: number): void {
    this.router.navigate(['/bank-admin/organizations', organizationId]);
  }

  approveOrganization(organizationId: number): void {
    this.organizationService.updateOrganizationStatus(organizationId, 'ACTIVE').subscribe({
      next: () => {
        this.loadOrganizations();
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to approve organization';
      }
    });
  }

  rejectOrganization(organizationId: number): void {
    this.organizationService.updateOrganizationStatus(organizationId, 'REJECTED', 'Manual rejection by admin').subscribe({
      next: () => {
        this.loadOrganizations();
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to reject organization';
      }
    });
  }

  getTotalCount(): number {
    return this.organizations.length;
  }

  getActiveCount(): number {
    return this.organizations.filter(org => org.status === 'ACTIVE').length;
  }

  getPendingCount(): number {
    return this.organizations.filter(org => org.status === 'PENDING_APPROVAL').length;
  }
}
