import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ClientPortalService } from '../../../../services/client-portal.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClientDto } from '../../../../models/client-portal.models';
import { LoadingSpinnerComponent } from '../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './profile-management.component.html',
  styleUrls: ['./profile-management.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfileManagementComponent implements OnInit {
  profile: ClientDto | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private clientPortalService: ClientPortalService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.error = null;

    this.clientPortalService.getMyProfile().subscribe({
      next: (profile: ClientDto) => {
        this.profile = profile;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load profile';
        this.isLoading = false;
        this.notificationService.showError(this.error);
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  getStatusColor(status: string): string {
    return status === 'ACTIVE' ? 'text-green-400' : 'text-red-400';
  }
}
