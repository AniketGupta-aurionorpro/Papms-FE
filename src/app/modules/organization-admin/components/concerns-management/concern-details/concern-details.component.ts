import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConcernService } from '../../../../../services/concern.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ConcernResponseDto, ConcernStatus, UpdateConcernStatusRequest } from '../../../../../models/concern.models';

@Component({
  selector: 'app-concern-details',
  templateUrl: './concern-details.component.html',
  styleUrls: ['./concern-details.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConcernDetailsComponent implements OnInit {
  isLoading = true;
  isUpdating = false;
  error = '';
  concern: ConcernResponseDto | null = null;
  concernId = 0;

  // Status update
  showStatusForm = false;
  statusForm: FormGroup;
  ConcernStatus = ConcernStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private concernService: ConcernService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.statusForm = this.fb.group({
      status: [ConcernStatus.IN_PROGRESS, Validators.required],
      resolutionNotes: ['']
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || isNaN(+idParam)) {
      this.error = 'Invalid concern ID';
      this.isLoading = false;
      return;
    }
    this.concernId = +idParam;
    this.loadConcern();
  }

  loadConcern(): void {
    this.isLoading = true;
    this.error = '';

    this.concernService.getConcernById(this.concernId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.concern = data;
          this.statusForm.patchValue({
            status: data.status,
            resolutionNotes: data.resolutionNotes || ''
          });
        },
        error: (err) => {
          this.error = 'Failed to load concern details';
          this.notificationService.showError(this.error);
        }
      });
  }

  updateStatus(): void {
    if (this.statusForm.invalid || !this.concern) return;

    this.isUpdating = true;
    const request: UpdateConcernStatusRequest = {
      status: this.statusForm.value.status,
      resolutionNotes: this.statusForm.value.resolutionNotes
    };

    this.concernService.updateConcernStatus(this.concernId, request)
      .pipe(finalize(() => this.isUpdating = false))
      .subscribe({
        next: (updatedConcern) => {
          this.concern = updatedConcern;
          this.showStatusForm = false;
          this.notificationService.showSuccess('Concern status updated successfully!');
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to update concern status');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/org-admin/concerns']);
  }

  toggleStatusForm(): void {
    this.showStatusForm = !this.showStatusForm;
  }

  getStatusClass(status: ConcernStatus): string {
    switch (status) {
      case ConcernStatus.OPEN:
        return 'bg-blue-900/50 text-blue-400 border-blue-700/50';
      case ConcernStatus.IN_PROGRESS:
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700/50';
      case ConcernStatus.RESOLVED:
        return 'bg-green-900/50 text-green-400 border-green-700/50';
      case ConcernStatus.CLOSED:
        return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
      default:
        return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
    }
  }

  getStatusIcon(status: ConcernStatus): string {
    switch (status) {
      case ConcernStatus.OPEN:
        return 'radio-button-on-outline';
      case ConcernStatus.IN_PROGRESS:
        return 'hourglass-outline';
      case ConcernStatus.RESOLVED:
        return 'checkmark-circle-outline';
      case ConcernStatus.CLOSED:
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  }
}
