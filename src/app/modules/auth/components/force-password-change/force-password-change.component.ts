import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../../../services/loading.service';
import { AuthService } from '../../../../core/services/auth.service';


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
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.forcePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
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
          // Redirect to the intended URL
          this.router.navigateByUrl(this.returnUrl);
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
