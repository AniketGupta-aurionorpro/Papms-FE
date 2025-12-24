import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { EmployeeDashboardService } from '../../../../services/employee-dashboard.service';

@Component({
    selector: 'app-employee-main-layout',
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.css'],
    standalone: false
})
export class EmployeeMainLayoutComponent implements OnInit {
    isSidebarOpen = false;
    employeeName = '';
    profilePictureUrl = '';

    navigationItems = [
        { label: 'Dashboard', route: '/employee/dashboard', icon: 'speedometer-outline' },
        { label: 'My Profile', route: '/employee/profile', icon: 'person-outline' },
        { label: 'Payslips', route: '/employee/payslips', icon: 'document-text-outline' },
        { label: 'Concerns', route: '/employee/concerns', icon: 'chatbubble-ellipses-outline' },
        { label: 'Notifications', route: '/employee/notifications', icon: 'notifications-outline' },
    ];

    constructor(
        private authService: AuthService,
        private router: Router,
        private employeeDashboardService: EmployeeDashboardService
    ) { }

    ngOnInit(): void {
        const user = this.authService.getUserInfo();
        this.employeeName = user?.fullName || 'Employee';
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
