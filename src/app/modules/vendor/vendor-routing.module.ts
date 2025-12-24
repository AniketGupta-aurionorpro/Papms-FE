import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorMainLayoutComponent } from './components/main-layout/main-layout.component';
import { VendorDashboardComponent } from './components/dashboard/dashboard.component';
import { CreateBillComponent } from './components/bills/create-bill/create-bill.component';
import { BillHistoryComponent } from './components/bills/bill-history/bill-history.component';
import { PaymentStatusComponent } from './components/payments/payment-status/payment-status.component';

const routes: Routes = [
    {
        path: '',
        component: VendorMainLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: VendorDashboardComponent },
            { path: 'bills/create', component: CreateBillComponent },
            { path: 'bills/history', component: BillHistoryComponent },
            { path: 'payments', component: PaymentStatusComponent },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VendorRoutingModule { }
