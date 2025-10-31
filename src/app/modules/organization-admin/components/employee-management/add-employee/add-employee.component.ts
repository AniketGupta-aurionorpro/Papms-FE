import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize, Subscription } from 'rxjs';

import { EmployeeService } from '../../../../../services/employee.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CompleteEmployeeRequest } from '../../../../../models/employee.models';

import { BankAccountFormComponent } from '../../../../shared/components/forms/bank-account-form/bank-account-form.component';
import { SalaryFormComponent } from '../../../../shared/components/forms/salary-form/salary-form.component';
import { EmployeeValidators } from './async-validators';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    BankAccountFormComponent,
    SalaryFormComponent
  ],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AddEmployeeComponent implements OnInit, OnDestroy {
  addEmployeeForm!: FormGroup;
  isLoading = false;
  organizationId!: number;
  private nameSyncSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (!userInfo || !userInfo.organizationId) {
      this.notificationService.showError("Could not identify your organization.");
      this.router.navigate(['/org-admin/dashboard']);
      return;
    }
    this.organizationId = userInfo.organizationId;
    this.initializeForm();
    this.setupNameSynchronization();
  }

  ngOnDestroy(): void {
    if (this.nameSyncSubscription) {
      this.nameSyncSubscription.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.addEmployeeForm = this.fb.group({
      user: this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_.-]+$/)], [EmployeeValidators.usernameAvailable(this.employeeService, this.organizationId)]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        fullName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.'-]+$/)]],
        email: ['', [Validators.required, Validators.email], [EmployeeValidators.emailAvailable(this.employeeService, this.organizationId)]],
      }, { validators: this.passwordMatchValidator }),
      employee: this.fb.group({
        employeeCode: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9-]+$/)]],
        dateOfJoining: [this.getTodayDate(), Validators.required],
        department: ['', Validators.required],
        jobTitle: ['', Validators.required],
      }),
      bankAccount: this.fb.group({
        accountHolderName: ['', Validators.required],
        accountNumber: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20), Validators.pattern(/^[0-9]+$/)]],
        bankName: ['', Validators.required],
        ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      }),
      // FIXED: Initialized numeric fields to 0 and added Validators.required
      salaryStructure: this.fb.group({
        basicSalary: [null, [Validators.required, Validators.min(1)]],
        hra: [0, [Validators.required, Validators.min(0)]],
        da: [0, [Validators.required, Validators.min(0)]],
        pfContribution: [0, [Validators.required, Validators.min(0)]],
        otherAllowances: [0, [Validators.required, Validators.min(0)]],
        effectiveFromDate: [this.getTodayDate(), Validators.required],
      }),
    });
  }

  private setupNameSynchronization(): void {
    const fullNameControl = this.userForm.get('fullName');
    const accountHolderNameControl = this.bankAccountForm.get('accountHolderName');

    if (fullNameControl && accountHolderNameControl) {
      this.nameSyncSubscription = fullNameControl.valueChanges.subscribe(value => {
        accountHolderNameControl.setValue(value, { emitEvent: false });
      });
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      if (form.get('confirmPassword')?.hasError('passwordMismatch')) {
        form.get('confirmPassword')?.setErrors(null);
      }
    }
  }

  get userForm() { return this.addEmployeeForm.get('user') as FormGroup; }
  get employeeForm() { return this.addEmployeeForm.get('employee') as FormGroup; }
  get bankAccountForm() { return this.addEmployeeForm.get('bankAccount') as FormGroup; }
  get salaryStructureForm() { return this.addEmployeeForm.get('salaryStructure') as FormGroup; }

  onSubmit(): void {
    if (this.addEmployeeForm.invalid) {
      this.addEmployeeForm.markAllAsTouched();
      this.notificationService.showError('Please fill out all required fields correctly.');
      this.logInvalidControls(this.addEmployeeForm); // For debugging
      return;
    }

    this.isLoading = true;
    const formValue = this.addEmployeeForm.getRawValue();

    const requestPayload: CompleteEmployeeRequest = {
      username: formValue.user.username,
      password: formValue.user.password,
      fullName: formValue.user.fullName,
      email: formValue.user.email,
      ...formValue.employee,
      bankAccount: formValue.bankAccount,
      salaryStructure: formValue.salaryStructure,
    };

    this.employeeService.addCompleteEmployee(this.organizationId, requestPayload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Employee '${requestPayload.fullName}' added successfully!`);
          this.router.navigate(['/org-admin/employees/list']);
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to add employee. Please try again.');
        }
      });
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private logInvalidControls(form: FormGroup): void {
    const invalidControls: string[] = [];
    Object.keys(form.controls).forEach(groupName => {
      const group = form.get(groupName) as FormGroup;
      if (group instanceof FormGroup) {
        Object.keys(group.controls).forEach(controlName => {
          if (group.controls[controlName].invalid) {
            invalidControls.push(`${groupName}.${controlName}`);
          }
        });
      }
    });
    console.error('Invalid Form Controls:', invalidControls);
  }
}
