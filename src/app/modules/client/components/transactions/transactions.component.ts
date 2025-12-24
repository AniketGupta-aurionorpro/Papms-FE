import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { ClientTransactionService, TransactionRecord, TransactionHistoryResponse } from '../../../../services/client-transaction.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-client-transactions',
    standalone: true,
    imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.css'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientTransactionsComponent implements OnInit {
    transactions: TransactionRecord[] = [];
    currentBalance = 0;
    totalDeposited = 0;
    totalSpent = 0;
    isLoading = true;
    error: string | null = null;

    constructor(
        private transactionService: ClientTransactionService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadTransactions();
    }

    loadTransactions(): void {
        this.isLoading = true;
        this.error = null;

        this.transactionService.getMyTransactions()
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (response: TransactionHistoryResponse) => {
                    this.transactions = response.transactions;
                    this.currentBalance = response.currentBalance;
                    this.totalDeposited = response.totalDeposited;
                    this.totalSpent = response.totalSpent;
                },
                error: (err: any) => {
                    this.error = 'Failed to load transactions';
                    this.notificationService.showError(this.error);
                }
            });
    }

    getTypeIcon(type: string): string {
        return type === 'DEPOSIT_REQUEST' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline';
    }

    getTypeColor(type: string): string {
        return type === 'DEPOSIT_REQUEST' ? 'text-green-400' : 'text-red-400';
    }

    getStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
            'APPROVED': 'text-green-400 bg-green-500/20',
            'PAID': 'text-green-400 bg-green-500/20',
            'PENDING': 'text-yellow-400 bg-yellow-500/20',
            'REJECTED': 'text-red-400 bg-red-500/20',
            'SENT': 'text-blue-400 bg-blue-500/20'
        };
        return colors[status] || 'text-slate-400 bg-slate-500/20';
    }

    formatCurrency(amount: number): string {
        const absAmount = Math.abs(amount || 0);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', minimumFractionDigits: 0
        }).format(absAmount);
    }

    formatDate(date: string): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }
}
