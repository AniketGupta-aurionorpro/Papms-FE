import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationResponseDtowithEmployee } from '../../../../../models/organization.models';
import { LoadingService } from '../../../../../services/loading.service';
import { OrganizationService } from '../../../../../services/organization.service';

@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.css'],
  standalone: false,
})
export class OrganizationDetailsComponent implements OnInit {
  organization: OrganizationResponseDtowithEmployee | null = null;
  isLoading = true;
  error = '';
  activeTab = 'overview';

  tabs = [
    { id: 'overview', label: 'Overview', icon: 'information-circle-outline' },
    { id: 'employees', label: 'Employees', icon: 'people-outline' },
    { id: 'documents', label: 'Documents', icon: 'document-text-outline' },
    { id: 'financial', label: 'Financial', icon: 'cash-outline' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    const organizationId = this.route.snapshot.paramMap.get('id');
    if (organizationId) {
      this.loadOrganizationDetails(+organizationId);
    } else {
      this.router.navigate(['/bank-admin/organizations']);
    }
  }

  loadOrganizationDetails(organizationId: number): void {
    this.isLoading = true;
    this.organizationService.getOrganizationWithEmployees(organizationId).subscribe({
      next: (organization) => {
        this.organization = organization;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load organization details';
        this.isLoading = false;
      }
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

  approveOrganization(): void {
    if (this.organization) {
      this.organizationService.updateOrganizationStatus(this.organization.id, 'ACTIVE').subscribe({
        next: () => {
          this.loadOrganizationDetails(this.organization!.id);
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to approve organization';
        }
      });
    }
  }

  suspendOrganization(): void {
    if (this.organization) {
      this.organizationService.updateOrganizationStatus(this.organization.id, 'SUSPENDED').subscribe({
        next: () => {
          this.loadOrganizationDetails(this.organization!.id);
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to suspend organization';
        }
      });
    }
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  goBack(): void {
    this.router.navigate(['/bank-admin/organizations']);
  }

  // Helper method to get employee initials
  getEmployeeInitials(employeeName: string): string {
    if (!employeeName) return '??';
    return employeeName.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
