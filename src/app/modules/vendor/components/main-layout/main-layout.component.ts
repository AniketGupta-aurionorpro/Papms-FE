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
}

@Component({
    selector: 'app-vendor-layout',
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VendorMainLayoutComponent implements OnInit {
    isSidebarOpen = true;
    currentRoute = '';
    userInfo: User | null = null;

    menuItems: MenuItem[] = [
        { label: 'Dashboard', icon: 'grid-outline', route: '/vendor/dashboard' },
        { label: 'Create Bill', icon: 'add-circle-outline', route: '/vendor/bills/create' },
        { label: 'Bill History', icon: 'document-text-outline', route: '/vendor/bills/history' },
        { label: 'Payments', icon: 'cash-outline', route: '/vendor/payments' }
    ];

    constructor(
        public router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.userInfo = this.authService.getUserInfo();

        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: any) => {
                this.currentRoute = event.urlAfterRedirects || event.url;
            });
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    isMenuItemActive(menuItem: MenuItem): boolean {
        return this.currentRoute === menuItem.route;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }

    getInitials(name: string | undefined): string {
        if (!name) return 'V';
        const words = name.split(' ').filter(Boolean);
        if (words.length > 1) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
}
