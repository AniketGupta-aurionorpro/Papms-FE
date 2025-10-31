import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { OrganizationAdminRoutingModule } from './organization-admin-routing.module';

// Import all components
import { OrgAdminMainLayoutComponent } from './components/main-layout/main-layout.component';
import { OrgAdminDashboardComponent } from './components/dashboard/dashboard.component';
import { AddClientComponent } from './components/client-management/add-client/add-client.component';
import { ClientDetailsComponent } from './components/client-management/client-details/client-details.component';
import { ClientListComponent } from './components/client-management/client-list/client-list.component';
import { ConcernDetailsComponent as OrgConcernDetailsComponent } from './components/concerns-management/concern-details/concern-details.component';
import { ConcernsListComponent } from './components/concerns-management/concerns-list/concerns-list.component';
import { AddEmployeeComponent } from './components/employee-management/add-employee/add-employee.component';
import { BankAccountsComponent } from './components/employee-management/bank-accounts/bank-accounts.component';
import { BulkUploadComponent } from './components/employee-management/bulk-upload/bulk-upload.component';
import { EmployeeDetailsComponent } from './components/employee-management/employee-details/employee-details.component';
import { EmployeeListComponent } from './components/employee-management/employee-list/employee-list.component';
import { SalaryManagementComponent } from './components/employee-management/salary-management/salary-management.component';
import { DepositsComponent } from './components/financial-management/deposits/deposits.component';
import { FinancialReportsComponent } from './components/financial-management/financial-reports/financial-reports.component';
import { TransactionsComponent } from './components/financial-management/transactions/transactions.component';
import { VendorPaymentsComponent } from './components/financial-management/vendor-payments/vendor-payments.component';
import { CreateInvoiceComponent } from './components/invoice-management/create-invoice/create-invoice.component';
import { InvoiceDetailsComponent as OrgInvoiceDetailsComponent } from './components/invoice-management/invoice-details/invoice-details.component';
import { InvoiceListComponent as OrgInvoiceListComponent } from './components/invoice-management/invoice-list/invoice-list.component';
import { OrganizationProfileComponent } from './components/organization-profile/organization-profile.component';
import { CreatePayrollComponent } from './components/payroll-management/create-payroll/create-payroll.component';
import { PayrollDetailsComponent as OrgPayrollDetailsComponent } from './components/payroll-management/payroll-details/payroll-details.component';
import { PayrollHistoryComponent } from './components/payroll-management/payroll-history/payroll-history.component';
import { PayrollReportsComponent } from './components/payroll-management/payroll-reports/payroll-reports.component';
import { AddVendorComponent } from './components/vendor-management/add-vendor/add-vendor.component';
import { VendorDetailsComponent } from './components/vendor-management/vendor-details/vendor-details.component';
import { VendorListComponent } from './components/vendor-management/vendor-list/vendor-list.component';
import { BulkUploadHistoryComponent } from './components/employee-management/bulk-upload-history/bulk-upload-history.component';
import { BulkUploadReportComponent } from './components/employee-management/bulk-upload-report/bulk-upload-report.component';
@NgModule({
  // --- FIX: REMOVE ALL COMPONENTS FROM declarations ---
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    OrganizationAdminRoutingModule,
    SharedModule,
    // --- FIX: IMPORT ALL STANDALONE COMPONENTS USED BY THIS MODULE ---
    OrgAdminMainLayoutComponent,
    OrgAdminDashboardComponent,
    AddClientComponent,
    ClientDetailsComponent,
    ClientListComponent,
    OrgConcernDetailsComponent,
    ConcernsListComponent,
    AddEmployeeComponent,
    BankAccountsComponent,
    BulkUploadComponent,
    EmployeeDetailsComponent,
    EmployeeListComponent,
    SalaryManagementComponent,
    DepositsComponent,
    FinancialReportsComponent,
    TransactionsComponent,
    VendorPaymentsComponent,
    CreateInvoiceComponent,
    OrgInvoiceDetailsComponent,
    OrgInvoiceListComponent,
    OrganizationProfileComponent,
    CreatePayrollComponent,
    OrgPayrollDetailsComponent,
    PayrollHistoryComponent,
    PayrollReportsComponent,
    AddVendorComponent,
    VendorDetailsComponent,
    VendorListComponent,
    AddEmployeeComponent,
    BulkUploadHistoryComponent,
    BulkUploadReportComponent
  ]
})
export class OrganizationAdminModule {  }
