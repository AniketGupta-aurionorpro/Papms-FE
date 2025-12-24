import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ConcernService } from '../../../../../services/concern.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ConcernResponseDto, ConcernStatus } from '../../../../../models/concern.models';

@Component({
  selector: 'app-my-concerns',
  templateUrl: './my-concerns.component.html',
  styleUrls: ['./my-concerns.component.css'],
  standalone: false
})
export class MyConcernsComponent implements OnInit {
  isLoading = true;
  error = '';
  concerns: ConcernResponseDto[] = [];

  constructor(
    private concernService: ConcernService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadConcerns();
  }

  loadConcerns(): void {
    this.isLoading = true;
    this.error = '';

    this.concernService.getMyConcerns()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.concerns = data || [];
        },
        error: (err) => {
          this.error = 'Failed to load concerns';
          this.notificationService.showError(this.error);
        }
      });
  }

  viewConcern(concernId: number): void {
    this.router.navigate(['/employee/concerns', concernId]);
  }

  raiseConcern(): void {
    this.router.navigate(['/employee/concerns/raise']);
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
