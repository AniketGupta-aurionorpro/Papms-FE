import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { EmployeeDashboardService } from '../../../../../services/employee-dashboard.service';
import { EmployeeService } from '../../../../../services/employee.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CompleteEmployeeResponse } from '../../../../../models/employee-dashboard.models';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
  standalone: false
})
export class MyProfileComponent implements OnInit {
  isLoading = true;
  error = '';
  profile: CompleteEmployeeResponse | null = null;
  selectedFile: File | null = null;
  isUploadingPicture = false;

  constructor(
    private employeeDashboardService: EmployeeDashboardService,
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.error = '';

    this.employeeDashboardService.getMyDashboard()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.profile = data.employeeProfile;
        },
        error: (err) => {
          this.error = this.extractErrorMessage(err);
          this.notificationService.showError(this.error);
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.uploadProfilePicture();
    }
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile || !this.profile) return;

    this.isUploadingPicture = true;
    this.employeeService.uploadProfilePicture(
      this.profile.organizationId,
      this.profile.id,
      this.selectedFile
    )
      .pipe(finalize(() => this.isUploadingPicture = false))
      .subscribe({
        next: (updatedProfile) => {
          this.profile = updatedProfile;
          this.notificationService.showSuccess('Profile picture updated successfully!');
          this.selectedFile = null;
        },
        error: (err) => {
          this.notificationService.showError('Failed to upload profile picture');
        }
      });
  }

  navigateToEdit(): void {
    this.router.navigate(['/employee/profile/edit']);
  }

  navigateToBankAccount(): void {
    this.router.navigate(['/employee/profile/bank-account']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view this profile.';
    return 'Failed to load profile. Please try again.';
  }
}
