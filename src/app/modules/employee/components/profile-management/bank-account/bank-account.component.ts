import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { EmployeeDashboardService } from '../../../../../services/employee-dashboard.service';
import { EmployeeService } from '../../../../../services/employee.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CompleteEmployeeResponse } from '../../../../../models/employee-dashboard.models';

@Component({
  selector: 'app-bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.css'],
  standalone: false
})
export class BankAccountComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  error = '';
  profile: CompleteEmployeeResponse | null = null;
  bankForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private employeeDashboardService: EmployeeDashboardService,
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private initializeForm(): void {
    this.bankForm = this.fb.group({
      accountHolderName: ['', [Validators.required, Validators.minLength(2)]],
      accountNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9,18}$')]],
      bankName: ['', [Validators.required]],
      ifscCode: ['', [Validators.required, Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')]]
    });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.error = '';

    this.employeeDashboardService.getMyDashboard()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.profile = data.employeeProfile;
          if (this.profile.bankAccount) {
            this.bankForm.patchValue({
              accountHolderName: this.profile.bankAccount.accountHolderName,
              accountNumber: this.profile.bankAccount.accountNumber,
              bankName: this.profile.bankAccount.bankName,
              ifscCode: this.profile.bankAccount.ifscCode
            });
          } else {
            this.isEditMode = true; // Auto enable edit mode if no bank account
          }
        },
        error: (err) => {
          this.error = 'Failed to load profile';
          this.notificationService.showError(this.error);
        }
      });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode && this.profile?.bankAccount) {
      // Reset form to original values
      this.bankForm.patchValue({
        accountHolderName: this.profile.bankAccount.accountHolderName,
        accountNumber: this.profile.bankAccount.accountNumber,
        bankName: this.profile.bankAccount.bankName,
        ifscCode: this.profile.bankAccount.ifscCode
      });
    }
  }

  saveBankAccount(): void {
    if (this.bankForm.invalid || !this.profile) return;

    this.isSaving = true;
    const request = {
      accountHolderName: this.bankForm.value.accountHolderName,
      accountNumber: this.bankForm.value.accountNumber,
      bankName: this.bankForm.value.bankName,
      ifscCode: this.bankForm.value.ifscCode.toUpperCase()
    };

    this.employeeService.updateBankAccount(this.profile.organizationId, this.profile.id, request)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: (updatedProfile) => {
          this.profile = updatedProfile;
          this.isEditMode = false;
          this.notificationService.showSuccess('Bank account updated successfully!');
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to update bank account');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/employee/profile']);
  }

  formatIFSC(): void {
    const ifscControl = this.bankForm.get('ifscCode');
    if (ifscControl) {
      ifscControl.setValue(ifscControl.value.toUpperCase());
    }
  }
}
