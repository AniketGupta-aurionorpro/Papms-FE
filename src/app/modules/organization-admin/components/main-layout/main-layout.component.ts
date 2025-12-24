import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.models';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  children?: MenuItem[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-org-admin-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrgAdminMainLayoutComponent implements OnInit {
  isSidebarOpen = true;
  isMobileMenuOpen = false;
  currentRoute = '';
  userInfo: (User & { organizationName?: string, organizationLogoUrl?: string }) | null = null;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'grid-outline',
      route: '/org-admin/dashboard'
    },
    {
      label: 'Employee Management',
      icon: 'people-outline',
      route: '/org-admin/employees', // Base route for the section
      children: [
        { label: 'All Employees', icon: 'list-outline', route: '/org-admin/employees/list' },
        { label: 'Add Employee', icon: 'person-add-outline', route: '/org-admin/employees/add' },
        { label: 'Bulk Upload & History', icon: 'cloud-upload-outline', route: '/org-admin/employees/bulk-upload' }
      ],
      isExpanded: false
    },
    {
      label: 'Payroll',
      icon: 'document-text-outline',
      route: '/org-admin/payroll',
      children: [
        { label: 'Create Payroll', icon: 'add-circle-outline', route: '/org-admin/payroll/create' },
        { label: 'Payroll History', icon: 'time-outline', route: '/org-admin/payroll/history' },
        { label: 'Reports', icon: 'bar-chart-outline', route: '/org-admin/payroll/reports' }
      ],
      isExpanded: false
    },
    {
      label: 'Financial Management',
      icon: 'wallet-outline',
      route: '/org-admin/financial',
      children: [
        { label: 'Deposits', icon: 'arrow-down-circle-outline', route: '/org-admin/financial/deposits' },
        { label: 'Transactions', icon: 'swap-horizontal-outline', route: '/org-admin/financial/transactions' },
        { label: 'Financial Reports', icon: 'pie-chart-outline', route: '/org-admin/financial/reports' }
      ],
      isExpanded: false
    },
    {
      label: 'Vendor Management',
      icon: 'business-outline',
      route: '/org-admin/vendors',
      children: [
        { label: 'All Vendors', icon: 'list-outline', route: '/org-admin/vendors' },
        { label: 'Add Vendor', icon: 'add-circle-outline', route: '/org-admin/vendors/add' },
        { label: 'Vendor Bills', icon: 'receipt-outline', route: '/org-admin/vendors/bills' }
      ],
      isExpanded: false
    },
    {
      label: 'Client Management',
      icon: 'briefcase-outline',
      route: '/org-admin/clients',
      children: [
        { label: 'Client List', icon: 'list-outline', route: '/org-admin/clients' },
        { label: 'Deposit History', icon: 'wallet-outline', route: '/org-admin/clients/deposits' },
        { label: 'Invoices', icon: 'document-outline', route: '/org-admin/invoices' }
      ],
      isExpanded: false
    },
    {
      label: 'Concerns',
      icon: 'help-circle-outline',
      route: '/org-admin/concerns',
      children: [
        { label: 'All Concerns', icon: 'list-outline', route: '/org-admin/concerns/list' }
      ],
      isExpanded: false
    },
    {
      label: 'Organization Profile',
      icon: 'settings-outline',
      route: '/org-admin/profile'
    }
  ];

  constructor(
    public router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo() as any;

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects || event.url;
        this.expandActiveSubMenu();
        this.closeMobileMenu();
      });

    this.expandActiveSubMenu();
  }

  expandActiveSubMenu(): void {
    for (const item of this.menuItems) {
      if (item.children) {
        item.isExpanded = this.currentRoute.startsWith(item.route);
      }
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleSubMenu(menuItem: MenuItem): void {
    if (menuItem.children) {
      this.menuItems.forEach(item => {
        if (item !== menuItem) item.isExpanded = false;
      });
      menuItem.isExpanded = !menuItem.isExpanded;
    }
  }

  isMenuItemActive(menuItem: MenuItem): boolean {
    // For parent items, check if the current route starts with the item's base route
    if (menuItem.children) {
      return this.currentRoute.startsWith(menuItem.route);
    }
    // For single items, do an exact match
    return this.currentRoute === menuItem.route;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'O';
    const words = name.split(' ').filter(Boolean);
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
