import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: false
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  error = '';
  success = false;
  token = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Read the 'token' from the URL query parameters
    this.token = this.route.snapshot.queryParams['token'] || '';

    // Also check for token in fragment or other common locations
    if (!this.token) {
      this.token = this.route.snapshot.fragment?.split('token=')[1] || '';
    }

    if (!this.token) {
      this.error = 'Invalid or missing password reset link. Please request a new one.';
      console.error('No token found in URL');
    } else {
      console.log('Token found:', this.token.substring(0, 10) + '...');
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }

    return newPassword?.value === confirmPassword?.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    if (!this.token) {
      this.error = 'Invalid reset token. Please request a new password reset link.';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = false;

    const resetData = {
      token: this.token,
      newPassword: this.resetPasswordForm.get('newPassword')?.value,
      confirmPassword: this.resetPasswordForm.get('confirmPassword')?.value
    };

    console.log('Submitting reset request with token:', this.token.substring(0, 10) + '...');

    this.authService.resetPassword(resetData).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response: string) => {
        console.log('Password reset successful:', response);
        this.success = true;

        // Redirect to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { message: 'Password reset successfully' }
          });
        }, 3000);
      },
      error: (err) => {
        console.error('Password reset error:', err);

        if (err.status === 400) {
          this.error = err.error?.message || 'Invalid or expired reset token. Please request a new link.';
        } else if (err.status === 404) {
          this.error = 'Reset token not found. Please request a new password reset link.';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.message) {
          this.error = err.message;
        } else {
          this.error = 'Password reset failed. Please try again.';
        }
      }
    });
  }

  get newPassword() { return this.resetPasswordForm.get('newPassword'); }
  get confirmPassword() { return this.resetPasswordForm.get('confirmPassword'); }
}
