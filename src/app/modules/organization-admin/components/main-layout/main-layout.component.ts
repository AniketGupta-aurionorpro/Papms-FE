import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.models'; // Import User model for better typing

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
  // Use a more specific type for userInfo
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
      route: '/org-admin/employees',
      children: [
        { label: 'All Employees', icon: 'list-outline', route: '/org-admin/employees/list' },
        { label: 'Add Employee', icon: 'person-add-outline', route: '/org-admin/employees/add' },
        { label: 'Bulk Upload', icon: 'cloud-upload-outline', route: '/org-admin/employees/bulk-upload' },
        { label: 'Bank Accounts', icon: 'card-outline', route: '/org-admin/employees/bank-accounts' },
        { label: 'Salary Management', icon: 'cash-outline', route: '/org-admin/employees/salaries' }
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
        { label: 'Vendor List', icon: 'list-outline', route: '/org-admin/vendors/list' },
        { label: 'Add Vendor', icon: 'add-circle-outline', route: '/org-admin/vendors/add' },
        { label: 'Vendor Payments', icon: 'card-outline', route: '/org-admin/vendors/payments' }
      ],
      isExpanded: false
    },
    {
      label: 'Client Management',
      icon: 'briefcase-outline',
      route: '/org-admin/clients',
      children: [
        { label: 'Client List', icon: 'list-outline', route: '/org-admin/clients/list' },
        { label: 'Add Client', icon: 'person-add-outline', route: '/org-admin/clients/add' },
        { label: 'Invoices', icon: 'document-outline', route: '/org-admin/clients/invoices' }
      ],
      isExpanded: false
    },
    {
      label: 'Concerns',
      icon: 'help-circle-outline',
      route: '/org-admin/concerns',
      children: [
        { label: 'All Concerns', icon: 'list-outline', route: '/org-admin/concerns/list' },
        { label: 'Open Concerns', icon: 'warning-outline', route: '/org-admin/concerns/open' }
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
    public router: Router, // FIX: Made public for template access
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects || event.url;
        this.expandActiveSubMenu();
        this.closeMobileMenu();
      });

    this.expandActiveSubMenu();
  }

  // NEW: Helper to auto-expand the correct menu on page load/reload
  expandActiveSubMenu(): void {
    for (const item of this.menuItems) {
      if (item.children) {
        item.isExpanded = item.children.some(child => this.currentRoute.startsWith(child.route));
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
      // Collapse other menus
      this.menuItems.forEach(item => {
        if (item !== menuItem) item.isExpanded = false;
      });
      // Toggle the clicked menu
      menuItem.isExpanded = !menuItem.isExpanded;
    }
  }

  isMenuItemActive(menuItem: MenuItem): boolean {
    if (menuItem.children) {
      return menuItem.children.some(child => this.currentRoute.startsWith(child.route));
    }
    return this.currentRoute.startsWith(menuItem.route);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // NEW: Helper to get initials from name
  getInitials(name: string | undefined): string {
    if (!name) return 'O';
    const words = name.split(' ').filter(Boolean);
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
