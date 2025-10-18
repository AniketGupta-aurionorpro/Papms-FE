// app\app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/enums/role.enum';
import { NotFoundComponent } from './modules/shared/pages/not-found/not-found.component';
import { LandingComponent } from './components/landing/landing.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'bank-admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.BANK_ADMIN] },
    loadChildren: () => import('./modules/bank-admin/bank-admin.module').then(m => m.BankAdminModule)
  },
  {
    path: 'org-admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ORG_ADMIN] },
    loadChildren: () => import('./modules/organization-admin/organization-admin.module').then(m => m.OrganizationAdminModule)
  },
  {
    path: 'employee',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.EMPLOYEE] },
    loadChildren: () => import('./modules/employee/employee.module').then(m => m.EmployeeModule)
  },
  {
    path: 'client',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.CLIENT] },
    loadChildren: () => import('./modules/client/client.module').then(m => m.ClientModule)
  },
  { path: '**', component: NotFoundComponent }
];

export { routes };
