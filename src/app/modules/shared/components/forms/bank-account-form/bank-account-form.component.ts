import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-bank-account-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="parentForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1">Account Holder Name</label>
        <input type="text" formControlName="accountHolderName" class="form-input-dark w-full">
        <div *ngIf="parentForm.get('accountHolderName')?.invalid && parentForm.get('accountHolderName')?.touched" class="text-xs text-red-400 mt-1">
          Account holder name is required.
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Account Number</label>
          <input type="text" formControlName="accountNumber" class="form-input-dark w-full">
          <div *ngIf="parentForm.get('accountNumber')?.invalid && parentForm.get('accountNumber')?.touched" class="text-xs text-red-400 mt-1">
            <span *ngIf="parentForm.get('accountNumber')?.hasError('required')">Account number is required.</span>
            <span *ngIf="parentForm.get('accountNumber')?.hasError('pattern')">Must be numeric.</span>
            <span *ngIf="parentForm.get('accountNumber')?.hasError('minlength') || parentForm.get('accountNumber')?.hasError('maxlength')">Must be between 5 and 20 digits.</span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Bank Name</label>
          <input type="text" formControlName="bankName" class="form-input-dark w-full">
          <div *ngIf="parentForm.get('bankName')?.invalid && parentForm.get('bankName')?.touched" class="text-xs text-red-400 mt-1">
            Bank name is required.
          </div>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1">IFSC Code</label>
        <input type="text" formControlName="ifscCode" class="form-input-dark w-full" placeholder="ABCD0123456">
        <!-- **FIX: Added detailed validation messages** -->
        <div *ngIf="parentForm.get('ifscCode')?.invalid && parentForm.get('ifscCode')?.touched" class="text-xs text-red-400 mt-1">
          <span *ngIf="parentForm.get('ifscCode')?.hasError('required')">IFSC code is required.</span>
          <span *ngIf="parentForm.get('ifscCode')?.hasError('pattern')">Invalid IFSC code format (e.g., ABCD0123456).</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-input-dark {
      @apply bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition p-2;
    }
  `]
})
export class BankAccountFormComponent {
  @Input() parentForm!: FormGroup;
}
