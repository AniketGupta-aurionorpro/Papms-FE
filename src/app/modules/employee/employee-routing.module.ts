import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeMainLayoutComponent } from './components/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MyProfileComponent } from './components/profile-management/my-profile/my-profile.component';
import { EditProfileComponent } from './components/profile-management/edit-profile/edit-profile.component';
import { BankAccountComponent } from './components/profile-management/bank-account/bank-account.component';
import { PayslipHistoryComponent } from './components/payslip-management/payslip-history/payslip-history.component';
import { PayslipDetailsComponent } from './components/payslip-management/payslip-details/payslip-details.component';
import { MyConcernsComponent } from './components/concerns/my-concerns/my-concerns.component';
import { RaiseConcernComponent } from './components/concerns/raise-concern/raise-concern.component';
import { ConcernDetailsComponent } from './components/concerns/concern-details/concern-details.component';
import { NotificationsComponent } from './components/notifications/notifications.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeeMainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      // Profile Management
      { path: 'profile', component: MyProfileComponent },
      { path: 'profile/edit', component: EditProfileComponent },
      { path: 'profile/bank-account', component: BankAccountComponent },

      // Payslip Management
      { path: 'payslips', component: PayslipHistoryComponent },
      { path: 'payslips/:id', component: PayslipDetailsComponent },

      // Concerns
      { path: 'concerns', component: MyConcernsComponent },
      { path: 'concerns/raise', component: RaiseConcernComponent },
      { path: 'concerns/:id', component: ConcernDetailsComponent },

      // Notifications
      { path: 'notifications', component: NotificationsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
