import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-salary-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="parentForm" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Basic Salary</label>
          <input type="number" formControlName="basicSalary" class="form-input-dark w-full">
          <div *ngIf="parentForm.get('basicSalary')?.invalid && parentForm.get('basicSalary')?.touched" class="text-xs text-red-400 mt-1">
             <span *ngIf="parentForm.get('basicSalary')?.hasError('required')">Basic salary is required.</span>
             <span *ngIf="parentForm.get('basicSalary')?.hasError('min')">Must be greater than 0.</span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">HRA</label>
          <input type="number" formControlName="hra" class="form-input-dark w-full">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">DA</label>
          <input type="number" formControlName="da" class="form-input-dark w-full">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">PF Contribution</label>
          <input type="number" formControlName="pfContribution" class="form-input-dark w-full">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Other Allowances</label>
          <input type="number" formControlName="otherAllowances" class="form-input-dark w-full">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Effective Date</label>
          <input type="date" formControlName="effectiveFromDate" class="form-input-dark w-full">
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
export class SalaryFormComponent {
  @Input() parentForm!: FormGroup;
}
