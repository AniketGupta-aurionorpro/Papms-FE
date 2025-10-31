import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // **CRITICAL FIX: Added Router import**
import { finalize } from 'rxjs';

import { EmployeeService } from '../../../../../services/employee.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { FileDownloadService } from '../../../../../services/file-download.service';


@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [NotificationService] // **CRITICAL FIX: Provide the service here**
})
export class BulkUploadComponent implements OnInit {
  organizationId!: number;
  selectedFile: File | null = null;
  isLoading = false;
  isDownloading = false;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fileDownloadService: FileDownloadService,
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
        next: (response) => {
          this.notificationService.showSuccess('File uploaded successfully! The import job has started.');
          this.notificationService.showInfo('You will receive a notification once the processing is complete.');
          this.reset();
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
}
