import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { VendorBillService } from '../../../../../services/vendor-bill.service';
import { VendorBillDto, BillStatus } from '../../../../../models/vendor-bill.models';
import { NotificationService } from '../../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-payment-status',
    standalone: true,
    imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
    templateUrl: './payment-status.component.html',
    styleUrls: ['./payment-status.component.css'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PaymentStatusComponent implements OnInit {
    bills: VendorBillDto[] = [];
    isLoading = true;
    error: string | null = null;

    totalReceived = 0;
    totalPending = 0;
    paidBillsCount = 0;

    constructor(
        private billService: VendorBillService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadPayments();
    }

    loadPayments(): void {
        this.isLoading = true;
        this.error = null;
        this.billService.getAllBills()
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (bills: VendorBillDto[]) => {
                    this.bills = bills.filter(b => (b.paidAmount || 0) > 0).sort((a: VendorBillDto, b: VendorBillDto) =>
                        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                    );
                    this.calculateStats(bills);

                    if (this.bills.length === 0 && bills.length > 0) {
                        this.notificationService.showInfo('No payments received yet. Awaiting organization to process your bills.');
                    } else if (bills.length === 0) {
                        this.notificationService.showInfo('No bills found. Create a bill first to track payments.');
                    }
                },
                error: (err: any) => {
                    this.error = this.extractErrorMessage(err);
                    this.notificationService.showError(this.error);
                }
            });
    }

    refreshPayments(): void {
        this.notificationService.showInfo('Refreshing payment data...');
        this.loadPayments();
    }

    calculateStats(bills: VendorBillDto[]): void {
        this.totalReceived = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
        this.totalPending = bills
            .filter(b => b.status !== BillStatus.PAID && b.status !== BillStatus.CANCELLED)
            .reduce((sum, b) => sum + (b.amount - (b.paidAmount || 0)), 0);
        this.paidBillsCount = bills.filter(b => b.status === BillStatus.PAID).length;
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', minimumFractionDigits: 0
        }).format(amount || 0);
    }

    formatDate(date: string): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    private extractErrorMessage(err: any): string {
        if (err.error?.message) return err.error.message;
        if (err.status === 401) return 'Session expired. Please login again.';
        if (err.status === 403) return 'You do not have permission to view payment data.';
        if (err.status === 500) return 'Server error. Please try again later.';
        return 'Failed to load payment data. Please try again.';
    }
}
