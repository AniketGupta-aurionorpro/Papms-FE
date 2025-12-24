import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  standalone: false
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  error = '';
  success = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = false;

    this.authService.forgotPassword(this.forgotPasswordForm.value).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response: string) => {
        console.log('Forgot password response:', response);
        this.success = true;
        this.notificationService.showSuccess('Password reset instructions have been sent to your email.');
      },
      error: (err) => {
        console.error('Forgot password error:', err);

        // For security, show the same success message even if the user doesn't exist
        if (err.status === 404 || err.status === 400) {
          this.success = true;
          this.notificationService.showInfo('If this email is registered, you will receive password reset instructions.');
        } else if (err.error?.message) {
          this.error = err.error.message;
          this.notificationService.showError(this.error);
        } else if (err.message) {
          this.error = err.message;
          this.notificationService.showError(this.error);
        } else {
          this.error = 'An unexpected error occurred. Please try again later.';
          this.notificationService.showError(this.error);
        }
      }
    });
  }

  get email() { return this.forgotPasswordForm.get('email'); }
}
