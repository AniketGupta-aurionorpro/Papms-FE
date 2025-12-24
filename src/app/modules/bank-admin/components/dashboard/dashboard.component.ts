// src/app/modules/bank-admin/components/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { OrganizationService } from '../../../../services/organization.service';
import { PayrollService } from '../../../../services/payroll.service';
import { BankAdminService } from '../../../../services/bank-admin.service';
import { BankAdminDashboardStatsDto } from '../../../../models/dashboard.models';
import {
  OrganizationResponseDto,
  OrganizationStatus,
} from '../../../../models/organization.models';
import { PayrollBatchResponse } from '../../../../models/payroll.models';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import * as shape from 'd3-shape';

@Component({
  selector: 'app-bank-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class BankAdminDashboardComponent implements OnInit {
  // User info for welcome message
  adminName = '';
  lastUpdated: Date = new Date();
  isRefreshing = false;

  growthSummary = { value: 0, changeType: 'positive' };
  volumeSummary = { value: 0, changeType: 'positive' };
  payrollSummary = { value: 0, changeType: 'positive' };
  successRateSummary = { value: 0, changeType: 'positive' };
  isLoading = true;
  error = '';
  activeActionCenterTab = 'org';
  activeChart: 'growth' | 'volume' | 'payroll' | 'success' = 'growth';

  stats: any[] = [];
  growthChartData: any[] = [{ name: 'Growth', series: [] }];
  volumeChartData: any[] = [{ name: 'Volume', series: [] }];
  payrollChartData: any[] = [{ name: 'Payroll', series: [] }];
  successRateChartData: any[] = [{ name: 'Success Rate', series: [] }];

  pendingOrganizations: OrganizationResponseDto[] = [];
  allOrganizations: OrganizationResponseDto[] = [];
  pendingPayrolls: PayrollBatchResponse[] = [];

  // Enhanced chart options - Color schemes for each metric
  colorScheme: any = { domain: ['#3b82f6'] }; // Blue - Organization Growth
  volumeColorScheme: any = { domain: ['#14b8a6'] }; // Teal - Transaction Volume
  payrollColorScheme: any = { domain: ['#a855f7'] }; // Purple - Payroll
  successRateColorScheme: any = { domain: ['#22c55e'] }; // Green - Success Rate
  curve: any = shape.curveMonotoneX; // Smooth curves
  showGridLines = false; // Cleaner look
  isChartFullscreen = false; // Fullscreen toggle

  // Standard currency format for tooltips
  formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  // Compact format for Y-axis (16L instead of ₹16,00,000)
  formatCurrencyCompact = (val: number): string => {
    if (val >= 10000000) { // 1 Crore+
      return `₹${(val / 10000000).toFixed(1)}Cr`;
    } else if (val >= 100000) { // 1 Lakh+
      return `₹${(val / 100000).toFixed(0)}L`;
    } else if (val >= 1000) { // 1 Thousand+
      return `₹${(val / 1000).toFixed(0)}K`;
    }
    return `₹${val}`;
  };

  // Percentage format for Success Rate Y-axis
  formatPercentageAxis = (val: number): string => `${val}%`;

  toggleChartFullscreen(): void {
    this.isChartFullscreen = !this.isChartFullscreen;
    // Prevent body scroll when fullscreen
    document.body.style.overflow = this.isChartFullscreen ? 'hidden' : 'auto';
  }

  constructor(
    private organizationService: OrganizationService,
    private payrollService: PayrollService,
    private bankAdminService: BankAdminService,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    // Get admin name from auth service
    const user = this.authService.getUserInfo();
    this.adminName = user?.fullName || 'Admin';

    this.loadDashboardData();
  }

  // Get greeting based on time of day
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  // Refresh data with animation
  refreshData(): void {
    this.isRefreshing = true;
    this.notificationService.showInfo('Refreshing dashboard data...');
    this.loadDashboardData();
    setTimeout(() => {
      this.isRefreshing = false;
    }, 1000);
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = '';

    const stats$ = this.bankAdminService.getDashboardStats();
    const pendingOrgs$ = this.organizationService.getAllOrganizations(0, 5, OrganizationStatus.PENDING_APPROVAL);
    const allOrgs$ = this.organizationService.getAllOrganizations(0, 5);
    const pendingPayrolls$ = this.payrollService.getPendingPayrolls(0, 5);

    forkJoin({
      stats: stats$,
      pendingOrgs: pendingOrgs$,
      allOrgs: allOrgs$,
      pendingPayrolls: pendingPayrolls$,
    })
      .pipe(finalize(() => {
        this.isLoading = false;
        this.lastUpdated = new Date();
      }))
      .subscribe({
        next: (responses) => {
          this.populateStatsCards(responses.stats);
          this.growthChartData = [{ name: 'New Organizations', series: responses.stats.organizationGrowth }];
          this.volumeChartData = [{ name: 'Monthly Transaction Volume', series: responses.stats.transactionVolume }];

          this.growthSummary = {
            value: responses.stats.monthlyOrganizationGrowthPercentage,
            changeType: responses.stats.monthlyOrganizationGrowthPercentage >= 0 ? 'positive' : 'negative',
          };
          this.volumeSummary = {
            value: responses.stats.monthlyTransactionVolumePercentage,
            changeType: responses.stats.monthlyTransactionVolumePercentage >= 0 ? 'positive' : 'negative',
          };

          // NEW: Payroll Trends from backend (always update, even if empty)
          this.payrollChartData = [{
            name: 'Monthly Payroll Processed',
            series: responses.stats.payrollTrends || []
          }];
          this.payrollSummary = {
            value: responses.stats.monthlyPayrollPercentage || 0,
            changeType: (responses.stats.monthlyPayrollPercentage || 0) >= 0 ? 'positive' : 'negative',
          };

          // NEW: Transaction Count (System Activity) from backend (always update)
          this.successRateChartData = [{
            name: 'Monthly Transaction Activity',
            series: responses.stats.transactionCounts || []
          }];
          this.successRateSummary = {
            value: responses.stats.monthlyTransactionCountPercentage || 0,
            changeType: (responses.stats.monthlyTransactionCountPercentage || 0) >= 0 ? 'positive' : 'negative',
          };

          this.pendingOrganizations = responses.pendingOrgs.content;
          this.allOrganizations = responses.allOrgs.content;
          this.pendingPayrolls = responses.pendingPayrolls.content || [];
        },
        error: (err) => {
          this.error = this.extractErrorMessage(err);
          this.notificationService.showError(this.error);
          console.error('Dashboard data loading error:', err);
        },
      });
  }

  populateStatsCards(dto: BankAdminDashboardStatsDto): void {
    const total = dto.totalOrganizations;
    this.stats = [
      {
        label: 'Total Organizations',
        value: dto.totalOrganizations,
        change: dto.organizationGrowthPercentage,
        changeLabel: 'Growth This Month',
        icon: 'business-outline',
        cardClass: 'stat-card-total',
        iconClass: 'stat-icon-total'
      },
      {
        label: 'Active',
        value: dto.activeOrganizations,
        change: total > 0 ? (dto.activeOrganizations / total) * 100 : 0,
        changeLabel: 'of Total',
        icon: 'checkmark-circle-outline',
        cardClass: 'stat-card-active',
        iconClass: 'stat-icon-active'
      },
      {
        label: 'Pending Approval',
        value: dto.pendingOrganizations,
        change: total > 0 ? (dto.pendingOrganizations / total) * 100 : 0,
        changeLabel: 'of Total',
        icon: 'time-outline',
        cardClass: 'stat-card-pending',
        iconClass: 'stat-icon-pending'
      },
      {
        label: 'Suspended',
        value: dto.suspendedOrganizations,
        change: total > 0 ? (dto.suspendedOrganizations / total) * 100 : 0,
        changeLabel: 'of Total',
        icon: 'ban-outline',
        cardClass: 'stat-card-suspended',
        iconClass: 'stat-icon-suspended'
      },
    ];
  }

  setActiveChart(chartType: 'growth' | 'volume' | 'payroll' | 'success'): void {
    this.activeChart = chartType;
  }

  formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  viewOrganizationDetails(orgId: number): void {
    this.router.navigate(['/bank-admin/organizations', orgId]);
  }

  viewPayrollDetails(payrollId: number): void {
    this.router.navigate(['/bank-admin/payroll-approval', payrollId]);
  }

  approveOrganization(orgId: number, event: MouseEvent): void {
    event.stopPropagation();
    console.log(`Approving organization ${orgId}`);
  }

  rejectOrganization(orgId: number, event: MouseEvent): void {
    event.stopPropagation();
    console.log(`Rejecting organization ${orgId}`);
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view this dashboard.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load dashboard data. Please try again.';
  }
}
