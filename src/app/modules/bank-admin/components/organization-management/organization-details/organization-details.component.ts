import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationResponseDtowithEmployee } from '../../../../../models/organization.models';
import { DocumentResponseDto } from '../../../../../models/document.models';
import { OrganizationService } from '../../../../../services/organization.service';
import { DocumentService } from '../../../../../services/document.service';
import { TransactionDto } from '../../../../../models/transaction.models';
import { TransactionService } from '../../../../../services/transaction.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CompleteEmployeeResponse, EmployeeResponseDto } from '../../../../../models/employee.models';
import { EmployeeService, Page } from '../../../../../services/employee.service';
import { PayrollBatchResponse } from '../../../../../models/payroll.models';
import { PayrollService } from '../../../../../services/payroll.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { PageEvent } from '../../../../shared/components/ui/pagination/pagination.component';
import { ClientResponseDto } from '../../../../../models/client.models';
import { VendorResponse } from '../../../../../models/vendor.models';
import { ClientService } from '../../../../../services/client.service';
import { VendorService } from '../../../../../services/vendor.service';
// --- FIX START: Define the PageEvent interface here ---
// This provides the strict type information that the template needs.
// export interface PageEvent {
//   first: number;
//   rows: number;
//   page: number;
//   pageCount: number;
// }
// --- FIX END ---

@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.css'],
  standalone: false,
})
export class OrganizationDetailsComponent implements OnInit, OnDestroy {
  organization: OrganizationResponseDtowithEmployee | null = null;
  isLoading = true;
  error = '';
  activeTab = 'profile';
  areAllDocumentsApproved = false;

  isOrgRejectionDialogVisible = false;

  // Transaction Properties
  transactions: TransactionDto[] = [];
  isLoadingTransactions = false;
  transactionsError = '';
  currentPage = 0;
  pageSize = 10;
  totalRecords = 0;
  searchTerm = '';
  startDate: string | null = null;
  endDate: string | null = null;
  typeFilter: 'ALL' | 'CREDIT' | 'DEBIT' = 'ALL';
  private filterChanges = new Subject<void>();
  private filterSubscription!: Subscription;

  // Employee Roster Properties
  // employees: EmployeeResponseDto[] = [];
  employees: CompleteEmployeeResponse[] = [];
  isLoadingEmployees = false;
  employeesError = '';
  employeeCurrentPage = 0;
  employeePageSize = 10;
  employeeTotalRecords = 0;
  employeeSearchTerm = '';
  departmentFilter = 'ALL';
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  uniqueDepartments: string[] = [];
  private employeeFilterChanges = new Subject<void>();
  private employeeFilterSubscription!: Subscription;

   payrolls: PayrollBatchResponse[] = [];
  isLoadingPayrolls = false;
  payrollsError = '';
  payrollCurrentPage = 0;
  payrollPageSize = 10;
  payrollTotalRecords = 0;
  payrollSearchTerm = '';
  hasPendingPayrolls = false;
  isPayrollRejectionDialogVisible = false;
  currentPayrollToReject: PayrollBatchResponse | null = null;
  private payrollFilterChanges = new Subject<void>();
  private payrollFilterSubscription!: Subscription;

   vendors: VendorResponse[] = [];
  isLoadingVendors = false;
  vendorsError = '';
  vendorCurrentPage = 0;
  vendorPageSize = 5;
  vendorTotalRecords = 0;
  clients: ClientResponseDto[] = [];
  isLoadingClients = false;
  clientsError = '';
  clientCurrentPage = 0;
  clientPageSize = 5;
  clientTotalRecords = 0;

  tabs = [
    { id: 'profile', label: 'Profile & Documents', icon: 'person-circle-outline' },
    { id: 'financials', label: 'Financials & Transactions', icon: 'wallet-outline' },
    { id: 'roster', label: 'Employee Roster', icon: 'people-outline' },
    { id: 'payroll', label: 'Payrolls Requests', icon: 'calendar-outline' },
    { id: 'vendors_clients', label: 'Vendors & Clients', icon: 'people-circle-outline' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService,
    private documentService: DocumentService,
    private transactionService: TransactionService,
    private employeeService: EmployeeService,
    private payrollService: PayrollService,
    private notificationService: NotificationService,
     private vendorService: VendorService,
    private clientService: ClientService,
  ) {}

  ngOnInit(): void {
    const organizationId = this.route.snapshot.paramMap.get('id');
    if (organizationId) {
      this.loadOrganizationDetails(+organizationId);
    } else {
      this.router.navigate(['/bank-admin/organizations']);
    }

    this.filterSubscription = this.filterChanges.pipe(debounceTime(400))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadTransactions();
      });

