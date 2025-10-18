import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
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
    private router: Router
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
        // The service now correctly returns a string on success
        console.log('Forgot password response:', response);
        this.success = true;
      },
      error: (err) => {
        console.error('Forgot password error:', err);

        // For security, show the same success message even if the user doesn't exist
        if (err.status === 404 || err.status === 400) {
          this.success = true;
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.message) {
          this.error = err.message;
        } else {
          this.error = 'An unexpected error occurred. Please try again later.';
        }
      }
    });
  }

  get email() { return this.forgotPasswordForm.get('email'); }
}
