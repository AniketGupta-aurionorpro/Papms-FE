import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConcernService } from '../../../../../services/concern.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { ConcernResponseDto, ConcernStatus } from '../../../../../models/concern.models';

@Component({
    selector: 'app-concerns-list',
    templateUrl: './concerns-list.component.html',
    styleUrls: ['./concerns-list.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConcernsListComponent implements OnInit {
    isLoading = true;
    error = '';
    concerns: ConcernResponseDto[] = [];
    filteredConcerns: ConcernResponseDto[] = [];
    organizationId = 0;

    // Filters
    statusFilter: string = 'ALL';
    searchTerm: string = '';
    ConcernStatus = ConcernStatus;

    // Stats
    totalConcerns = 0;
    openConcerns = 0;
    inProgressConcerns = 0;
    resolvedConcerns = 0;

    constructor(
        private concernService: ConcernService,
        private notificationService: NotificationService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const user = this.authService.getUserInfo();
        this.organizationId = user?.organizationId || 0;
        this.loadConcerns();
    }

    loadConcerns(): void {
        this.isLoading = true;
        this.error = '';

        this.concernService.getConcernsForOrganization(this.organizationId)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (data) => {
                    console.log('Concerns API response:', data);
                    this.concerns = data || [];
                    this.updateStats();
                    this.applyFilters();
                },
                error: (err) => {
                    this.error = 'Failed to load concerns';
                    this.notificationService.showError(this.error);
                }
            });
    }

    updateStats(): void {
        this.totalConcerns = this.concerns.length;
        this.openConcerns = this.concerns.filter(c => c.status === ConcernStatus.OPEN).length;
        this.inProgressConcerns = this.concerns.filter(c => c.status === ConcernStatus.IN_PROGRESS).length;
        this.resolvedConcerns = this.concerns.filter(c => c.status === ConcernStatus.RESOLVED || c.status === ConcernStatus.CLOSED).length;
    }

    applyFilters(): void {
        let result = [...this.concerns];

        // Status filter
        if (this.statusFilter !== 'ALL') {
            result = result.filter(c => c.status === this.statusFilter);
        }

        // Search filter
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            result = result.filter(c =>
                c.subject.toLowerCase().includes(term) ||
                c.employeeName?.toLowerCase().includes(term) ||
                c.description.toLowerCase().includes(term)
            );
        }

        this.filteredConcerns = result;
    }

    viewConcern(concernId: number): void {
        if (!concernId || isNaN(concernId)) {
            console.error('Invalid concern ID:', concernId);
            this.notificationService.showError('Invalid concern ID');
            return;
        }
        this.router.navigate(['/org-admin/concerns', concernId]);
    }

    getStatusClass(status: ConcernStatus): string {
        switch (status) {
            case ConcernStatus.OPEN:
                return 'bg-blue-900/50 text-blue-400 border-blue-700/50';
            case ConcernStatus.IN_PROGRESS:
                return 'bg-yellow-900/50 text-yellow-400 border-yellow-700/50';
            case ConcernStatus.RESOLVED:
                return 'bg-green-900/50 text-green-400 border-green-700/50';
            case ConcernStatus.CLOSED:
                return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
            default:
                return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
        }
    }

    getStatusIcon(status: ConcernStatus): string {
        switch (status) {
            case ConcernStatus.OPEN:
                return 'radio-button-on-outline';
            case ConcernStatus.IN_PROGRESS:
                return 'hourglass-outline';
            case ConcernStatus.RESOLVED:
                return 'checkmark-circle-outline';
            case ConcernStatus.CLOSED:
                return 'close-circle-outline';
            default:
                return 'help-circle-outline';
        }
    }
}
