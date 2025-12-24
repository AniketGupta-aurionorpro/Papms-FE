import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ClientDepositService, ClientDepositResponse, ClientDepositStatus } from '../../../../../services/client-deposit.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-deposit-history',
    standalone: true,
    imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
    templateUrl: './deposit-history.component.html',
    styleUrls: ['./deposit-history.component.css'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DepositHistoryComponent implements OnInit {
    depositRequests: ClientDepositResponse[] = [];
    isLoading = true;
    error: string | null = null;
    searchTerm: string = '';

    // Stats
    totalDeposits = 0;
    totalAmount = 0;
    approvedCount = 0;

    ClientDepositStatus = ClientDepositStatus;

    constructor(
        private clientDepositService: ClientDepositService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadDepositRequests();
    }

    loadDepositRequests(): void {
        this.isLoading = true;
        this.error = null;

        this.clientDepositService.getOrganizationDepositRequests()
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (requests: ClientDepositResponse[]) => {
                    this.depositRequests = requests;
                    this.calculateStats();
                },
                error: (err: any) => {
                    this.error = 'Failed to load deposit history';
                    this.notificationService.showError(this.error);
                }
            });
    }

    calculateStats(): void {
        this.totalDeposits = this.depositRequests.length;
        this.totalAmount = this.depositRequests.filter(r => r.status === 'APPROVED').reduce((sum, r) => sum + r.amount, 0);
        this.approvedCount = this.depositRequests.filter(r => r.status === 'APPROVED').length;
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

    get filteredRequests(): ClientDepositResponse[] {
        if (!this.searchTerm) return this.depositRequests;
        const term = this.searchTerm.toLowerCase();
        return this.depositRequests.filter(req =>
            req.clientName.toLowerCase().includes(term) ||
            req.referenceNumber?.toLowerCase().includes(term) ||
            req.amount.toString().includes(term)
        );
    }
}
