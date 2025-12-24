import {
  Component,
  OnInit,
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // NEW: Import RouterModule for routerLink
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { EmployeeService } from '../../../../../services/employee.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';

import {
  CompleteEmployeeResponse,
  UpdateEmployeeRequest,
} from '../../../../../models/employee.models';
// NEW: Import the PageEvent interface
import {
  PageEvent,
  PaginationComponent,
} from '../../../../shared/components/ui/pagination/pagination.component';
import { EmployeeViewModalComponent } from '../../../../shared/components/modals/employee-view-modal/employee-view-modal.component';
import { EmployeeEditModalComponent } from '../../../../shared/components/modals/employee-edit-modal/employee-edit-modal.component';
import { MaskAccountPipe } from '../../../../shared/pipes/mask-account.pipe';

import { UpdateCompleteEmployeeRequest } from '../../../../../models/employee.models';
@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule, // NEW: Add RouterModule to imports
    PaginationComponent,
    EmployeeViewModalComponent,
    EmployeeEditModalComponent,
    MaskAccountPipe,
  ],
  templateUrl: './employee-list.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees: CompleteEmployeeResponse[] = [];
  isLoading = true;
  error: string | null = null;
  organizationId!: number;
  departmentFilter = 'ALL';
  uniqueDepartments: string[] = ['ALL'];
  // Filtering
  searchTerm = '';
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
  private filterSubject = new Subject<void>();
  private filterSubscription!: Subscription;

  // MODIFIED: Renamed properties for clarity (removed 'employee' prefix)
  totalRecords = 0;
  currentPage = 0;
  pageSize = 10;

  // Modals
  isViewModalVisible = false;
  isEditModalVisible = false;
  selectedEmployee: CompleteEmployeeResponse | null = null;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();

    if (!userInfo || !userInfo.organizationId) {
      this.error = 'Could not identify your organization.';
      this.isLoading = false;
      return;
    }
    this.organizationId = userInfo.organizationId;
    this.loadEmployees();
    this.loadInitialFilterData();
    this.filterSubscription = this.filterSubject
      .pipe(debounceTime(300))
      .subscribe(() => {
        // MODIFIED: Reset to first page on any filter change
        this.currentPage = 0;
        this.loadEmployees();
      });
  }

  ngOnDestroy(): void {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  loadInitialFilterData(): void {
    // Fetch all employees on a single page to populate filters
    this.employeeService
      .getEmployeesByOrganization(
        this.organizationId,
        0,
        1000,
        null,
        null,
        null
      )
      .subscribe((response) => {
        const allEmployees = response.content;
        if (allEmployees) {
          const depts = allEmployees.map((e) => e.department).filter(Boolean);
          this.uniqueDepartments = ['ALL', ...Array.from(new Set(depts))];
        }
      });
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.error = null;
    const isActive =
      this.statusFilter === 'ALL' ? undefined : this.statusFilter === 'ACTIVE';

    this.employeeService
      .getEmployeesByOrganization(
        this.organizationId,
        this.currentPage,
        this.pageSize,
        this.searchTerm,
        this.departmentFilter,
        isActive
      )
      .subscribe({
        next: (response) => {
          this.employees = response.content;
          this.totalRecords = response.totalElements;
          this.isLoading = false;
          if (this.employees.length === 0 && this.currentPage === 0 && !this.searchTerm) {
            this.notificationService.showInfo('No employees found. Add your first employee to get started.');
          }
        },
        error: (err) => {
          this.error = this.extractErrorMessage(err);
          this.notificationService.showError(this.error);
          this.isLoading = false;
          console.error(err);
        },
      });
  }

  onFilterChange(): void {
    this.filterSubject.next();
  }

  // NEW: Method to handle page change event from the pagination component
  onPageChange(event: PageEvent): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadEmployees();
  }

  openViewModal(employee: CompleteEmployeeResponse): void {
    this.selectedEmployee = employee;
    this.isViewModalVisible = true;
  }

  closeViewModal(): void {
    this.isViewModalVisible = false;
    this.selectedEmployee = null;
  }

  openEditModal(employee: CompleteEmployeeResponse): void {
    this.selectedEmployee = { ...employee }; // Create a copy to avoid live editing
    this.isEditModalVisible = true;
  }

  closeEditModal(): void {
    this.isEditModalVisible = false;
    this.selectedEmployee = null;
  }

  handleSaveEmployee(updateRequest: UpdateCompleteEmployeeRequest): void {
    if (!this.selectedEmployee) return;

    this.employeeService.updateCompleteEmployee(this.organizationId, this.selectedEmployee.id, updateRequest).subscribe({
      next: () => {
        this.notificationService.showSuccess('Employee updated successfully.');
        this.closeEditModal();
        this.loadEmployees(); // Refresh the list
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || 'Failed to update employee.');
        console.error(err);
      }
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }


  scheduleDeletion(employee: CompleteEmployeeResponse, event: MouseEvent): void {
    event.stopPropagation();

    const confirmation = confirm(
      `Are you sure you want to schedule ${employee.fullName} for permanent deletion?\n\n` +
      `This will immediately deactivate their account, and all their data will be permanently erased in 30 days. This action cannot be undone.`
    );

    if (confirmation) {
      this.isLoading = true;
      this.notificationService.showInfo('Processing deletion request...');
      this.employeeService.scheduleHardDeletion(this.organizationId, employee.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`${employee.fullName} is scheduled for permanent deletion in 30 days. Their account is now inactive.`);
          this.loadEmployees();
        },
        error: (err) => {
          this.isLoading = false;
          this.notificationService.showError(this.extractErrorMessage(err));
        }
      });
    }
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to perform this action.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'An error occurred. Please try again.';
  }
}
