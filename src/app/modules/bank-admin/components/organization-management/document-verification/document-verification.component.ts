import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DocumentResponseDto, OrganizationResponseDto } from '../../../../../models/organization.models';
import { DocumentService } from '../../../../../services/document.service';
import { LoadingService } from '../../../../../services/loading.service';
import { OrganizationService } from '../../../../../services/organization.service';
import { NotificationService } from '../../../../../core/services/notification.service';


interface DocumentWithOrganization extends DocumentResponseDto {
  organization?: OrganizationResponseDto;
}

@Component({
  selector: 'app-document-verification',
  templateUrl: './document-verification.component.html',
  styleUrls: ['./document-verification.component.css'],
  standalone: false,
})
export class DocumentVerificationComponent implements OnInit {
  organizations: OrganizationResponseDto[] = [];
  documents: DocumentWithOrganization[] = [];
  isLoading = true;
  error = '';
  searchTerm = '';
  activeTab = 'pending';

  tabs = [
    { id: 'pending', label: 'Pending', icon: 'time-outline' },
    { id: 'approved', label: 'Approved', icon: 'checkmark-circle-outline' },
    { id: 'rejected', label: 'Rejected', icon: 'close-circle-outline' }
  ];

  constructor(
    private organizationService: OrganizationService,
    private documentService: DocumentService,
    private loadingService: LoadingService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadOrganizationsAndDocuments();
  }

  loadOrganizationsAndDocuments(): void {
    this.isLoading = true;
    this.organizationService.getAllOrganizations().subscribe({
      next: (organizations) => {
        this.organizations = organizations;
        this.processDocuments();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = this.extractErrorMessage(error);
        this.notificationService.showError(this.error);
        this.isLoading = false;
      }
    });
  }

  processDocuments(): void {
    this.documents = [];
    this.organizations.forEach(org => {
      if (org.documents) {
        org.documents.forEach(doc => {
          this.documents.push({
            ...doc,
            organization: org
          });
        });
      }
    });
  }

  getFilteredDocuments(): DocumentWithOrganization[] {
    let filtered = this.documents.filter(doc => {
      if (this.activeTab === 'pending' && doc.status === 'PENDING') {
        return true;
      } else if (this.activeTab === 'approved' && doc.status === 'APPROVED') {
        return true;
      } else if (this.activeTab === 'rejected' && doc.status === 'REJECTED') {
        return true;
      }
      return false;
    });

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(doc =>
        doc.organization?.companyName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }

  onSearchChange(): void {
    // Filtering is handled in getFilteredDocuments()
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'checkmark-circle-outline';
      case 'REJECTED':
        return 'close-circle-outline';
      case 'PENDING':
        return 'time-outline';
      default:
        return 'help-circle-outline';
    }
  }

  getDocumentIcon(type: string): string {
    switch (type) {
      case 'ORGANIZATION_VERIFICATION':
        return 'business-outline';
      default:
        return 'document-outline';
    }
  }

  approveDocument(organizationId: number, documentId: number): void {
    if (!organizationId) {
      this.notificationService.showError('Organization ID is required');
      return;
    }

    this.documentService.approveDocument(organizationId, documentId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Document approved successfully!');
        this.loadOrganizationsAndDocuments();
      },
      error: (error) => {
        this.notificationService.showError(error.error?.message || 'Failed to approve document');
      }
    });
  }

  rejectDocument(organizationId: number, documentId: number): void {
    if (!organizationId) {
      this.notificationService.showError('Organization ID is required');
      return;
    }

    this.documentService.rejectDocument(organizationId, documentId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Document rejected.');
        this.loadOrganizationsAndDocuments();
      },
      error: (error) => {
        this.notificationService.showError(error.error?.message || 'Failed to reject document');
      }
    });
  }

  viewOrganization(organizationId: number): void {
    this.router.navigate(['/bank-admin/organizations', organizationId]);
  }

  downloadDocument(document: DocumentWithOrganization): void {
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      this.error = 'Document URL not available';
    }
  }

  getTotalPending(): number {
    return this.documents.filter(doc => doc.status === 'PENDING').length;
  }

  getTotalApproved(): number {
    return this.documents.filter(doc => doc.status === 'APPROVED').length;
  }

  getTotalRejected(): number {
    return this.documents.filter(doc => doc.status === 'REJECTED').length;
  }

  // Helper method to safely get organization name
  getOrganizationName(document: DocumentWithOrganization): string {
    return document.organization?.companyName || 'Unknown Organization';
  }

  // Helper method to safely get organization ID
  getOrganizationId(document: DocumentWithOrganization): number {
    return document.organization?.id || 0;
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to verify documents.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load documents. Please try again.';
  }
}
