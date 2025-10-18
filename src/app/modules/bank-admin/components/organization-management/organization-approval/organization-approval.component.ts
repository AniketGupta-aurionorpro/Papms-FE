import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrganizationResponseDto } from '../../../../../models/organization.models';
import { LoadingService } from '../../../../../services/loading.service';
import { OrganizationService } from '../../../../../services/organization.service';

@Component({
  selector: 'app-organization-approval',
  templateUrl: './organization-approval.component.html',
  styleUrls: ['./organization-approval.component.css'],
  standalone: false,
})
export class OrganizationApprovalComponent implements OnInit {
  pendingOrganizations: OrganizationResponseDto[] = [];
  isLoading = true;
  error = '';
  searchTerm = '';

  constructor(
    private organizationService: OrganizationService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPendingOrganizations();
  }

  loadPendingOrganizations(): void {
    this.isLoading = true;
    this.organizationService
      .getAllOrganizations(0, 100, 'PENDING_APPROVAL')
      .subscribe({
        next: (response: { content: OrganizationResponseDto[] }) => {
          this.pendingOrganizations = response.content;
          this.isLoading = false;
        },
        error: (error) => {
          this.error =
            error.error?.message || 'Failed to load pending organizations';
          this.isLoading = false;
        },
      });
  }

  onSearchChange(): void {
    // Filtering is handled in getFilteredOrganizations()
  }

  getFilteredOrganizations(): OrganizationResponseDto[] {
    return this.pendingOrganizations.filter(
      (org) =>
        org.companyName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        org.contactEmail.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  viewOrganizationDetails(organizationId: number): void {
    this.router.navigate(['/bank-admin/organizations', organizationId]);
  }

  approveOrganization(organizationId: number): void {
    this.organizationService
      .updateOrganizationStatus(organizationId, 'ACTIVE')
      .subscribe({
        next: () => {
          this.loadPendingOrganizations();
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to approve organization';
        },
      });
  }

  rejectOrganization(organizationId: number): void {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      this.organizationService
        .updateOrganizationStatus(organizationId, 'REJECTED', reason)
        .subscribe({
          next: () => {
            this.loadPendingOrganizations();
          },
          error: (error) => {
            this.error =
              error.error?.message || 'Failed to reject organization';
          },
        });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  getTotalPending(): number {
    return this.pendingOrganizations.length;
  }

  getTotalRequestedAmount(): number {
    return this.pendingOrganizations.reduce(
      (sum, org) => sum + (org.internalBalance || 0),
      0
    );
  }
}
