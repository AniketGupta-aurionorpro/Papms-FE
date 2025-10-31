import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RejectionDialogComponent } from './components/ui/rejection-dialog/rejection-dialog.component';
import { PaginationComponent } from './components/ui/pagination/pagination.component';
import { BankAccountFormComponent } from './components/forms/bank-account-form/bank-account-form.component';
import { SalaryFormComponent } from './components/forms/salary-form/salary-form.component';
// Import the new modal components
import { EmployeeViewModalComponent } from './components/modals/employee-view-modal/employee-view-modal.component';
import { EmployeeEditModalComponent } from './components/modals/employee-edit-modal/employee-edit-modal.component';

// Import standalone pipes
import { MaskAccountPipe } from './pipes/mask-account.pipe';

@NgModule({
  declarations: [
    RejectionDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaginationComponent,
    // Import standalone components that will be used by other modules
    EmployeeViewModalComponent,
    EmployeeEditModalComponent,
    MaskAccountPipe,
    BankAccountFormComponent,
    SalaryFormComponent,
  ],
  exports: [
    RejectionDialogComponent,
    PaginationComponent,
    // Export the new modal components
    EmployeeViewModalComponent,
    EmployeeEditModalComponent,
    MaskAccountPipe,
    BankAccountFormComponent,
    SalaryFormComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
