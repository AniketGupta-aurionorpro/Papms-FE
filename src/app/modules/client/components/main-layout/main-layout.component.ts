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
    selector: 'app-client-layout',
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientMainLayoutComponent implements OnInit {
    isSidebarOpen = true;
    isMobileMenuOpen = false;
    currentRoute = '';
    userInfo: (User & { organizationName?: string, clientName?: string }) | null = null;

    menuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            icon: 'grid-outline',
            route: '/client/dashboard'
        },
        {
            label: 'My Invoices',
            icon: 'document-text-outline',
            route: '/client/invoices'
        },
        {
            label: 'Deposits',
            icon: 'wallet-outline',
            route: '/client/deposits'
        },
        {
            label: 'Transactions',
            icon: 'receipt-outline',
            route: '/client/transactions'
        },
        {
            label: 'Profile',
            icon: 'person-outline',
            route: '/client/profile'
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
                this.closeMobileMenu();
            });
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

    isMenuItemActive(menuItem: MenuItem): boolean {
        return this.currentRoute === menuItem.route || this.currentRoute.startsWith(menuItem.route + '/');
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }

    getInitials(name: string | undefined): string {
        if (!name) return 'C';
        const words = name.split(' ').filter(Boolean);
        if (words.length > 1) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
}
