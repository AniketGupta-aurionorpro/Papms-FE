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
import { BulkUploadHistoryComponent } from './components/employee-management/bulk-upload-history/bulk-upload-history.component';
import { BulkUploadReportComponent } from './components/employee-management/bulk-upload-report/bulk-upload-report.component';
import { PayrollDetailsComponent } from './components/payroll-management/payroll-details/payroll-details.component';
// Vendor Management
import { VendorListComponent } from './components/vendor-management/vendor-list/vendor-list.component';
import { AddVendorComponent } from './components/vendor-management/add-vendor/add-vendor.component';
import { VendorDetailsComponent } from './components/vendor-management/vendor-details/vendor-details.component';
import { VendorBillsComponent } from './components/vendor-management/vendor-bills/vendor-bills.component';
// Client Management
import { ClientListComponent } from './components/client-management/client-list/client-list.component';
import { DepositHistoryComponent } from './components/client-management/deposit-history/deposit-history.component';
// Invoice Management
import { InvoiceListComponent } from './components/invoice-management/invoice-list/invoice-list.component';
import { CreateInvoiceComponent } from './components/invoice-management/create-invoice/create-invoice.component';
// Concerns Management
import { ConcernsListComponent } from './components/concerns-management/concerns-list/concerns-list.component';
import { ConcernDetailsComponent as OrgConcernDetailsComponent } from './components/concerns-management/concern-details/concern-details.component';
// Organization Profile
import { OrganizationProfileComponent } from './components/organization-profile/organization-profile.component';

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
      { path: 'payroll/details/:id', component: PayrollDetailsComponent },
      { path: 'payroll/reports', component: PayrollReportsComponent },
      { path: 'financial/deposits', component: DepositsComponent },
      { path: 'financial/transactions', component: TransactionsComponent },
      { path: 'financial/reports', component: FinancialReportsComponent },
      { path: 'employees/bulk-upload-history', component: BulkUploadHistoryComponent },
      { path: 'employees/bulk-upload-report/:reportId', component: BulkUploadReportComponent },
      // Vendor Management Routes
      { path: 'vendors', component: VendorListComponent },
      { path: 'vendors/add', component: AddVendorComponent },
      { path: 'vendors/bills', component: VendorBillsComponent },
      { path: 'vendors/:id', component: VendorDetailsComponent },
      // Client Management Routes
      { path: 'clients', component: ClientListComponent },
      { path: 'clients/deposits', component: DepositHistoryComponent },
      // Invoice Management Routes
      { path: 'invoices', component: InvoiceListComponent },
      { path: 'invoices/create', component: CreateInvoiceComponent },
      // Concerns Management Routes
      { path: 'concerns', component: ConcernsListComponent },
      { path: 'concerns/list', component: ConcernsListComponent },
      { path: 'concerns/:id', component: OrgConcernDetailsComponent },
      // Organization Profile
      { path: 'profile', component: OrganizationProfileComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationAdminRoutingModule { }
