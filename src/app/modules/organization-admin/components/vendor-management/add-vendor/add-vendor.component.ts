import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { VendorService } from '../../../../../services/vendor.service';
import { VendorRequest, VendorResponse } from '../../../../../models/vendor.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-add-vendor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './add-vendor.component.html',
  styleUrls: ['./add-vendor.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AddVendorComponent implements OnInit {
  vendorForm!: FormGroup;
  isEditMode = false;
  vendorId: number | null = null;
  isLoading = false;
  isLoadingVendor = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private vendorService: VendorService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initForm();

    // Check for edit mode
    this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        this.isEditMode = true;
        this.vendorId = +params['edit'];
        this.loadVendor();
      }
    });
  }

  initForm(): void {
    this.vendorForm = this.fb.group({
      vendorName: ['', [Validators.required, Validators.minLength(2)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      accountHolderName: ['', [Validators.required, Validators.minLength(2)]],
      accountNumber: ['', [Validators.required, Validators.pattern(/^\d{9,18}$/)]],
      bankName: ['', [Validators.required]],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]]
    });

    // Auto-uppercase IFSC code
    this.vendorForm.get('ifscCode')?.valueChanges.subscribe(value => {
      if (value && value !== value.toUpperCase()) {
        this.vendorForm.get('ifscCode')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
    });
  }

  loadVendor(): void {
    if (!this.vendorId) return;

    this.isLoadingVendor = true;
    this.vendorService.getVendorById(this.vendorId)
      .pipe(finalize(() => this.isLoadingVendor = false))
      .subscribe({
        next: (vendor) => {
          this.vendorForm.patchValue({
            vendorName: vendor.vendorName,
            contactEmail: vendor.contactEmail,
            contactPhone: vendor.contactPhone,
            address: vendor.address,
            accountHolderName: vendor.accountHolderName,
            accountNumber: vendor.accountNumber,
            bankName: vendor.bankName,
            ifscCode: vendor.ifscCode
          });
        },
        error: (err) => {
          this.notificationService.showError('Failed to load vendor details');
          this.router.navigate(['/org-admin/vendors']);
        }
      });
  }

  onSubmit(): void {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      this.notificationService.showError('Please fill all required fields correctly');
      return;
    }

    const request: VendorRequest = this.vendorForm.value;
    this.isSubmitting = true;

    const operation = this.isEditMode && this.vendorId
      ? this.vendorService.updateVendor(this.vendorId, request)
      : this.vendorService.createVendor(request);

    operation.pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccess(
            this.isEditMode
              ? 'Vendor updated successfully!'
              : 'Vendor created successfully! Login credentials have been sent to the vendor\'s email.'
          );
          this.router.navigate(['/org-admin/vendors']);
        },
        error: (err) => {
          console.error('Vendor API Error:', err);
          const errorMessage = this.extractErrorMessage(err);
          this.notificationService.showError(errorMessage);
        }
      });
  }

  private extractErrorMessage(err: any): string {
    // Try to get the most specific error message
    if (err.error) {
      // Backend returned structured error
      if (typeof err.error === 'string') {
        return err.error;
      }
      if (err.error.message) {
        return err.error.message;
      }
      if (err.error.error) {
        return err.error.error;
      }
      // Handle validation errors
      if (err.error.errors && Array.isArray(err.error.errors)) {
        return err.error.errors.join(', ');
      }
    }

    // HTTP status based messages
    if (err.status) {
      switch (err.status) {
        case 400:
          return 'Invalid vendor data. Please check your inputs.';
        case 401:
          return 'Session expired. Please login again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'Vendor not found.';
        case 409:
          return 'A vendor with this name or email already exists.';
        case 500:
          return 'Server error occurred. Please try again later or contact support.';
        default:
          return `Error: ${err.statusText || 'Unknown error occurred'}`;
      }
    }

    return 'Failed to save vendor. Please try again.';
  }


  // Field validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.vendorForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.vendorForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (field.errors['email']) return 'Invalid email format';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
    if (field.errors['pattern']) {
      if (fieldName === 'contactPhone') return 'Enter valid 10-digit mobile number';
      if (fieldName === 'accountNumber') return 'Account number must be 9-18 digits';
      if (fieldName === 'ifscCode') return 'Invalid IFSC format (e.g., HDFC0001234)';
    }
    return 'Invalid value';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      vendorName: 'Vendor Name',
      contactEmail: 'Email',
      contactPhone: 'Phone',
      address: 'Address',
      accountHolderName: 'Account Holder Name',
      accountNumber: 'Account Number',
      bankName: 'Bank Name',
      ifscCode: 'IFSC Code'
    };
    return labels[fieldName] || fieldName;
  }

  // Common Indian banks for dropdown
  banks = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Canara Bank',
    'Union Bank of India',
    'IndusInd Bank',
    'Yes Bank',
    'IDFC First Bank',
    'Other'
  ];
}
