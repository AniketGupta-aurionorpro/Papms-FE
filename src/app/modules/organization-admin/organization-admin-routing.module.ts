// src/app/modules/organization-admin/organization-admin-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrgAdminDashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-management/employee-list/employee-list.component';
import { AddEmployeeComponent } from './components/employee-management/add-employee/add-employee.component';
import { BulkUploadComponent } from './components/employee-management/bulk-upload/bulk-upload.component';
import { BankAccountsComponent } from './components/employee-management/bank-accounts/bank-accounts.component';
import { SalaryManagementComponent } from './components/employee-management/salary-management/salary-management.component';
import { CreatePayrollComponent } from './components/payroll-management/create-payroll/create-payroll.component';
import { PayrollHistoryComponent } from './components/payroll-management/payroll-history/payroll-history.component';
import { PayrollReportsComponent } from './components/payroll-management/payroll-reports/payroll-reports.component';
import { DepositsComponent } from './components/financial-management/deposits/deposits.component';
import { TransactionsComponent } from './components/financial-management/transactions/transactions.component';
import { FinancialReportsComponent } from './components/financial-management/financial-reports/financial-reports.component';
import { OrgAdminMainLayoutComponent } from './components/main-layout/main-layout.component';
// NEW IMPORTS
import { BulkUploadHistoryComponent } from './components/employee-management/bulk-upload-history/bulk-upload-history.component';
import { BulkUploadReportComponent } from './components/employee-management/bulk-upload-report/bulk-upload-report.component';
const routes: Routes = [
  {
    path: '',
    component: OrgAdminMainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: OrgAdminDashboardComponent },
      { path: 'employees/list', component: EmployeeListComponent },
      { path: 'employees/add', component: AddEmployeeComponent },
      { path: 'employees/bulk-upload', component: BulkUploadComponent },
      { path: 'employees/bank-accounts', component: BankAccountsComponent },
      { path: 'employees/salaries', component: SalaryManagementComponent },
      { path: 'payroll/create', component: CreatePayrollComponent },
      { path: 'payroll/history', component: PayrollHistoryComponent },
      { path: 'payroll/reports', component: PayrollReportsComponent },
      { path: 'financial/deposits', component: DepositsComponent },
      { path: 'financial/transactions', component: TransactionsComponent },
      { path: 'financial/reports', component: FinancialReportsComponent },
       { path: 'employees/bulk-upload-history', component: BulkUploadHistoryComponent },
      { path: 'employees/bulk-upload-report/:reportId', component: BulkUploadReportComponent },
      { path: 'employees/bulk-upload-history', component: BulkUploadHistoryComponent },
      { path: 'employees/bulk-upload-report/:reportId', component: BulkUploadReportComponent },
      // Add other child routes here as they are built
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationAdminRoutingModule { }
