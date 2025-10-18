import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionDto } from '../../../../../models/dashboard.models';
import { OrganizationResponseDto } from '../../../../../models/organization.models';
import { LoadingService } from '../../../../../services/loading.service';
import { OrganizationService } from '../../../../../services/organization.service';
import { TransactionService } from '../../../../../services/transaction.service';

@Component({
  selector: 'app-transaction-audit',
  templateUrl: './transaction-audit.component.html',
  styleUrls: ['./transaction-audit.component.css'],
  standalone: false,
})
export class TransactionAuditComponent implements OnInit {
  organization: OrganizationResponseDto | null = null;
  transactions: TransactionDto[] = [];
  filteredTransactions: TransactionDto[] = [];
  isLoading = true;
  error = '';
  searchTerm = '';
  typeFilter = 'ALL';
  dateRange = 'ALL';

  typeOptions = [
    { value: 'ALL', label: 'All Types' },
    { value: 'CREDIT', label: 'Credits' },
    { value: 'DEBIT', label: 'Debits' },
  ];

  dateOptions = [
    { value: 'ALL', label: 'All Time' },
    { value: 'TODAY', label: 'Today' },
    { value: 'WEEK', label: 'This Week' },
    { value: 'MONTH', label: 'This Month' },
    { value: 'QUARTER', label: 'This Quarter' },
  ];

  currentPage = 0;
  pageSize = 10;
  totalTransactions = 0;

  // Computed properties for template
  creditTransactionsCount = 0;
  debitTransactionsCount = 0;
  sourceDistribution: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private organizationService: OrganizationService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    const organizationId = this.route.snapshot.paramMap.get('id');
    if (organizationId) {
      this.loadOrganizationDetails(+organizationId);
      this.loadTransactions(+organizationId);
    } else {
      this.router.navigate(['/bank-admin/financial-audit']);
    }
  }

  loadOrganizationDetails(organizationId: number): void {
    this.organizationService.getOrganizationById(organizationId).subscribe({
      next: (organization) => {
        this.organization = organization;
      },
      error: (error) => {
        this.error =
          error.error?.message || 'Failed to load organization details';
      },
    });
  }

  loadTransactions(organizationId: number): void {
    this.isLoading = true;
    this.transactionService
      .getTransactions(organizationId, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.transactions = response.content || response || [];
          this.filteredTransactions = this.transactions;
          this.totalTransactions =
            response.totalElements || this.transactions.length;

          // Calculate computed properties
          this.calculateTransactionStats();
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to load transactions';
          this.isLoading = false;
          this.transactions = [];
          this.filteredTransactions = [];
        },
      });
  }

  calculateTransactionStats(): void {
    // Calculate credit and debit counts
    this.creditTransactionsCount = this.transactions.filter(
      (t) => t.type === 'CREDIT'
    ).length;
    this.debitTransactionsCount = this.transactions.filter(
      (t) => t.type === 'DEBIT'
    ).length;

    // Calculate source distribution
    this.sourceDistribution = this.getSourceDistribution();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredTransactions = this.transactions.filter((transaction) => {
      const matchesSearch = transaction.description
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      const matchesType =
        this.typeFilter === 'ALL' || transaction.type === this.typeFilter;

      // Date filtering would be implemented based on transactionDate
      const matchesDate = true; // Simplified for demo

      return matchesSearch && matchesType && matchesDate;
    });
  }

  getTypeColor(type: string): string {
    return type === 'CREDIT'
      ? 'text-green-600 bg-green-50'
      : 'text-red-600 bg-red-50';
  }

  getTypeIcon(type: string): string {
    return type === 'CREDIT' ? 'arrow-down-outline' : 'arrow-up-outline';
  }

  getSourceIcon(sourceType: string): string {
    switch (sourceType) {
      case 'DEPOSIT':
        return 'add-circle-outline';
      case 'PAYROLL':
        return 'cash-outline';
      case 'INVOICE':
        return 'document-text-outline';
      case 'VENDOR_PAYMENT':
        return 'business-outline';
      default:
        return 'swap-horizontal-outline';
    }
  }

  getSourceColor(sourceType: string): string {
    switch (sourceType) {
      case 'DEPOSIT':
        return 'text-blue-600';
      case 'PAYROLL':
        return 'text-purple-600';
      case 'INVOICE':
        return 'text-green-600';
      case 'VENDOR_PAYMENT':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  goBack(): void {
    this.router.navigate(['/bank-admin/financial-audit']);
  }

  downloadReport(): void {
    if (this.organization) {
      this.transactionService
        .downloadTransactionReport(this.organization.id)
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions-${this.organization?.companyName}-${
              new Date().toISOString().split('T')[0]
            }.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            this.error = 'Failed to download report';
          },
        });
    }
  }

  getTotalCredits(): number {
    return this.transactions
      .filter((t) => t.type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalDebits(): number {
    return this.transactions
      .filter((t) => t.type === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getNetFlow(): number {
    return this.getTotalCredits() - this.getTotalDebits();
  }

  getTransactionCount(): number {
    return this.transactions.length;
  }

  getSourceDistribution() {
    const sources = new Map();
    this.transactions.forEach((transaction) => {
      const count = sources.get(transaction.sourceType) || 0;
      sources.set(transaction.sourceType, count + 1);
    });

    return Array.from(sources.entries()).map(([type, count]) => ({
      type,
      count,
    }));
  }
}
