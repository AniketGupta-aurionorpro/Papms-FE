import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rejection-dialog',
  templateUrl: './rejection-dialog.component.html',
  styleUrls: ['./rejection-dialog.component.css'],
  standalone:false
})
export class RejectionDialogComponent {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() submitRejection = new EventEmitter<string>();

  rejectionForm: FormGroup;
  showCustomReason = false;

  rejectionReasons: string[] = [
    'Document is blurry or unreadable',
    'Incorrect document type uploaded',
    'Document appears to be altered or fraudulent',
    'Information on document does not match registration details',
    'Document is expired',
    'Other (Please specify)'
  ];

  constructor(private fb: FormBuilder) {
    this.rejectionForm = this.fb.group({
      reason: [this.rejectionReasons[0], Validators.required],
      customReason: ['']
    });

    this.rejectionForm.get('reason')?.valueChanges.subscribe(value => {
      this.showCustomReason = (value === 'Other (Please specify)');
      if (this.showCustomReason) {
        this.rejectionForm.get('customReason')?.setValidators([Validators.required, Validators.minLength(10)]);
      } else {
        this.rejectionForm.get('customReason')?.clearValidators();
      }
      this.rejectionForm.get('customReason')?.updateValueAndValidity();
    });
  }

  onClose(): void {
    this.close.emit();
    this.rejectionForm.reset({ reason: this.rejectionReasons[0] });
  }

  onSubmit(): void {
    if (this.rejectionForm.invalid) {
      this.rejectionForm.markAllAsTouched();
      return;
    }

    const selectedReason = this.rejectionForm.get('reason')?.value;
    let finalReason = selectedReason;

    if (this.showCustomReason) {
      finalReason = this.rejectionForm.get('customReason')?.value;
    }

    this.submitRejection.emit(finalReason);
    this.onClose();
  }
}
