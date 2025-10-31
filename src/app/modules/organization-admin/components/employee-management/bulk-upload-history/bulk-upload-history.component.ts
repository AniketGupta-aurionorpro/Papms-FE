import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { JobReportService } from '../../../../../services/job-report.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { JobReport } from '../../../../../models/job-report.models';
import { PageEvent, PaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';

@Component({
  selector: 'app-bulk-upload-history',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  templateUrl: './bulk-upload-history.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BulkUploadHistoryComponent implements OnInit {
  reports: JobReport[] = [];
  isLoading = true;
  error: string | null = null;
  organizationId!: number;

  totalRecords = 0;
  currentPage = 0;
  pageSize = 10;

  constructor(
    private jobReportService: JobReportService,
    private authService: AuthService,
    private notificationService: NotificationService,
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

  loadHistory(): void {
    this.isLoading = true;
    this.error = null;
    this.jobReportService.getReportsForOrganization(this.organizationId, this.currentPage, this.pageSize)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.reports = response.content;
          this.totalRecords = response.totalElements;
        },
        error: (err) => {
          this.error = "Failed to load upload history. Please try again later.";
          this.notificationService.showError(this.error);
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
    return 'bg-slate-600 text-slate-300';
  }
}