    this.employeeFilterSubscription = this.employeeFilterChanges.pipe(debounceTime(400))
      .subscribe(() => {
        this.employeeCurrentPage = 0;
        this.loadEmployees();
      });

    this.payrollFilterSubscription = this.payrollFilterChanges.pipe(debounceTime(400))
      .subscribe(() => {
        this.payrollCurrentPage = 0;
        this.loadPayrolls();
      });
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
    this.employeeFilterSubscription?.unsubscribe();
    this.payrollFilterSubscription?.unsubscribe();
  }

  // loadOrganizationDetails(organizationId: number): void {
  //   this.isLoading = true;
  //   this.error = '';
  //   this.organizationService.getOrganizationWithEmployees(organizationId).subscribe({
  //     next: (organization) => {
  //       this.organization = organization;
  //       this.checkAllDocumentsApproved();
  //       this.isLoading = false;
  //       if (this.activeTab !== 'profile') {
  //         this.handleTabSwitch(this.activeTab);
  //       }
  //     },
  //     error: (err: any) => {
  //       this.error = err.error?.message || 'Failed to load organization details';
  //       this.isLoading = false;
  //     },
  //   });
  // }

  // setActiveTab(tabId: string): void {
  //   this.activeTab = tabId;
  //   this.handleTabSwitch(tabId);
  // }

    loadOrganizationDetails(organizationId: number): void {
    this.isLoading = true;
    this.error = '';
    this.organizationService.getOrganizationWithEmployees(organizationId).subscribe({
      next: (organization) => {
        this.organization = organization;
        this.checkAllDocumentsApproved();
        this.isLoading = false;
        // Check for a specific tab in query params, e.g., ?tab=payroll
        const requestedTab = this.route.snapshot.queryParamMap.get('tab') || 'profile';
        this.setActiveTab(requestedTab);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load organization details';
        this.isLoading = false;
      },
    });
  }

  loadPayrolls(): void {
    if (!this.organization) return;
    this.isLoadingPayrolls = true;
    this.payrollsError = '';
    this.payrollService.getPayrollsForOrganization(this.organization.id, this.payrollCurrentPage, this.payrollPageSize)
      .subscribe({
        next: (response) => {
          this.payrolls = response.content || [];
          this.payrollTotalRecords = response.totalElements || 0;
          this.hasPendingPayrolls = this.payrolls.some(p => p.status === 'PENDING_APPROVAL');
          this.isLoadingPayrolls = false;
        },
        error: (err) => {
          this.payrollsError = 'Failed to load payroll history.';
          console.error(err);
          this.isLoadingPayrolls = false;
        }
      });
  }

  onPayrollPageChange(event: PageEvent): void {
    this.payrollCurrentPage = event.page;
    this.payrollPageSize = event.rows;
    this.loadPayrolls();
  }

  onPayrollSearchChange(): void {
    this.payrollFilterChanges.next();
  }

  approvePayroll(payrollId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.payrollService.approvePayroll(payrollId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Payroll batch approved and processed successfully.');
        this.loadPayrolls();
      },
      error: (err) => this.notificationService.showError(err.error?.message || 'Failed to approve payroll.')
    });
  }

  rejectPayroll(payroll: PayrollBatchResponse, event: MouseEvent): void {
    event.stopPropagation();
    this.currentPayrollToReject = payroll;
    this.isPayrollRejectionDialogVisible = true;
  }

  handlePayrollRejection(reason: string): void {
    if (this.currentPayrollToReject && reason) {
      this.payrollService.rejectPayroll(this.currentPayrollToReject.id, reason).subscribe({
        next: () => {
          this.notificationService.showSuccess('Payroll batch rejected successfully.');
          this.loadPayrolls();
        },
        error: (err) => this.notificationService.showError(err.error?.message || 'Failed to reject payroll.')
      });
    }
    this.closePayrollRejectionDialog();
  }

  closePayrollRejectionDialog(): void {
    this.isPayrollRejectionDialogVisible = false;
    this.currentPayrollToReject = null;
  }

  viewPayrollDetails(payrollId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/bank-admin/payroll-approval', payrollId]);
  }

  getPayrollPeriod(month: number, year: number): string {
    return new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  getPayrollStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
      case 'PROCESSED':
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400';
      case 'PENDING_APPROVAL':
        return 'bg-amber-500/20 text-amber-400';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-600 text-slate-300';
    }
  }
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabId },
      queryParamsHandling: 'merge',
    });
    this.handleTabSwitch(tabId);
  }

   private handleTabSwitch(tabId: string): void {
    if (tabId === 'financials') {
      this.loadTransactions();
    }
    if (tabId === 'roster') {
      this.loadAllEmployeesForFilters().then(() => {
        this.loadEmployees();
      });
    }
    if (tabId === 'payroll') {
      this.loadPayrolls();
    }
     if (tabId === 'vendors_clients') {
      this.loadVendors();
      this.loadClients();
    }
  }

   onVendorPageChange(event: PageEvent): void {
    this.vendorCurrentPage = event.page;
    this.vendorPageSize = event.rows;
    this.loadVendors();
  }

  onClientPageChange(event: PageEvent): void {
    this.clientCurrentPage = event.page;
    this.clientPageSize = event.rows;
    this.loadClients();
  }

  loadVendors(): void {
    if (!this.organization) return;
    this.isLoadingVendors = true;
    this.vendorsError = '';
    this.vendorService.getVendorsByOrganization(this.organization.id, this.vendorCurrentPage, this.vendorPageSize)
      .subscribe({
        next: (response) => {
          this.vendors = response.content || [];
          this.vendorTotalRecords = response.totalElements || 0;
          this.isLoadingVendors = false;
        },
        error: (err) => {
          this.vendorsError = 'Failed to load vendors.';
          this.isLoadingVendors = false;
        }
      });
  }

  loadClients(): void {
    if (!this.organization) return;
    this.isLoadingClients = true;
    this.clientsError = '';
    this.clientService.getClientsForOrganization(this.organization.id, this.clientCurrentPage, this.clientPageSize)
      .subscribe({
        next: (response) => {
          this.clients = response.content || [];
          this.clientTotalRecords = response.totalElements || 0;
          this.isLoadingClients = false;
        },
        error: (err) => {
          this.clientsError = 'Failed to load clients.';
          this.isLoadingClients = false;
        }
      });
  }

  async loadAllEmployeesForFilters(): Promise<void> {
    if (!this.organization || this.uniqueDepartments.length > 1) return;
    this.employeeService.getEmployeesByOrganization(this.organization.id, 0, 1000, null, null, null).subscribe({
      next: (response) => {
        const allEmployees: EmployeeResponseDto[] = response.content || [];
        if (allEmployees.length > 0) {
          const depts: string[] = allEmployees.map((e) => e.department).filter(Boolean);
          this.uniqueDepartments = ['ALL', ...new Set(depts)];
        } else {
          this.uniqueDepartments = ['ALL'];
        }
      },
    });
  }

 loadEmployees(): void {
  if (!this.organization) return;
  this.isLoadingEmployees = true;
  this.employeesError = '';

  const isActiveStatus: boolean | null = this.statusFilter === 'ALL'
    ? null
    : this.statusFilter === 'ACTIVE';

  this.employeeService.getEmployeesByOrganization(
    this.organization.id,
    this.employeeCurrentPage,
    this.employeePageSize,
    this.employeeSearchTerm,
    this.departmentFilter,
    isActiveStatus
  ).subscribe({
    next: (response: any) => {
      this.employees = response.content || [];
      this.employeeTotalRecords = response.totalElements || 0;
      this.isLoadingEmployees = false;

      // Debug logging
      if (this.employees.length > 0) {
        console.log('First employee status:', {
          name: this.employees[0].fullName,
          isEmployeeActive: this.employees[0].isEmployeeActive,
          type: typeof this.employees[0].isEmployeeActive
        });
      }
    },
    error: (err) => {
      this.employeesError = 'Failed to load employees. Please try again.';
      console.error('Employee loading error:', err);
      this.isLoadingEmployees = false;
    },
  });
}

    onEmployeeFilterChange(): void {
    this.employeeFilterChanges.next();
  }

  onEmployeePageChange(event: PageEvent): void {
    this.employeeCurrentPage = event.page;
    this.employeePageSize = event.rows;
    this.loadEmployees();
  }

  getEmployeeStatusClass(isActive: boolean): string {
    return isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-300';
  }

  loadTransactions(): void {
    if (!this.organization) return;
    this.isLoadingTransactions = true;
    this.transactionsError = '';
    this.transactionService.getTransactions(
      this.organization.id,
      this.currentPage,
      this.pageSize,
      this.searchTerm,
      this.startDate,
      this.endDate,
      this.typeFilter
    ).subscribe({
      next: (response) => {
        this.transactions = response.content || [];
        this.totalRecords = response.totalElements || 0;
        this.isLoadingTransactions = false;
      },
      error: (err) => {
        this.transactionsError = 'Failed to load transactions. Please try again later.';
        console.error(err);
        this.isLoadingTransactions = false;
      },
    });
  }


  onFilterChange(): void {
    this.filterChanges.next();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadTransactions();
  }
  // --- FIX END ---

  // ... The rest of your methods remain unchanged ...
  checkAllDocumentsApproved(): void {
    if (this.organization?.documents && this.organization.documents.length > 0) {
      this.areAllDocumentsApproved = this.organization.documents.every(
        (doc) => doc.status.toUpperCase() === 'APPROVED'
      );
    } else {
      this.areAllDocumentsApproved = false;
    }
  }

  approveOrganization(): void {
    if (this.organization) {
      this.organizationService.approveOrganization(this.organization.id).subscribe({
        next: () => this.loadOrganizationDetails(this.organization!.id),
        error: (err: any) => this.error = err.error?.message || 'Failed to approve organization',
      });
    }
  }

  rejectOrganization(): void {
    this.isOrgRejectionDialogVisible = true;
  }

  handleOrgRejection(reason: string): void {
    if (this.organization && reason) {
      this.organizationService.rejectOrganization(this.organization.id, reason).subscribe({
        next: () => this.router.navigate(['/bank-admin/organizations']),
        error: (err: any) => this.error = err.error?.message || 'Failed to reject organization',
      });
    }
    this.isOrgRejectionDialogVisible = false;
  }

  closeOrgRejectionDialog(): void {
    this.isOrgRejectionDialogVisible = false;
  }

  suspendOrganization(): void {
    if (this.organization) {
      this.organizationService.suspendOrganization(this.organization.id).subscribe({
        next: () => this.loadOrganizationDetails(this.organization!.id),
        error: (err: any) => this.error = err.error?.message || 'Failed to suspend organization',
      });
    }
  }

  reactivateOrganization(): void {
    if (this.organization) {
      this.organizationService.reactivateOrganization(this.organization.id).subscribe({
        next: () => this.loadOrganizationDetails(this.organization!.id),
        error: (err: any) => this.error = err.error?.message || 'Failed to reactivate organization',
      });
    }
  }

  approveDocument(doc: DocumentResponseDto): void {
    if (this.organization) {
      this.documentService.approveDocument(this.organization.id, doc.id).subscribe({
        next: () => this.loadOrganizationDetails(this.organization!.id),
        error: (err: any) => this.error = err.error?.message || 'Failed to approve document',
      });
    }
  }

  rejectDocument(doc: DocumentResponseDto): void {
    if (this.organization) {
      this.documentService.rejectDocument(this.organization.id, doc.id).subscribe({
        next: () => this.loadOrganizationDetails(this.organization!.id),
        error: (err: any) => this.error = err.error?.message || 'Failed to reject document',
      });
    }
  }

  viewDocument(doc: DocumentResponseDto): void {
    if (doc?.url) {
      window.open(doc.url, '_blank');
    }
  }

  get activeTabLabel(): string {
    return this.tabs.find((t) => t.id === this.activeTab)?.label || '';
  }

  goBack(): void {
    this.router.navigate(['/bank-admin/organizations']);
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const words = name.split(' ').filter(Boolean);
    return words.length > 1
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400';
      case 'PENDING_APPROVAL': return 'bg-amber-500/20 text-amber-400';
      case 'SUSPENDED':
      case 'REJECTED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-600 text-slate-300';
    }
  }

  getDocumentStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'APPROVED': return 'text-green-400';
      case 'PENDING': return 'text-amber-400';
      case 'REJECTED': return 'text-red-400';
      default: return 'text-slate-400';
    }
  }

  getTransactionTypeClass(type: string): string {
    return type.toUpperCase() === 'CREDIT'
      ? 'bg-green-500/20 text-green-400'
      : 'bg-red-500/20 text-red-400';
  }

    getStatusClass(isActive: boolean): string {
    return isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-300';
  }

  getTransactionTypeIcon(type: string): string {
    return type.toUpperCase() === 'CREDIT' ? 'arrow-up-outline' : 'arrow-down-outline';
  }
}
