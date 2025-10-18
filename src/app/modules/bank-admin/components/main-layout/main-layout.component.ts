import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  standalone:false
})
export class MainLayoutComponent {
  // Sidebar open state can be managed here if needed for mobile
  isSidebarOpen = false;

  // Updated navigation items to match the image
  navigationItems = [
    { label: 'Dashboard', route: '/bank-admin/dashboard', icon: 'speedometer-outline' },
    { label: 'Organizations', route: '/bank-admin/organizations', icon: 'business-outline' },
    { label: 'Transactions', route: '/bank-admin/financial-audit', icon: 'swap-horizontal-outline' },
    { label: 'Reports', route: '/bank-admin/reports', icon: 'bar-chart-outline' },
    { label: 'Settings', route: '#', icon: 'settings-outline' }, // Placeholder route
    { label: 'Support', route: '#', icon: 'help-circle-outline' } // Placeholder route
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
