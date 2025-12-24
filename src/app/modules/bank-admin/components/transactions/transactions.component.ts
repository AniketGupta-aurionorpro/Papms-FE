import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
// MODIFICATION: Import the enums
import { TransactionDto, TransactionType, TransactionSourceType } from '../../../../models/dashboard.models';
import { OrganizationResponseDto } from '../../../../models/organization.models';
import { TransactionService } from '../../../../services/transaction.service';
import { OrganizationService } from '../../../../services/organization.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface ExtendedTransactionDto extends TransactionDto {
  organizationId?: number;
  organizationName?: string;
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  standalone: false
})
export class TransactionsComponent implements OnInit, OnDestroy {
  private allTransactions: ExtendedTransactionDto[] = [];
  filteredTransactions: ExtendedTransactionDto[] = [];
  organizations: OrganizationResponseDto[] = [];
  isLoading = true;
  error = '';

  // Filters
  searchTerm = '';
  organizationFilter: number | 'ALL' = 'ALL';

  // FIX: Use the imported enums for type safety
  typeFilter: TransactionType | 'ALL' = 'ALL';
  sourceTypeFilter: TransactionSourceType | 'ALL' = 'ALL';

  startDate: string | null = null;
  endDate: string | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalRecords = 0;
  Math = Math;

  private filterSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  // Filter options
  typeOptions = [
    { value: 'ALL', label: 'All Types' },
    { value: TransactionType.CREDIT, label: 'Credit' },
    { value: TransactionType.DEBIT, label: 'Debit' }
  ];

  sourceTypeOptions = [
    { value: 'ALL', label: 'All Sources' },
    { value: TransactionSourceType.DEPOSIT, label: 'Deposit' },
    { value: TransactionSourceType.PAYROLL, label: 'Payroll' },
    { value: TransactionSourceType.INVOICE, label: 'Invoice' },
    { value: TransactionSourceType.VENDOR_PAYMENT, label: 'Vendor Payment' }
  ];

  constructor(
    private transactionService: TransactionService,
    private organizationService: OrganizationService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.setupFilterDebounce();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterDebounce(): void {
    this.filterSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.organizationService.getAllOrganizations(0, 1000).subscribe({
      next: (response) => {
        this.organizations = response.content || [];
        this.loadAllTransactionsFromServer();
      },
      error: (err) => {
        this.error = this.extractErrorMessage(err);
        this.notificationService.showError(this.error);
        this.isLoading = false;
      }
    });
  }

  loadAllTransactionsFromServer(): void {
    this.error = '';
    const transactionObservables = this.organizations.map(org =>
      // FIX: The service call now passes null for the new sourceType parameter
      this.transactionService.getTransactions(org.id, 0, 100, null, null, null, null, null)
    );

    if (transactionObservables.length === 0) {
      this.isLoading = false;
      this.allTransactions = [];
      this.applyFilters();
      return;
    }

    Promise.all(transactionObservables.map(obs => obs.toPromise())).then(responses => {
      this.allTransactions = responses.flatMap((response: any, index: number) => {
        const orgTransactions = response?.content || [];
        const organization = this.organizations[index];
        return orgTransactions.map((tx: TransactionDto) => ({
          ...tx,
          organizationId: organization.id,
          organizationName: organization.companyName
        }));
      });
      this.allTransactions.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
      this.applyFilters();
      this.isLoading = false;
    }).catch(err => {
      this.error = this.extractErrorMessage(err);
      this.notificationService.showError(this.error);
      this.isLoading = false;
      console.error('Error loading all transactions:', err);
    });
  }

  applyFilters(): void {
    let filtered = this.allTransactions;

    if (this.organizationFilter !== 'ALL') {
      filtered = filtered.filter(tx => tx.organizationId === Number(this.organizationFilter));
    }
    if (this.searchTerm) {
      const lowerCaseSearch = this.searchTerm.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.description.toLowerCase().includes(lowerCaseSearch) ||
        tx.organizationName?.toLowerCase().includes(lowerCaseSearch)
      );
    }
    if (this.typeFilter !== 'ALL') {
      filtered = filtered.filter(tx => tx.type === this.typeFilter);
    }
    // --- FIX IS HERE ---
    if (this.sourceTypeFilter !== 'ALL') {
      filtered = filtered.filter(tx => tx.sourceType === this.sourceTypeFilter);
    }
    // --- END FIX ---
    if (this.startDate) {
      filtered = filtered.filter(tx => tx.transactionDate >= this.startDate!);
    }
    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(tx => new Date(tx.transactionDate) <= end);
    }

    this.filteredTransactions = filtered;
    this.totalRecords = filtered.length;
    this.currentPage = 0;
  }

  // ... rest of the component methods remain unchanged ...
  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.filterSubject.next();
  }

  getPagedTransactions(): ExtendedTransactionDto[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.filteredTransactions.slice(startIndex, startIndex + this.pageSize);
  }

  // UI Helper Methods
  getTransactionTypeClass(type: TransactionType): string {
    return type === TransactionType.CREDIT
      ? 'bg-green-500/20 text-green-400'
      : 'bg-red-500/20 text-red-400';
  }

  getTransactionTypeIcon(type: TransactionType): string {
    return type === TransactionType.CREDIT ? 'arrow-down-outline' : 'arrow-up-outline';
  }

  getSourceTypeIcon(sourceType: TransactionSourceType): string {
    switch (sourceType) {
      case TransactionSourceType.DEPOSIT: return 'add-circle-outline';
      case TransactionSourceType.PAYROLL: return 'cash-outline';
      case TransactionSourceType.INVOICE: return 'document-text-outline';
      case TransactionSourceType.VENDOR_PAYMENT: return 'business-outline';
      default: return 'swap-horizontal-outline';
    }
  }

  getSourceTypeColor(sourceType: TransactionSourceType): string {
    switch (sourceType) {
      case TransactionSourceType.DEPOSIT: return 'text-blue-400';
      case TransactionSourceType.PAYROLL: return 'text-purple-400';
      case TransactionSourceType.INVOICE: return 'text-green-400';
      case TransactionSourceType.VENDOR_PAYMENT: return 'text-orange-400';
      default: return 'text-slate-400';
    }
  }

  formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  viewOrganizationDetails(organizationId: number): void {
    this.router.navigate(['/bank-admin/organizations', organizationId]);
  }

  // Statistics (now correctly calculated on the filtered list)
  getTotalCredits(): number {
    return this.filteredTransactions
      .filter(tx => tx.type === TransactionType.CREDIT)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  getTotalDebits(): number {
    return this.filteredTransactions
      .filter(tx => tx.type === TransactionType.DEBIT)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  getNetFlow(): number {
    return this.getTotalCredits() - this.getTotalDebits();
  }

  getTransactionCount(): number {
    return this.filteredTransactions.length;
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view transactions.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load transactions. Please try again.';
  }
}
