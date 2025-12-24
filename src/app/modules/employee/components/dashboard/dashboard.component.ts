import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { EmployeeDashboardService } from '../../../../services/employee-dashboard.service';
import { EmployeeDashboardDto, CompleteEmployeeResponse, LatestPayslipDto } from '../../../../models/employee-dashboard.models';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import * as shape from 'd3-shape';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  error = '';
  employeeProfile: CompleteEmployeeResponse | null = null;
  latestPayslip: LatestPayslipDto | null = null;

  // Chart data
  salaryChartData: any[] = [];
  colorScheme: any = { domain: ['#06b6d4', '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b'] };
  curve: any = shape.curveMonotoneX;

  // Quick actions
  quickActions = [
    { label: 'View Profile', route: '/employee/profile', icon: 'person-outline', color: 'from-cyan-500 to-blue-500' },
    { label: 'View Payslips', route: '/employee/payslips', icon: 'document-text-outline', color: 'from-blue-500 to-purple-500' },
    { label: 'Raise Concern', route: '/employee/concerns/raise', icon: 'chatbubble-ellipses-outline', color: 'from-purple-500 to-pink-500' },
    { label: 'Bank Details', route: '/employee/profile/bank-account', icon: 'card-outline', color: 'from-emerald-500 to-teal-500' },
  ];

  constructor(
    private employeeDashboardService: EmployeeDashboardService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = '';

    this.employeeDashboardService.getMyDashboard()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data: EmployeeDashboardDto) => {
          this.employeeProfile = data.employeeProfile;
          this.latestPayslip = data.latestPayslip;
          this.prepareSalaryChart();
        },
        error: (err) => {
          this.error = this.extractErrorMessage(err);
          this.notificationService.showError(this.error);
          console.error('Dashboard loading error:', err);
        }
      });
  }

  prepareSalaryChart(): void {
    if (this.employeeProfile?.currentSalary) {
      const salary = this.employeeProfile.currentSalary;
      this.salaryChartData = [
        { name: 'Basic', value: salary.basicSalary || 0 },
        { name: 'HRA', value: salary.hra || 0 },
        { name: 'DA', value: salary.da || 0 },
        { name: 'Other Allowances', value: salary.otherAllowances || 0 },
        { name: 'PF Deduction', value: -(salary.pfContribution || 0) },
      ].filter(item => item.value !== 0);
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getFirstName(): string {
    return this.employeeProfile?.fullName?.split(' ')[0] || 'Employee';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  refreshData(): void {
    this.notificationService.showInfo('Refreshing dashboard...');
    this.loadDashboardData();
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view this dashboard.';
    if (err.status === 500) return 'Server error. Please try again later.';
    return 'Failed to load dashboard data. Please try again.';
  }
}
