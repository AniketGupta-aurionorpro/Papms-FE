import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompleteEmployeeResponse, UpdateCompleteEmployeeRequest } from '../../../../../models/employee.models';
import { BankAccountFormComponent } from '../../forms/bank-account-form/bank-account-form.component';
import { SalaryFormComponent } from '../../forms/salary-form/salary-form.component';

@Component({
  selector: 'app-employee-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BankAccountFormComponent, SalaryFormComponent],
  templateUrl: './employee-edit-modal.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmployeeEditModalComponent implements OnChanges {
  @Input() employee: CompleteEmployeeResponse | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<UpdateCompleteEmployeeRequest>();

  editForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      user: this.fb.group({
        fullName: ['', Validators.required],
        email: [{ value: '', disabled: true }],
      }),
      // MODIFICATION: Added the missing 'employee' form group
      employee: this.fb.group({
        department: ['', Validators.required],
        jobTitle: ['', Validators.required],
        isActive: [true, Validators.required]
      }),
      bankAccount: this.fb.group({
        accountHolderName: ['', Validators.required],
        accountNumber: ['', Validators.required],
        bankName: ['', Validators.required],
        ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]]
      }),
      salary: this.fb.group({
        basicSalary: [0, [Validators.required, Validators.min(0)]],
        hra: [0, Validators.min(0)],
        da: [0, Validators.min(0)],
        pfContribution: [0, Validators.min(0)],
        otherAllowances: [0, Validators.min(0)],
        effectiveFromDate: [this.getTodayDate(), Validators.required],
        changeReason: ['']
      })
    });
  }

  // Convenience getters for template access
  get bankAccountForm() { return this.editForm.get('bankAccount') as FormGroup; }
  get salaryForm() { return this.editForm.get('salary') as FormGroup; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee'] && this.employee) {
      this.editForm.patchValue({
        user: {
          fullName: this.employee.fullName,
          email: this.employee.email,
        },
        employee: {
          department: this.employee.department,
          jobTitle: this.employee.jobTitle,
          isActive: this.employee.isEmployeeActive,
        },
        bankAccount: {
          accountHolderName: this.employee.bankAccount?.accountHolderName,
          accountNumber: this.employee.bankAccount?.accountNumber,
          bankName: this.employee.bankAccount?.bankName,
          ifscCode: this.employee.bankAccount?.ifscCode,
        },
        salary: {
          basicSalary: this.employee.currentSalary?.basicSalary,
          hra: this.employee.currentSalary?.hra,
          da: this.employee.currentSalary?.da,
          pfContribution: this.employee.currentSalary?.pfContribution,
          otherAllowances: this.employee.currentSalary?.otherAllowances,
          effectiveFromDate: this.getTodayDate(),
          changeReason: '',
        }
      });
      // Mark salary form as pristine since it's for new entries, not editing history
      this.salaryForm.markAsPristine();
    }
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.highlightInvalidFields(this.editForm);
      return;
    }

    const payload: UpdateCompleteEmployeeRequest = {};
    if (this.editForm.get('user')?.dirty) {
      payload.user = this.editForm.get('user')?.value;
    }
    if (this.editForm.get('employee')?.dirty) {
      payload.employee = this.editForm.get('employee')?.value;
    }
    if (this.editForm.get('bankAccount')?.dirty) {
      payload.bankAccount = this.editForm.get('bankAccount')?.value;
    }
    // Only include salary if it has been touched AND is valid
    if (this.editForm.get('salary')?.dirty && this.editForm.get('salary')?.valid) {
      payload.salary = this.editForm.get('salary')?.value;
    }

    this.save.emit(payload);
  }

  private highlightInvalidFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.highlightInvalidFields(control);
      } else {
        control?.markAsTouched({ onlySelf: true });
      }
    });
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
