import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { VendorBillService } from '../../../../../services/vendor-bill.service';
import { VendorBillDto, BillStatus } from '../../../../../models/vendor-bill.models';
import { NotificationService } from '../../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-bill-history',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
    templateUrl: './bill-history.component.html',
    styleUrls: ['./bill-history.component.css'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BillHistoryComponent implements OnInit {
    bills: VendorBillDto[] = [];
    filteredBills: VendorBillDto[] = [];
    isLoading = true;
    error: string | null = null;

    searchTerm = '';
    statusFilter: string = 'ALL';
    statuses = ['ALL', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'PAY_LATER', 'OVERDUE', 'CANCELLED'];

    constructor(
        private billService: VendorBillService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadBills();
    }

    loadBills(): void {
        this.isLoading = true;
        this.error = null;
        this.billService.getAllBills()
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (bills: VendorBillDto[]) => {
                    this.bills = bills;
                    this.applyFilters();
                    if (bills.length === 0) {
                        this.notificationService.showInfo('No bills found. Create your first bill to get started.');
                    }
                },
                error: (err: any) => {
                    this.error = this.extractErrorMessage(err);
                    this.notificationService.showError(this.error);
                }
            });
    }

    applyFilters(): void {
        let result = [...this.bills];
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            result = result.filter(b =>
                b.billNumber.toLowerCase().includes(term) ||
                b.description?.toLowerCase().includes(term)
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
        this.notificationService.showInfo('Filters cleared');
    }

    downloadPdf(billId: number): void {
        this.notificationService.showInfo('Generating PDF...');
        this.billService.downloadVendorBillPdf(billId).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bill-${billId}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
                this.notificationService.showSuccess('PDF downloaded successfully!');
            },
            error: (err: any) => {
                this.notificationService.showError('Failed to download PDF. Please try again.');
            }
        });
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

    private extractErrorMessage(err: any): string {
        if (err.error?.message) return err.error.message;
        if (err.status === 401) return 'Session expired. Please login again.';
        if (err.status === 403) return 'You do not have permission to view bills.';
        if (err.status === 500) return 'Server error. Please try again later.';
        return 'Failed to load bills. Please try again.';
    }
}
