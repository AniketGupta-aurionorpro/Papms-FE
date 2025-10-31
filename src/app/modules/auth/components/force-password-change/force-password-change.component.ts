import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service'; // <-- IMPORT NOTIFICATION SERVICE

@Component({
  selector: 'app-force-password-change',
  templateUrl: './force-password-change.component.html',
  styleUrls: ['./force-password-change.component.css'],
  standalone: false,
})
export class ForcePasswordChangeComponent implements OnInit {
  forcePasswordForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService // <-- INJECT NOTIFICATION SERVICE
  ) {
    this.forcePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // No longer need returnUrl
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }

  onSubmit(): void {
    if (this.forcePasswordForm.valid) {
      this.isLoading = true;
      this.error = '';

      const forceChangeData = {
        newPassword: this.forcePasswordForm.get('newPassword')?.value,
        confirmPassword: this.forcePasswordForm.get('confirmPassword')?.value
      };

      this.authService.forceChangePassword(forceChangeData).subscribe({
        next: (response) => {
          this.isLoading = false;

          // --- NEW LOGIC ---
          // 1. Log the user out to clear the old token
          this.authService.logout();

          // 2. Show a success message
          this.notificationService.showSuccess('Password updated successfully. Please log in with your new password.');

          // 3. Redirect to the login page
          this.router.navigate(['/auth/login']);
          // --- END NEW LOGIC ---
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error?.message || 'Password change failed. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forcePasswordForm.controls).forEach(key => {
      this.forcePasswordForm.get(key)?.markAsTouched();
    });
  }

  get newPassword() { return this.forcePasswordForm.get('newPassword'); }
  get confirmPassword() { return this.forcePasswordForm.get('confirmPassword'); }
}
