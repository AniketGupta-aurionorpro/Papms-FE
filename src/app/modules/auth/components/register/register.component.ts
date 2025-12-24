import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { OrganizationService } from '../../../../services/organization.service';
import { OrganizationRegistrationReq } from '../../../../models/organization.models';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Observable, of } from 'rxjs';
import { debounceTime, map, catchError, switchMap, first } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error = '';
  success = false;

  document1: File | null = null;
  document2: File | null = null;
  logo: File | null = null;

  // Track validation status for UI feedback
  usernameChecking = false;
  emailChecking = false;

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      companyName: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)], [this.usernameValidator.bind(this)]],
      email: ['', [Validators.required, Validators.email], [this.emailValidator.bind(this)]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      document1: [null, Validators.required],
      document2: [null, Validators.required],
      logo: [null]
    }, { validators: this.passwordMatchValidator });
  }

  // NEW: Async validator for username
  private usernameValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value || control.value.length < 3) {
      return of(null);
    }
    this.usernameChecking = true;
    return of(control.value).pipe(
      debounceTime(500), // Wait 500ms after user stops typing
      switchMap(value =>
        this.authService.checkUsernameAvailability(value).pipe(
          map(response => {
            this.usernameChecking = false;
            return response.available ? null : { usernameTaken: response.message };
          }),
          catchError(() => {
            this.usernameChecking = false;
            return of(null); // Don't block on network errors
          })
        )
      ),
      first()
    );
  }

  // NEW: Async validator for email
  private emailValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value || !control.value.includes('@')) {
      return of(null);
    }
    this.emailChecking = true;
    return of(control.value).pipe(
      debounceTime(500), // Wait 500ms after user stops typing
      switchMap(value =>
        this.authService.checkEmailAvailability(value).pipe(
          map(response => {
            this.emailChecking = false;
            return response.available ? null : { emailTaken: response.message };
          }),
          catchError(() => {
            this.emailChecking = false;
            return of(null); // Don't block on network errors
          })
        )
      ),
      first()
    );
  }

  get f() { return this.registerForm.controls; }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
  }

  onFileChange(event: any, controlName: 'document1' | 'document2' | 'logo'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this[controlName] = file;
      this.registerForm.patchValue({ [controlName]: file });
      this.registerForm.get(controlName)?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      this.error = 'Please fill out all required fields and upload the necessary documents.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    const formData = new FormData();
    const formValue = this.registerForm.value;

    const orgData: OrganizationRegistrationReq = {
      companyName: formValue.companyName,
      username: formValue.username,
      password: formValue.password,
      fullName: formValue.fullName,
      email: formValue.email,
      address: formValue.address,
      contactNumber: formValue.contactNumber,
    };

    formData.append('organizationData', JSON.stringify(orgData));
    formData.append('document1', formValue.document1);
    formData.append('document2', formValue.document2);
    if (formValue.logo) {
      formData.append('logo', formValue.logo);
    }

    this.organizationService.register(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = true;
        this.notificationService.showSuccess('Registration submitted! Awaiting bank approval.');
        setTimeout(() => {
          this.router.navigate(['/auth/login'], { queryParams: { registration: 'success' } });
        }, 4000);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || err.error || 'Registration failed. Please check your inputs and try again.';
        this.notificationService.showError(this.error);
        console.error(err);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.values(this.registerForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // Getters for template validation
  get companyName() { return this.registerForm.get('companyName'); }
  get username() { return this.registerForm.get('username'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get fullName() { return this.registerForm.get('fullName'); }
  get email() { return this.registerForm.get('email'); }
  get address() { return this.registerForm.get('address'); }
  get contactNumber() { return this.registerForm.get('contactNumber'); }
}
