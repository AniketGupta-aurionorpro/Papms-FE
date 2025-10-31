import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// --- FIX: IMPORT NECESSARY SERVICES AND MODELS ---
import { DashboardService } from '../../../../services/dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DashboardStatsDto } from '../../../../models/dashboard.models';
// --- END FIX ---

import { StatsCardComponent } from '../../../shared/components/cards/stats-card/stats-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/ui/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-org-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, StatsCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrgAdminDashboardComponent implements OnInit {
  dashboardStats: DashboardStatsDto | null = null;
  isLoading = true;
  error: string | null = null;

  quickActions = [
    {
      label: 'Run Payroll',
      description: 'Process employee payments',
      icon: 'cash-outline',
      route: '/org-admin/payroll/create',
      color: 'bg-green-500'
    },
    {
      label: 'Add Employee',
      description: 'Register new team member',
      icon: 'person-add-outline',
      route: '/org-admin/employees/add',
      color: 'bg-blue-500'
    },
    {
      label: 'Add Funds',
      description: 'Deposit to organization account',
      icon: 'add-circle-outline',
      route: '/org-admin/financial/deposits',
      color: 'bg-purple-500'
    },
    {
      label: 'Create Invoice',
      description: 'Bill your clients',
      icon: 'document-outline',
      route: '/org-admin/clients/invoices/create',
      color: 'bg-orange-500'
    }
  ];

  // --- FIX: INJECT BOTH DashboardService and AuthService ---
  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.isLoading = true;
    this.error = null;
    const userInfo = this.authService.getUserInfo();

    if (!userInfo || !userInfo.organizationId) {
      this.error = "Could not identify your organization. Please log in again.";
      this.isLoading = false;
      return;
    }

    // --- FIX: REPLACE MOCK DATA WITH ACTUAL SERVICE CALL ---
    this.dashboardService.getDashboardStatsForOrganization(userInfo.organizationId).subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load dashboard statistics. Please try again later.';
        this.isLoading = false;
        console.error(err);
      }
    });
    // --- END FIX ---
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatPercentage(value: number): string {
    if (value === null || value === undefined) return '0.0%';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  getPercentageColor(value: number): string {
    if (value === null || value === undefined) return 'text-slate-600';
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-slate-600';
  }
}
