import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { ClientPortalService } from '../../../../../services/client-portal.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ClientDto, ClientStatus, OnboardClientRequest } from '../../../../../models/client-portal.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientListComponent implements OnInit {
  clients: ClientDto[] = [];
  filteredClients: ClientDto[] = [];
  isLoading = true;
  error: string | null = null;

  // Pagination
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  // Filters
  searchTerm = '';
  statusFilter: string = 'ALL';
  statuses = ['ALL', 'ACTIVE', 'SUSPENDED', 'INACTIVE'];

  // Stats
  totalClients = 0;
  activeClients = 0;
  totalBalance = 0;

  // Onboard Modal
  showOnboardModal = false;
  isOnboarding = false;
  onboardForm!: FormGroup;

  ClientStatus = ClientStatus; // For template access

  constructor(
    private clientPortalService: ClientPortalService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadClients();
  }

  initForm(): void {
    this.onboardForm = this.fb.group({
      clientName: ['', [Validators.required, Validators.minLength(3)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.pattern('^[0-9]{10}$')]],
      address: ['']
    });
  }

  // Getter for easy access to form fields
  get f() { return this.onboardForm.controls; }

  loadClients(): void {
    this.isLoading = true;
    this.error = null;
    this.clientPortalService.getAllClients(this.page, this.size)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: any) => {
          this.clients = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;

          this.calculateStats();
          this.applyFilters();

          if (this.clients.length === 0 && this.page === 0) {
            this.notificationService.showInfo('No clients found.');
          }
        },
        error: (err: any) => {
          this.error = this.extractErrorMessage(err);
          this.notificationService.showError(this.error);
        }
      });
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadClients();
  }

  calculateStats(): void {
    this.totalClients = this.totalElements; // Use total from API
    // Note: Active count and balance might be inaccurate if only fetching one page, 
    // but for now we calculate based on loaded data or need a separate stats API.
    // Keeping current logic for visible items.
    this.activeClients = this.clients.filter(c => c.status === 'ACTIVE').length;
    this.totalBalance = this.clients.reduce((sum, c) => sum + (c.balance || 0), 0);
  }

  applyFilters(): void {
    let result = [...this.clients];

    // Search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.clientName.toLowerCase().includes(search) ||
        c.contactEmail.toLowerCase().includes(search) ||
        (c.contactPhone && c.contactPhone.includes(search))
      );
    }

    // Status filter
    if (this.statusFilter !== 'ALL') {
      result = result.filter(c => c.status === this.statusFilter);
    }

    this.filteredClients = result;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.applyFilters();
  }

  // Onboard Modal
  openOnboardModal(): void {
    this.onboardForm.reset();
    this.showOnboardModal = true;
  }

  closeOnboardModal(): void {
    this.showOnboardModal = false;
  }

  onboardClient(): void {
    if (this.onboardForm.invalid) {
      this.onboardForm.markAllAsTouched();
      return;
    }

    this.isOnboarding = true;
    const request: OnboardClientRequest = this.onboardForm.value;

    this.clientPortalService.onboardClient(request)
      .pipe(finalize(() => {
        this.isOnboarding = false;
        this.closeOnboardModal();
      }))
      .subscribe({
        next: (client: ClientDto) => {
          this.notificationService.showSuccess(`Client ${client.clientName} onboarded successfully. Credentials sent to ${client.contactEmail}`);
          this.loadClients();
        },
        error: (err: any) => {
          this.notificationService.showError(err.error?.message || 'Failed to onboard client');
        }
      });
  }

  suspendClient(client: ClientDto): void {
    if (!confirm(`Are you sure you want to suspend ${client.clientName}?`)) return;

    this.clientPortalService.suspendClient(client.id).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Client ${client.clientName} suspended`);
        this.loadClients();
      },
      error: (err: any) => {
        this.notificationService.showError(err.error?.message || 'Failed to suspend client');
      }
    });
  }

  activateClient(client: ClientDto): void {
    this.clientPortalService.activateClient(client.id).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Client ${client.clientName} activated`);
        this.loadClients();
      },
      error: (err: any) => {
        this.notificationService.showError(err.error?.message || 'Failed to activate client');
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'ACTIVE': 'text-green-400 bg-green-500/20',
      'SUSPENDED': 'text-red-400 bg-red-500/20',
      'INACTIVE': 'text-slate-400 bg-slate-500/20'
    };
    return colors[status] || 'text-slate-400 bg-slate-500/20';
  }

  formatCurrency(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to perform this action.';
    if (err.status === 500) return 'Server error occurred. Please try again later.';
    return 'An unexpected error occurred.';
  }
}
