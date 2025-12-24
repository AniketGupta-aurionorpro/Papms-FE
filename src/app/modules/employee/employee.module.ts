import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { EmployeeRoutingModule } from './employee-routing.module';
import { SharedModule } from '../shared/shared.module';

// Layout
import { EmployeeMainLayoutComponent } from './components/main-layout/main-layout.component';

// Dashboard
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Profile Management
import { MyProfileComponent } from './components/profile-management/my-profile/my-profile.component';
import { EditProfileComponent } from './components/profile-management/edit-profile/edit-profile.component';
import { BankAccountComponent } from './components/profile-management/bank-account/bank-account.component';

// Payslip Management
import { PayslipHistoryComponent } from './components/payslip-management/payslip-history/payslip-history.component';
import { PayslipDetailsComponent } from './components/payslip-management/payslip-details/payslip-details.component';

// Concerns
import { MyConcernsComponent } from './components/concerns/my-concerns/my-concerns.component';
import { RaiseConcernComponent } from './components/concerns/raise-concern/raise-concern.component';
import { ConcernDetailsComponent } from './components/concerns/concern-details/concern-details.component';

// Notifications
import { NotificationsComponent } from './components/notifications/notifications.component';

@NgModule({
  declarations: [
    EmployeeMainLayoutComponent,
    DashboardComponent,
    MyProfileComponent,
    EditProfileComponent,
    BankAccountComponent,
    PayslipHistoryComponent,
    PayslipDetailsComponent,
    MyConcernsComponent,
    RaiseConcernComponent,
    ConcernDetailsComponent,
    NotificationsComponent,
  ],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeModule { }
