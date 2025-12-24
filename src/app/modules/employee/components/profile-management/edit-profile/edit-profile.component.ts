import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { EmployeeDashboardService } from '../../../../../services/employee-dashboard.service';
import { EmployeeService } from '../../../../../services/employee.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CompleteEmployeeResponse } from '../../../../../models/employee-dashboard.models';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  standalone: false
})
export class EditProfileComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  isChangingPassword = false;
  error = '';
  profile: CompleteEmployeeResponse | null = null;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  activeTab: 'profile' | 'password' = 'profile';

  constructor(
    private fb: FormBuilder,
    private employeeDashboardService: EmployeeDashboardService,
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  loadProfile(): void {
    this.isLoading = true;
    this.error = '';

    this.employeeDashboardService.getMyDashboard()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.profile = data.employeeProfile;
          this.profileForm.patchValue({
            fullName: this.profile.fullName,
            email: this.profile.email,
          });
        },
        error: (err) => {
          this.error = 'Failed to load profile';
          this.notificationService.showError(this.error);
        }
      });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.profile) return;

    this.isSaving = true;
    const request = {
      fullName: this.profileForm.value.fullName,
      email: this.profileForm.value.email,
      department: this.profile.department,
      jobTitle: this.profile.jobTitle,
      bankAccount: this.profile.bankAccount ? {
        accountHolderName: this.profile.bankAccount.accountHolderName,
        accountNumber: this.profile.bankAccount.accountNumber,
        bankName: this.profile.bankAccount.bankName,
        ifscCode: this.profile.bankAccount.ifscCode
      } : null
    };

    this.employeeService.updateEmployeeProfile(this.profile.id, request as any)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Profile updated successfully!');
          this.router.navigate(['/employee/profile']);
        },
        error: (err) => {
          this.notificationService.showError('Failed to update profile');
        }
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || !this.profile) return;

    this.isChangingPassword = true;
    const request = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };

    this.employeeService.changePassword(this.profile.id, request)
      .pipe(finalize(() => this.isChangingPassword = false))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Password changed successfully!');
          this.passwordForm.reset();
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to change password');
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/employee/profile']);
  }

  setActiveTab(tab: 'profile' | 'password'): void {
    this.activeTab = tab;
  }
}
