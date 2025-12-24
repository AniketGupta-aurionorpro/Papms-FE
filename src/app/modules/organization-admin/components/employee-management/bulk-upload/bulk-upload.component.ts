import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { EmployeeService } from '../../../../../services/employee.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { FileDownloadService } from '../../../../../services/file-download.service';
import { JobReportService } from '../../../../../services/job-report.service';
import { JobReport } from '../../../../../models/job-report.models';
import { PageEvent, PaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [NotificationService]
})
export class BulkUploadComponent implements OnInit {
  organizationId!: number;
  selectedFile: File | null = null;
  isLoading = false;
  isDownloading = false;

  reports: JobReport[] = [];
  historyIsLoading = true;
  historyError: string | null = null;
  totalRecords = 0;
  currentPage = 0;
  pageSize = 5;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fileDownloadService: FileDownloadService,
    private jobReportService: JobReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (!userInfo || !userInfo.organizationId) {
      this.notificationService.showError("Could not identify your organization.");
      this.router.navigate(['/org-admin/dashboard']);
      return;
    }
    this.organizationId = userInfo.organizationId;
    this.loadHistory();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        this.selectedFile = file;
      } else {
        this.notificationService.showError('Invalid file type. Please upload a .csv file.');
        this.selectedFile = null;
        (event.target as HTMLInputElement).value = '';
      }
    }
  }

  downloadTemplate(): void {
    this.isDownloading = true;
    this.employeeService.downloadBulkUploadTemplate(this.organizationId)
      .pipe(finalize(() => this.isDownloading = false))
      .subscribe({
        next: (blob) => {
          this.fileDownloadService.downloadFile(blob, 'employee_upload_template.csv');
          this.notificationService.showSuccess('Template downloaded successfully.');
        },
        error: () => {
          this.notificationService.showError('Failed to download the template.');
        }
      });
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.notificationService.showWarning('Please select a CSV file to upload.');
      return;
    }

    this.isLoading = true;
    this.employeeService.bulkUploadEmployeesBatch(this.organizationId, this.selectedFile)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('File uploaded! The import job has started.');
          this.notificationService.showInfo('The history will update shortly.');
          this.reset();
          setTimeout(() => this.loadHistory(), 3000);
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to start the bulk upload job.');
        }
      });
  }

  reset(): void {
    this.selectedFile = null;
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  loadHistory(): void {
    this.historyIsLoading = true;
    this.historyError = null;
    this.jobReportService.getReportsForOrganization(this.organizationId, this.currentPage, this.pageSize)
      .pipe(finalize(() => this.historyIsLoading = false))
      .subscribe({
        next: (response) => {
          this.reports = response.content;
          this.totalRecords = response.totalElements;
        },
        error: (err) => {
          // --- FIX START ---
          // Create a local constant that is guaranteed to be a string.
          const errorMessage = err.error?.message || "Failed to load upload history. Please try again later.";
          this.historyError = errorMessage;
          // Pass the guaranteed string to the notification service.
          this.notificationService.showError(errorMessage);
          // --- FIX END ---
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadHistory();
  }

  viewReport(reportId: number): void {
    this.router.navigate(['/org-admin/employees/bulk-upload-report', reportId]);
  }

  getStatusClass(status: string): string {
    if (status === 'COMPLETED') return 'bg-green-500/20 text-green-400';
    if (status === 'FAILED') return 'bg-red-500/20 text-red-400';
    return 'bg-amber-500/20 text-amber-400'; // Default for STARTING/STARTED
  }
}
