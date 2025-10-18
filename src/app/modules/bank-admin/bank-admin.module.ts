import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BankAdminRoutingModule } from './bank-admin-routing.module';
import { BankAdminDashboardComponent } from './components/dashboard/dashboard.component';
import { OrganizationListComponent } from './components/organization-management/organization-list/organization-list.component';
import { OrganizationDetailsComponent } from './components/organization-management/organization-details/organization-details.component';
import { OrganizationApprovalComponent } from './components/organization-management/organization-approval/organization-approval.component';
import { PendingPayrollsComponent } from './components/payroll-approval/pending-payrolls/pending-payrolls.component';
import { PayrollDetailsComponent } from './components/payroll-approval/payroll-details/payroll-details.component';
import { PayrollHistoryComponent } from './components/payroll-approval/payroll-history/payroll-history.component';
import { OrganizationFinancialsComponent } from './components/financial-audit/organization-financials/organization-financials.component';
import { TransactionAuditComponent } from './components/financial-audit/transaction-audit/transaction-audit.component';
import { ReportsComponent } from './components/reports/reports.component';
import { DocumentVerificationComponent } from './components/organization-management/document-verification/document-verification.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';

@NgModule({
  declarations: [
    BankAdminDashboardComponent,
    MainLayoutComponent,
    OrganizationListComponent,
    OrganizationDetailsComponent,
    OrganizationApprovalComponent,
    PendingPayrollsComponent,
    PayrollDetailsComponent,
    PayrollHistoryComponent,
    OrganizationFinancialsComponent,
    TransactionAuditComponent,
    DocumentVerificationComponent,
    ReportsComponent
  ],
  imports: [
    CommonModule,
    BankAdminRoutingModule,
    RouterModule,
    FormsModule,
    NgxChartsModule,

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BankAdminModule { }
