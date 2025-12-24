import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { ClientDepositService, ClientDepositResponse, ClientDepositStatus } from '../../../../services/client-deposit.service';
import { ClientPortalService } from '../../../../services/client-portal.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/ui/loading-spinner/loading-spinner.component';

interface QuickAmount {
    value: number;
    label: string;
}

@Component({
    selector: 'app-client-deposits',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
    templateUrl: './deposits.component.html',
    styleUrls: ['./deposits.component.css'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientDepositsComponent implements OnInit {
    depositRequests: ClientDepositResponse[] = [];
    isLoading = true;
    isSubmitting = false;
    error: string | null = null;

    // Form fields
    amount: number = 0;
    referenceNumber: string = '';
    remarks: string = '';

    // Show form toggle
    showForm = false;

    // Quick amounts
    quickAmounts: QuickAmount[] = [
        { value: 1000, label: '₹1,000' },
        { value: 5000, label: '₹5,000' },
        { value: 10000, label: '₹10,000' },
        { value: 25000, label: '₹25,000' },
        { value: 50000, label: '₹50,000' }
    ];

    // Stats
    currentBalance = 0;
    pendingAmount = 0;
    approvedTotal = 0;

    ClientDepositStatus = ClientDepositStatus;

    constructor(
        private clientDepositService: ClientDepositService,
        private clientPortalService: ClientPortalService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        this.error = null;

        // Load profile for balance
        this.clientPortalService.getMyProfile().subscribe({
            next: (profile) => {
                this.currentBalance = profile.balance;
                this.loadDepositRequests();
            },
            error: (err: any) => {
                this.isLoading = false;
                this.error = 'Failed to load profile';
                this.notificationService.showError(this.error);
            }
        });
    }

    loadDepositRequests(): void {
        this.clientDepositService.getMyDepositRequests()
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (requests: ClientDepositResponse[]) => {
                    this.depositRequests = requests;
                    this.calculateStats();
                },
                error: (err: any) => {
                    this.error = 'Failed to load deposit requests';
                    this.notificationService.showError(this.error);
                }
            });
    }

    calculateStats(): void {
        this.pendingAmount = this.depositRequests
            .filter(r => r.status === 'PENDING')
            .reduce((sum, r) => sum + r.amount, 0);
        this.approvedTotal = this.depositRequests
            .filter(r => r.status === 'APPROVED')
            .reduce((sum, r) => sum + r.amount, 0);
    }

    selectQuickAmount(value: number): void {
        this.amount = value;
    }

    toggleForm(): void {
        this.showForm = !this.showForm;
        if (!this.showForm) {
            this.resetForm();
        }
    }

    resetForm(): void {
        this.amount = 0;
        this.referenceNumber = '';
        this.remarks = '';
    }

    submitRequest(): void {
        if (!this.amount || this.amount <= 0) {
            this.notificationService.showError('Please enter a valid amount');
            return;
        }

        this.isSubmitting = true;
        const request = {
            amount: this.amount,
            referenceNumber: this.referenceNumber || undefined,
            remarks: this.remarks || undefined
        };

        this.clientDepositService.createDepositRequest(request)
            .pipe(finalize(() => this.isSubmitting = false))
            .subscribe({
                next: (response: ClientDepositResponse) => {
                    this.notificationService.showSuccess(`Deposit request of ${this.formatCurrency(response.amount)} submitted successfully`);
                    this.resetForm();
                    this.showForm = false;
                    this.loadDepositRequests();
                },
                error: (err: any) => {
                    this.notificationService.showError(err.error?.message || 'Failed to submit request');
                }
            });
    }

    getStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
            'PENDING': 'text-yellow-400 bg-yellow-500/20',
            'APPROVED': 'text-green-400 bg-green-500/20',
            'REJECTED': 'text-red-400 bg-red-500/20'
        };
        return colors[status] || 'text-slate-400 bg-slate-500/20';
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', minimumFractionDigits: 0
        }).format(amount || 0);
    }

    formatDate(date: string): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }
}
