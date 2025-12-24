import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { InvoiceService } from '../../../../../services/invoice.service';
import { ClientPortalService } from '../../../../../services/client-portal.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { InvoiceRequestDto } from '../../../../../models/invoice.models';
import { ClientDto } from '../../../../../models/client-portal.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateInvoiceComponent implements OnInit {
  clients: ClientDto[] = [];
  isLoadingClients = true;
  isSubmitting = false;

  // Search Dropdown
  searchTerm = '';
  showDropdown = false;
  filteredClients: ClientDto[] = [];

  // Form fields
  invoiceRequest: InvoiceRequestDto = {
    clientId: 0,
    invoiceNumber: '',
    amount: 0,
    issueDate: '',
    dueDate: ''
  };

  // Options
  sendEmailOnCreate = true;
  invoicePrefix = 'INV';

  // Validation
  formErrors: { [key: string]: string } = {};

  constructor(
    private invoiceService: InvoiceService,
    private clientPortalService: ClientPortalService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadClients();
    this.setDefaultDates();
    this.generateInvoiceNumber();
  }

  loadClients(): void {
    this.isLoadingClients = true;
    // Fetch a larger page to ensure we get most clients for the dropdown
    this.clientPortalService.getAllClients(0, 100)
      .pipe(finalize(() => this.isLoadingClients = false))
      .subscribe({
        next: (response: any) => {
          // Handle paginated response
          const clientList = response.content || [];
          this.clients = clientList.filter((c: any) => c.status === 'ACTIVE');
          this.filteredClients = this.clients; // Initialize filtered list

          if (this.clients.length === 0) {
            this.notificationService.showWarning('No active clients found. Please onboard a client first.');
          }
        },
        error: (err: any) => {
          this.notificationService.showError('Failed to load clients');
        }
      });
  }

  setDefaultDates(): void {
    const today = new Date();
    this.invoiceRequest.issueDate = this.formatDateForInput(today);

    // Default due date: 30 days from today
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);
    this.invoiceRequest.dueDate = this.formatDateForInput(dueDate);
  }

  generateInvoiceNumber(): void {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.invoiceRequest.invoiceNumber = `${this.invoicePrefix}-${timestamp}-${random}`;
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  validateForm(): boolean {
    this.formErrors = {};

    if (!this.invoiceRequest.clientId || this.invoiceRequest.clientId === 0) {
      this.formErrors['clientId'] = 'Please select a client';
    }

    if (!this.invoiceRequest.invoiceNumber?.trim()) {
      this.formErrors['invoiceNumber'] = 'Invoice number is required';
    }

    if (!this.invoiceRequest.amount || this.invoiceRequest.amount <= 0) {
      this.formErrors['amount'] = 'Amount must be greater than 0';
    }

    if (!this.invoiceRequest.issueDate) {
      this.formErrors['issueDate'] = 'Issue date is required';
    }

    if (!this.invoiceRequest.dueDate) {
      this.formErrors['dueDate'] = 'Due date is required';
    }

    if (this.invoiceRequest.issueDate && this.invoiceRequest.dueDate) {
      if (new Date(this.invoiceRequest.dueDate) < new Date(this.invoiceRequest.issueDate)) {
        this.formErrors['dueDate'] = 'Due date cannot be before issue date';
      }
    }

    return Object.keys(this.formErrors).length === 0;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      this.notificationService.showError('Please fix the form errors');
      return;
    }

    this.isSubmitting = true;

    const createObservable = this.sendEmailOnCreate
      ? this.invoiceService.createAndSendInvoice(this.invoiceRequest)
      : this.invoiceService.createInvoice(this.invoiceRequest);

    createObservable
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          const message = this.sendEmailOnCreate
            ? `Invoice #${response.invoiceNumber} created and sent to ${response.clientEmail}`
            : `Invoice #${response.invoiceNumber} created successfully`;
          this.notificationService.showSuccess(message);
          this.router.navigate(['/org-admin/invoices']);
        },
        error: (err: any) => {
          this.notificationService.showError(err.error?.message || 'Failed to create invoice');
        }
      });
  }

  getSelectedClient(): ClientDto | undefined {
    return this.clients.find(c => c.id === this.invoiceRequest.clientId);
  }

  onClientChange(): void {
    // Clear any client-related errors when a new client is selected
    delete this.formErrors['clientId'];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  }

  filterClients(): void {
    if (!this.searchTerm) {
      this.filteredClients = this.clients;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(c =>
      c.clientName.toLowerCase().includes(term) ||
      c.contactEmail.toLowerCase().includes(term)
    );
  }

  selectClient(client: ClientDto): void {
    this.invoiceRequest.clientId = client.id;
    this.searchTerm = client.clientName;
    this.showDropdown = false;
    this.onClientChange();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdownWithDelay(): void {
    // Small delay to allow click event on dropdown item to register
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }
}
