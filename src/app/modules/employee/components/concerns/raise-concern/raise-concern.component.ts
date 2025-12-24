import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ConcernService } from '../../../../../services/concern.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-raise-concern',
  templateUrl: './raise-concern.component.html',
  styleUrls: ['./raise-concern.component.css'],
  standalone: false
})
export class RaiseConcernComponent {
  isSubmitting = false;
  concernForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private concernService: ConcernService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.concernForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]]
    });
  }

  submitConcern(): void {
    if (this.concernForm.invalid) {
      this.markFormTouched();
      return;
    }

    this.isSubmitting = true;
    const request = {
      subject: this.concernForm.value.subject,
      description: this.concernForm.value.description
    };

    this.concernService.raiseConcern(request)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Concern raised successfully!');
          this.router.navigate(['/employee/concerns']);
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to raise concern');
        }
      });
  }

  private markFormTouched(): void {
    Object.keys(this.concernForm.controls).forEach(key => {
      this.concernForm.get(key)?.markAsTouched();
    });
  }

  cancel(): void {
    this.router.navigate(['/employee/concerns']);
  }
}
