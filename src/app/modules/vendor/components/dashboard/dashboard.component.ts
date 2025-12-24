import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { VendorBillService } from '../../../../services/vendor-bill.service';
import { VendorBillDto, BillStatus } from '../../../../models/vendor-bill.models';
import { LoadingSpinnerComponent } from '../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-vendor-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VendorDashboardComponent implements OnInit {
    isLoading = true;
    error: string | null = null;

    // Stats
    totalBills = 0;
    pendingBills = 0;
    paidBills = 0;
    totalPending = 0;
    totalReceived = 0;

    recentBills: VendorBillDto[] = [];

    constructor(
        private authService: AuthService,
        private billService: VendorBillService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.isLoading = true;
        this.error = null;
        this.billService.getAllBills()
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (bills: VendorBillDto[]) => {
                    this.calculateStats(bills);
                    this.recentBills = bills.slice(0, 5);

                    // Show welcome message on first load
                    if (bills.length === 0) {
                        this.notificationService.showInfo('Welcome! Create your first bill to get started.');
                    }
                },
                error: (err: any) => {
                    this.error = this.extractErrorMessage(err);
                    this.notificationService.showError(this.error);
                }
            });
    }

    refreshData(): void {
        this.notificationService.showInfo('Refreshing dashboard...');
        this.loadDashboardData();
    }

    calculateStats(bills: VendorBillDto[]): void {
        this.totalBills = bills.length;
        this.pendingBills = bills.filter(b =>
            b.status === BillStatus.PENDING || b.status === BillStatus.PARTIALLY_PAID
        ).length;
        this.paidBills = bills.filter(b => b.status === BillStatus.PAID).length;

        this.totalPending = bills
            .filter(b => b.status !== BillStatus.PAID && b.status !== BillStatus.CANCELLED)
            .reduce((sum, b) => sum + (b.dueAmount || b.amount - (b.paidAmount || 0)), 0);

        this.totalReceived = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    formatDate(date: string): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    getStatusColor(status: BillStatus): string {
        const colors: { [key: string]: string } = {
            [BillStatus.PENDING]: 'text-yellow-400',
            [BillStatus.PARTIALLY_PAID]: 'text-blue-400',
            [BillStatus.PAID]: 'text-green-400',
            [BillStatus.PAY_LATER]: 'text-purple-400',
            [BillStatus.OVERDUE]: 'text-red-400',
            [BillStatus.CANCELLED]: 'text-slate-400'
        };
        return colors[status] || 'text-slate-400';
    }

    getStatusBgColor(status: BillStatus): string {
        const colors: { [key: string]: string } = {
            [BillStatus.PENDING]: 'bg-yellow-500/20',
            [BillStatus.PARTIALLY_PAID]: 'bg-blue-500/20',
            [BillStatus.PAID]: 'bg-green-500/20',
            [BillStatus.PAY_LATER]: 'bg-purple-500/20',
            [BillStatus.OVERDUE]: 'bg-red-500/20',
            [BillStatus.CANCELLED]: 'bg-slate-500/20'
        };
        return colors[status] || 'bg-slate-500/20';
    }

    private extractErrorMessage(err: any): string {
        if (err.error?.message) return err.error.message;
        if (err.status === 401) return 'Session expired. Please login again.';
        if (err.status === 403) return 'You do not have permission to access the dashboard.';
        if (err.status === 500) return 'Server error. Please try again later.';
        return 'Failed to load dashboard data. Please try again.';
    }
}
