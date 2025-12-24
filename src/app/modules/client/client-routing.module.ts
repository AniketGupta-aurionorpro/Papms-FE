import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { ClientMainLayoutComponent } from './components/main-layout/main-layout.component';
import { ClientDashboardComponent } from './components/dashboard/dashboard.component';
import { ClientInvoiceListComponent } from './components/invoice-management/invoice-list/invoice-list.component';
import { ClientDepositsComponent } from './components/deposits/deposits.component';
import { ProfileManagementComponent } from './components/profile-management/profile-management.component';
import { ClientTransactionsComponent } from './components/transactions/transactions.component';

const routes: Routes = [
  {
    path: '',
    component: ClientMainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ClientDashboardComponent },
      { path: 'invoices', component: ClientInvoiceListComponent },
      { path: 'deposits', component: ClientDepositsComponent },
      { path: 'transactions', component: ClientTransactionsComponent },
      { path: 'profile', component: ProfileManagementComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
