import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { OrganizationService } from '../../../../services/organization.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { OrganizationProfileResponse, FinancialSummaryDto } from '../../../../models/organization.models';

@Component({
  selector: 'app-organization-profile',
  templateUrl: './organization-profile.component.html',
  styleUrls: ['./organization-profile.component.css'],
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrganizationProfileComponent implements OnInit {
  isLoading = true;
  isUploadingLogo = false;
  error = '';
  profile: OrganizationProfileResponse | null = null;
  financialSummary: FinancialSummaryDto | null = null;
  organizationId: number | null = null;

  constructor(
    private organizationService: OrganizationService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (userInfo?.organizationId) {
      this.organizationId = userInfo.organizationId;
      this.loadProfile();
      this.loadFinancialSummary();
    } else {
      this.error = 'Could not determine organization ID';
      this.isLoading = false;
    }
  }

  loadProfile(): void {
    if (!this.organizationId) return;

    this.isLoading = true;
    this.error = '';

    this.organizationService.getOrganizationProfile(this.organizationId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.profile = data;
        },
        error: (err) => {
          this.error = this.extractErrorMessage(err);
          this.notificationService.showError(this.error);
        }
      });
  }

  loadFinancialSummary(): void {
    if (!this.organizationId) return;

    this.organizationService.getFinancialSummary(this.organizationId)
      .subscribe({
        next: (data) => {
          this.financialSummary = data;
        },
        error: (err) => {
          console.error('Failed to load financial summary:', err);
        }
      });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadLogo(input.files[0]);
    }
  }

  uploadLogo(file: File): void {
    this.isUploadingLogo = true;
    this.organizationService.uploadLogo(file)
      .pipe(finalize(() => this.isUploadingLogo = false))
      .subscribe({
        next: (updatedProfile) => {
          this.profile = updatedProfile;
          this.notificationService.showSuccess('Logo updated successfully!');
          // Refresh the page to update the sidebar logo
          window.location.reload();
        },
        error: (err) => {
          const errorMessage = this.extractErrorMessage(err);
          this.notificationService.showError(errorMessage || 'Failed to upload logo');
        }
      });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'O';
    const words = name.split(' ').filter(Boolean);
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-900/50 text-green-400 border-green-700/50';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700/50';
      case 'SUSPENDED':
        return 'bg-red-900/50 text-red-400 border-red-700/50';
      default:
        return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
    }
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to perform this action.';
    return 'An unexpected error occurred. Please try again.';
  }
}
