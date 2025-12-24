import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NotificationService as NotificationApiService } from '../../../../services/notification.service';
import { NotificationService as ToastService } from '../../../../core/services/notification.service';

interface NotificationItem {
  id: number;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  standalone: false
})
export class NotificationsComponent implements OnInit {
  notifications: NotificationItem[] = [];
  isLoading = true;
  error = '';
  unreadCount = 0;

  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private notificationApiService: NotificationApiService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.error = '';

    this.notificationApiService.getMyNotifications(this.currentPage, this.pageSize)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: any) => {
          this.notifications = response.content || [];
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.updateUnreadCount();
        },
        error: (err) => {
          this.error = 'Failed to load notifications';
        }
      });
  }

  updateUnreadCount(): void {
    this.notificationApiService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCount = response.unreadCount;
      },
      error: () => {
        // Fallback to counting from current list
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      }
    });
  }

  markAsRead(notification: NotificationItem): void {
    if (notification.read) return;

    this.notificationApiService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: (err) => {
        this.toastService.showError('Failed to mark notification as read');
      }
    });
  }

  markAllAsRead(): void {
    // Mark each unread notification one by one (since there's no bulk API)
    const unreadNotifications = this.notifications.filter(n => !n.read);

    if (unreadNotifications.length === 0) return;

    unreadNotifications.forEach(notification => {
      this.notificationApiService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.read = true;
        }
      });
    });

    this.unreadCount = 0;
    this.toastService.showSuccess('All notifications marked as read');
  }

  getTypeIcon(notification: NotificationItem): string {
    if (notification.message?.toLowerCase().includes('salary') ||
      notification.message?.toLowerCase().includes('payroll')) {
      return 'cash-outline';
    } else if (notification.message?.toLowerCase().includes('profile')) {
      return 'person-outline';
    } else if (notification.message?.toLowerCase().includes('password')) {
      return 'key-outline';
    }
    return 'notifications-outline';
  }

  getTypeClass(notification: NotificationItem): string {
    if (notification.message?.toLowerCase().includes('updated') ||
      notification.message?.toLowerCase().includes('successfully')) {
      return 'text-green-400 bg-green-900/30';
    } else if (notification.message?.toLowerCase().includes('warning') ||
      notification.message?.toLowerCase().includes('alert')) {
      return 'text-yellow-400 bg-yellow-900/30';
    }
    return 'text-blue-400 bg-blue-900/30';
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadNotifications();
    }
  }
}
