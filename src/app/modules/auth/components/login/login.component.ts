// app\modules\auth\components\login\login.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../../../services/loading.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false,
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error = '';
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';

      console.log('Login attempt with:', this.loginForm.value);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful response:', response);
          console.log('User role:', response.role);
          this.notificationService.showSuccess(`Welcome back! Logging in as ${response.role.replace('_', ' ')}...`);

          // Give a small delay to ensure token is stored
          setTimeout(() => {
            this.redirectBasedOnRole(response.role);
          }, 100);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          this.error = this.extractErrorMessage(error);
          this.notificationService.showError(this.error);

          // Clear any potentially corrupted stored data
          this.authService.logout();
        },
        complete: () => {
          console.log('Login observable completed');
          this.isLoading = false;
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private redirectBasedOnRole(role: string): void {
    console.log('Redirecting based on role:', role);

    // Normalize role to uppercase to handle case sensitivity
    const normalizedRole = role.toUpperCase();

    switch (normalizedRole) {
      case 'BANK_ADMIN':
        this.router.navigate(['/bank-admin']).then(success => {
          console.log('Navigation to bank-admin successful:', success);
          if (!success) {
            console.error('Failed to navigate to bank-admin, redirecting to home');
            this.router.navigate(['/']);
          }
        }).catch(error => {
          console.error('Navigation error:', error);
          this.router.navigate(['/']);
        });
        break;
      case 'ORG_ADMIN':
        this.router.navigate(['/org-admin']).then(success => {
          console.log('Navigation to org-admin successful:', success);
        });
        break;
      case 'EMPLOYEE':
        this.router.navigate(['/employee']).then(success => {
          console.log('Navigation to employee successful:', success);
        });
        break;
      case 'CLIENT':
        this.router.navigate(['/client']).then(success => {
          console.log('Navigation to client successful:', success);
        });
        break;
      case 'VENDOR':
        this.router.navigate(['/vendor']).then(success => {
          console.log('Navigation to vendor successful:', success);
        });
        break;
      default:
        console.warn('Unknown role:', role, 'redirecting to home');
        this.router.navigate(['/']).then(success => {
          console.log('Navigation to home successful:', success);
        });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  get username() {
    return this.loginForm.get('username');
  }
  get password() {
    return this.loginForm.get('password');
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Invalid username or password.';
    if (err.status === 403) return 'Your account has been locked. Please contact support.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Login failed. Please check your credentials.';
  }
}
