import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { VendorBillService } from '../../../../../services/vendor-bill.service';
import { VendorBillDto, BillStatus, PaymentMode, BillPaymentRequest, CreateInstallmentPlanRequest, InstallmentDto } from '../../../../../models/vendor-bill.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-vendor-bills',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
    templateUrl: './vendor-bills.component.html',
    styleUrls: ['./vendor-bills.component.css'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VendorBillsComponent implements OnInit {
    bills: VendorBillDto[] = [];
    filteredBills: VendorBillDto[] = [];
    isLoading = true;
    error: string | null = null;

    // Filters
    searchTerm = '';
    statusFilter: string = 'ALL';
    statuses = ['ALL', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'PAY_LATER', 'INSTALLMENTS', 'OVERDUE'];

    // Stats
    totalPending = 0;
    totalPaid = 0;
    pendingCount = 0;

    // Payment Modal
    showPaymentModal = false;
    selectedBill: VendorBillDto | null = null;
    paymentMode: PaymentMode = PaymentMode.FULL;
    paymentAmount: number = 0;
    payLaterDate: string = '';
    isProcessingPayment = false;

    // Installment properties
    numberOfInstallments: number = 3;
    installmentFrequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' = 'MONTHLY';
    firstInstallmentDate: string = '';
    installmentPreview: { number: number; amount: number; dueDate: string }[] = [];
    showInstallmentDetails = false;
    selectedBillInstallments: InstallmentDto[] = [];

    PaymentMode = PaymentMode; // For template access

    constructor(
        private authService: AuthService,
        private billService: VendorBillService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadBills();
    }

    loadBills(): void {
        this.isLoading = true;
        this.error = null;
        this.billService.getBillsForOrganization()
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (bills: VendorBillDto[]) => {
                    this.bills = bills;
                    this.calculateStats();
                    this.applyFilters();
                    if (bills.length === 0) {
                        this.notificationService.showInfo('No vendor bills found.');
                    }
                },
                error: (err: any) => {
                    this.error = this.extractErrorMessage(err);
                    this.notificationService.showError(this.error);
                }
            });
    }

    calculateStats(): void {
        this.totalPending = this.bills
            .filter(b => b.status !== 'PAID' && b.status !== 'CANCELLED')
            .reduce((sum, b) => sum + (b.amount - (b.paidAmount || 0)), 0);
        this.totalPaid = this.bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
        this.pendingCount = this.bills.filter(b => b.status === 'PENDING' || b.status === 'PARTIALLY_PAID').length;
    }

    applyFilters(): void {
        let result = [...this.bills];

        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            result = result.filter(b =>
                b.billNumber.toLowerCase().includes(term) ||
                b.vendorName?.toLowerCase().includes(term)
            );
        }

        if (this.statusFilter !== 'ALL') {
            result = result.filter(b => b.status === this.statusFilter);
        }

        this.filteredBills = result;
    }

    resetFilters(): void {
        this.searchTerm = '';
        this.statusFilter = 'ALL';
        this.applyFilters();
    }

    // Payment Modal
    openPaymentModal(bill: VendorBillDto): void {
        this.selectedBill = bill;
        this.paymentMode = PaymentMode.FULL;
        this.paymentAmount = bill.amount - (bill.paidAmount || 0);
        this.payLaterDate = '';
        this.showPaymentModal = true;
    }

    closePaymentModal(): void {
        this.showPaymentModal = false;
        this.selectedBill = null;
    }

    onPaymentModeChange(): void {
        if (this.selectedBill) {
            const due = this.selectedBill.amount - (this.selectedBill.paidAmount || 0);
            if (this.paymentMode === PaymentMode.FULL) {
                this.paymentAmount = due;
            } else if (this.paymentMode === PaymentMode.PAY_LATER) {
                this.paymentAmount = 0;
                // Set default date 30 days from now
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 30);
                this.payLaterDate = futureDate.toISOString().split('T')[0];
            } else if (this.paymentMode === PaymentMode.INSTALLMENTS) {
                this.paymentAmount = 0;
                // Set first installment date to next month
                const futureDate = new Date();
                futureDate.setMonth(futureDate.getMonth() + 1);
                this.firstInstallmentDate = futureDate.toISOString().split('T')[0];
                this.updateInstallmentPreview();
            }
        }
    }

    updateInstallmentPreview(): void {
        if (!this.selectedBill || this.paymentMode !== PaymentMode.INSTALLMENTS) return;

        const due = this.selectedBill.amount - (this.selectedBill.paidAmount || 0);
        const amount = Math.floor((due / this.numberOfInstallments) * 100) / 100;
        const remainder = due - (amount * this.numberOfInstallments);

        this.installmentPreview = [];
        let currentDate = new Date(this.firstInstallmentDate);

        for (let i = 1; i <= this.numberOfInstallments; i++) {
            const installmentAmount = i === this.numberOfInstallments ? amount + remainder : amount;
            this.installmentPreview.push({
                number: i,
                amount: installmentAmount,
                dueDate: currentDate.toISOString().split('T')[0]
            });
            // Calculate next date based on frequency
            if (this.installmentFrequency === 'WEEKLY') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else if (this.installmentFrequency === 'BI_WEEKLY') {
                currentDate.setDate(currentDate.getDate() + 14);
            } else {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }
    }

    processPayment(): void {
        if (!this.selectedBill) return;

        // Handle installment plan creation
        if (this.paymentMode === PaymentMode.INSTALLMENTS) {
            this.createInstallmentPlan();
            return;
        }

        const due = this.selectedBill.amount - (this.selectedBill.paidAmount || 0);

        if (this.paymentMode !== PaymentMode.PAY_LATER && (this.paymentAmount <= 0 || this.paymentAmount > due)) {
            this.notificationService.showError('Invalid payment amount');
            return;
        }

        this.isProcessingPayment = true;
        const request: BillPaymentRequest = {
            billId: this.selectedBill.id,
            amount: this.paymentAmount,
            paymentMode: this.paymentMode,
            description: this.paymentMode === PaymentMode.PAY_LATER ? `Pay later: ${this.payLaterDate}` : undefined
        };

        this.billService.payBill(request)
            .pipe(finalize(() => {
                this.isProcessingPayment = false;
                this.closePaymentModal();
            }))
            .subscribe({
                next: () => {
                    const msg = this.paymentMode === PaymentMode.PAY_LATER
                        ? 'Bill marked for pay later'
                        : `Payment of ${this.formatCurrency(this.paymentAmount)} processed`;
                    this.notificationService.showSuccess(msg);
                    this.loadBills();
                },
                error: (err: any) => {
                    this.notificationService.showError(err.error?.message || 'Payment failed');
                }
            });
    }

    createInstallmentPlan(): void {
        if (!this.selectedBill) return;

        this.isProcessingPayment = true;
        const request: CreateInstallmentPlanRequest = {
            billId: this.selectedBill.id,
            numberOfInstallments: this.numberOfInstallments,
            frequency: this.installmentFrequency,
            firstInstallmentDate: this.firstInstallmentDate
        };

        this.billService.createInstallmentPlan(request)
            .pipe(finalize(() => {
                this.isProcessingPayment = false;
                this.closePaymentModal();
            }))
            .subscribe({
                next: () => {
                    this.notificationService.showSuccess(`Installment plan created with ${this.numberOfInstallments} payments`);
                    this.loadBills();
                },
                error: (err: any) => {
                    this.notificationService.showError(err.error?.message || 'Failed to create installment plan');
                }
            });
    }

    // View installments for a bill
    viewInstallments(bill: VendorBillDto): void {
        this.selectedBill = bill;
        this.showInstallmentDetails = true;
        this.billService.getInstallmentsForBill(bill.id).subscribe({
            next: (installments) => {
                this.selectedBillInstallments = installments;
            },
            error: (err) => {
                this.notificationService.showError('Failed to load installments');
            }
        });
    }

    closeInstallmentDetails(): void {
        this.showInstallmentDetails = false;
        this.selectedBillInstallments = [];
    }

    payInstallment(installment: InstallmentDto): void {
        this.isProcessingPayment = true;
        this.billService.payInstallment(installment.id)
            .pipe(finalize(() => this.isProcessingPayment = false))
            .subscribe({
                next: () => {
                    this.notificationService.showSuccess(`Installment ${installment.installmentNumber} paid successfully`);
                    this.loadBills();
                    if (this.selectedBill) {
                        this.viewInstallments(this.selectedBill);
                    }
                },
                error: (err) => {
                    this.notificationService.showError(err.error?.message || 'Payment failed');
                }
            });
    }

    getInstallmentStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
            'PENDING': 'text-yellow-400 bg-yellow-500/20',
            'PAID': 'text-green-400 bg-green-500/20',
            'OVERDUE': 'text-red-400 bg-red-500/20'
        };
        return colors[status] || 'text-slate-400 bg-slate-500/20';
    }

    downloadPdf(billId: number): void {
        this.notificationService.showInfo('Generating PDF...');
        this.billService.downloadVendorBillPdf(billId).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `vendor-bill-${billId}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
                this.notificationService.showSuccess('PDF downloaded successfully!');
            },
            error: () => this.notificationService.showError('Failed to download PDF. Please try again.')
        });
    }

    // Helpers
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

    getStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
            'PENDING': 'text-yellow-400 bg-yellow-500/20',
            'PARTIALLY_PAID': 'text-blue-400 bg-blue-500/20',
            'PAID': 'text-green-400 bg-green-500/20',
            'PAY_LATER': 'text-purple-400 bg-purple-500/20',
            'OVERDUE': 'text-red-400 bg-red-500/20',
            'CANCELLED': 'text-slate-400 bg-slate-500/20'
        };
        return colors[status] || 'text-slate-400 bg-slate-500/20';
    }

    canPay(bill: VendorBillDto): boolean {
        return bill.status === 'PENDING' || bill.status === 'PARTIALLY_PAID' || bill.status === 'PAY_LATER';
    }

    hasInstallments(bill: VendorBillDto): boolean {
        return bill.status === 'INSTALLMENTS' && (bill.totalInstallments || 0) > 0;
    }

    private extractErrorMessage(err: any): string {
        if (err.error?.message) return err.error.message;
        if (err.status === 401) return 'Session expired. Please login again.';
        if (err.status === 403) return 'You do not have permission to view vendor bills.';
        if (err.status === 500) return 'Server error. Please try again later.';
        return 'Failed to load vendor bills. Please try again.';
    }
}
