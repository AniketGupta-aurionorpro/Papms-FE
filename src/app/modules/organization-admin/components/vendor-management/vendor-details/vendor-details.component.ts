import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { VendorService } from '../../../../../services/vendor.service';
import { VendorPaymentService } from '../../../../../services/vendor-payment.service';
import { VendorResponse } from '../../../../../models/vendor.models';
import { VendorPaymentRequest } from '../../../../../models/vendor-payment.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-vendor-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './vendor-details.component.html',
  styleUrls: ['./vendor-details.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VendorDetailsComponent implements OnInit {
  vendorId!: number;
  vendor: VendorResponse | null = null;
  isLoading = true;
  error: string | null = null;

  // Payment Modal
  showPaymentModal = false;
  paymentAmount: number | null = null;
  paymentDescription = '';
  isProcessingPayment = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private vendorService: VendorService,
    private vendorPaymentService: VendorPaymentService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.vendorId = +params['id'];
        this.loadVendor();
      }
    });
  }

  loadVendor(): void {
    this.isLoading = true;
    this.error = null;

    this.vendorService.getVendorById(this.vendorId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (vendor) => {
          this.vendor = vendor;
        },
        error: (err) => {
          this.error = this.extractErrorMessage(err);
          this.notificationService.showError(this.error);
        }
      });
  }

  // Payment Modal
  openPaymentModal(): void {
    this.paymentAmount = null;
    this.paymentDescription = '';
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.paymentAmount = null;
    this.paymentDescription = '';
  }

  makePayment(): void {
    if (!this.paymentAmount || this.paymentAmount <= 0) {
      this.notificationService.showError('Please enter a valid amount');
      return;
    }

    this.isProcessingPayment = true;
    const request: VendorPaymentRequest = {
      vendorId: this.vendorId,
      amount: this.paymentAmount,
      description: this.paymentDescription || `Payment to ${this.vendor?.vendorName}`
    };

    this.vendorPaymentService.makePaymentToVendor(request)
      .pipe(finalize(() => {
        this.isProcessingPayment = false;
        this.closePaymentModal();
      }))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Payment of ${this.formatCurrency(this.paymentAmount!)} sent successfully`);
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Payment failed');
        }
      });
  }

  // Helpers
  getInitials(name: string): string {
    if (!name) return 'V';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    const masked = '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
    return masked;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view this vendor.';
    if (err.status === 404) return 'Vendor not found.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load vendor details. Please try again.';
  }
}
