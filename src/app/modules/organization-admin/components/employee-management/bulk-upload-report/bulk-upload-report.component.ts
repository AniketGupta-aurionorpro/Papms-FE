import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { JobReportService } from '../../../../../services/job-report.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { JobReport } from '../../../../../models/job-report.models';

@Component({
  selector: 'app-bulk-upload-report',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bulk-upload-report.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BulkUploadReportComponent implements OnInit {
  report: JobReport | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private jobReportService: JobReportService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const reportId = this.route.snapshot.paramMap.get('reportId');
    if (reportId) {
      this.loadReport(+reportId);
    } else {
      this.error = "Report ID is missing.";
      this.isLoading = false;
    }
  }

  loadReport(reportId: number): void {
    this.isLoading = true;
    this.error = null;
    this.jobReportService.getReportById(reportId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.report = response;
        },
        error: (err) => {
          this.error = "Failed to load report details.";
          this.notificationService.showError(this.error);
        }
      });
  }

  getStatusClass(status: string): string {
    if (status === 'COMPLETED') return 'bg-green-500/20 text-green-400';
    if (status === 'FAILED') return 'bg-red-500/20 text-red-400';
    return 'bg-slate-600 text-slate-300';
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view this report.';
    if (err.status === 404) return 'Report not found.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load report. Please try again.';
  }
}
