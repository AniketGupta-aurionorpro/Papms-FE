// app\modules\bank-admin\bank-admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Add this redirect
      { path: 'dashboard', component: BankAdminDashboardComponent },

      // Organization Management
      { path: 'organizations', component: OrganizationListComponent },
      { path: 'organizations/:id', component: OrganizationDetailsComponent },
      { path: 'organization-approval', component: OrganizationApprovalComponent },

      // Payroll Approval
      { path: 'payroll-approval', component: PendingPayrollsComponent },
      { path: 'payroll-approval/:id', component: PayrollDetailsComponent },
      { path: 'payroll-history', component: PayrollHistoryComponent },

      // Financial Audit
      { path: 'financial-audit', component: OrganizationFinancialsComponent },
      { path: 'financial-audit/transactions/:id', component: TransactionAuditComponent },

      // Document Verification
      { path: 'document-verification', component: DocumentVerificationComponent },

      // Reports
      { path: 'reports', component: ReportsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BankAdminRoutingModule { }
