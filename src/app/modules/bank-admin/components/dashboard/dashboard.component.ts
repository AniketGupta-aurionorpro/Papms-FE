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

@Component({
  selector: 'app-bank-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone:false
})
export class BankAdminDashboardComponent implements OnInit {
  growthSummary = { value: 0, changeType: 'positive' };
  volumeSummary = { value: 0, changeType: 'positive' };
  isLoading = true;
  error = '';
  activeActionCenterTab = 'org';
  activeChart: 'growth' | 'volume' = 'growth';

  stats: any[] = [];
  growthChartData: any[] = [{ name: 'Growth', series: [] }];
  volumeChartData: any[] = [{ name: 'Volume', series: [] }];

  pendingOrganizations: OrganizationResponseDto[] = [];
  allOrganizations: OrganizationResponseDto[] = [];
  pendingPayrolls: PayrollBatchResponse[] = [];

  colorScheme: any = { domain: ['#3b82f6'] };
  volumeColorScheme: any = { domain: ['#14b8a6'] };

  formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  constructor(
    private organizationService: OrganizationService,
    private payrollService: PayrollService,
    private bankAdminService: BankAdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
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
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (responses) => {
          this.populateStatsCards(responses.stats); // This will now use the updated logic
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

          this.pendingOrganizations = responses.pendingOrgs.content;
          this.allOrganizations = responses.allOrgs.content;
          this.pendingPayrolls = responses.pendingPayrolls.content || [];
        },
        error: (err) => {
          this.error = 'Failed to load dashboard data. Please try again later.';
          console.error('Dashboard data loading error:', err);
        },
      });
  }

  // --- MODIFIED METHOD ---
  populateStatsCards(dto: BankAdminDashboardStatsDto): void {
    const total = dto.totalOrganizations;
    this.stats = [
      {
        label: 'Total Organizations',
        value: dto.totalOrganizations,
        change: dto.organizationGrowthPercentage,
        changeLabel: 'Growth This Month', // Add a descriptive label
      },
      {
        label: 'Active',
        value: dto.activeOrganizations,
        // Calculate percentage of total
        change: total > 0 ? (dto.activeOrganizations / total) * 100 : 0,
        changeLabel: 'of Total',
      },
      {
        label: 'Pending Approval',
        value: dto.pendingOrganizations,
        // Calculate percentage of total
        change: total > 0 ? (dto.pendingOrganizations / total) * 100 : 0,
        changeLabel: 'of Total',
      },
      {
        label: 'Suspended',
        value: dto.suspendedOrganizations,
        // Calculate percentage of total
        change: total > 0 ? (dto.suspendedOrganizations / total) * 100 : 0,
        changeLabel: 'of Total',
      },
    ];
  }
  // --- END MODIFICATION ---

  setActiveChart(chartType: 'growth' | 'volume'): void {
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
}
