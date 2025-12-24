import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { VendorService } from '../../../../../services/vendor.service';
import { VendorResponse } from '../../../../../models/vendor.models';
import { PageEvent, PaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent, LoadingSpinnerComponent],
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VendorListComponent implements OnInit {
  organizationId!: number;
  vendors: VendorResponse[] = [];
  filteredVendors: VendorResponse[] = [];
  isLoading = true;
  error: string | null = null;

  // Pagination
  totalRecords = 0;
  currentPage = 0;
  pageSize = 10;

  // Filters
  searchTerm = '';
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';

  // Stats
  totalVendors = 0;
  activeVendors = 0;
  inactiveVendors = 0;

  // Delete confirmation
  showDeleteModal = false;
  vendorToDelete: VendorResponse | null = null;
  isDeleting = false;

  constructor(
    private authService: AuthService,
    private vendorService: VendorService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (!userInfo?.organizationId) {
      this.error = 'Could not identify your organization.';
      this.isLoading = false;
      return;
    }
    this.organizationId = userInfo.organizationId;
    this.loadVendors();
  }

  loadVendors(): void {
    this.isLoading = true;
    this.error = null;

    this.vendorService.getVendorsByOrganization(this.organizationId, this.currentPage, this.pageSize)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.vendors = response.content;
          this.totalRecords = response.totalElements;
          this.calculateStats();
          this.applyFilters();
          if (this.vendors.length === 0 && this.currentPage === 0) {
            this.notificationService.showInfo('No vendors found. Add your first vendor to get started.');
          }
        },
        error: (err) => {
          this.error = this.extractErrorMessage(err);
          this.notificationService.showError(this.error);
        }
      });
  }

  calculateStats(): void {
    this.totalVendors = this.totalRecords;
    this.activeVendors = this.vendors.filter(v => v.isActive).length;
    this.inactiveVendors = this.vendors.filter(v => !v.isActive).length;
  }

  applyFilters(): void {
    let result = [...this.vendors];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(v =>
        v.vendorName.toLowerCase().includes(term) ||
        v.contactEmail.toLowerCase().includes(term) ||
        v.bankName?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.statusFilter !== 'ALL') {
      result = result.filter(v =>
        this.statusFilter === 'ACTIVE' ? v.isActive : !v.isActive
      );
    }

    this.filteredVendors = result;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadVendors();
  }

  // Delete vendor
  confirmDelete(vendor: VendorResponse): void {
    this.vendorToDelete = vendor;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.vendorToDelete = null;
  }

  deleteVendor(): void {
    if (!this.vendorToDelete) return;

    this.isDeleting = true;
    this.vendorService.deleteVendor(this.vendorToDelete.id)
      .pipe(finalize(() => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.vendorToDelete = null;
      }))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Vendor deleted successfully');
          this.loadVendors();
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to delete vendor');
        }
      });
  }

  // Helpers
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    return '****' + accountNumber.slice(-4);
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view vendors.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load vendors. Please try again.';
  }
}
