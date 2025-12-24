import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../../../../core/services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm">
      <div *ngFor="let toast of toasts; let i = index"
           class="p-4 rounded-xl shadow-2xl backdrop-blur-sm border flex items-start gap-3 animate-slide-in"
           [ngClass]="getToastClasses(toast.type)">
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <ion-icon [name]="getIcon(toast.type)" class="text-xl"></ion-icon>
        </div>
        <!-- Message -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium leading-relaxed">{{ toast.message }}</p>
        </div>
        <!-- Close button -->
        <button (click)="removeToast(i)" 
                class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <ion-icon name="close-outline" class="text-lg"></ion-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOut {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(100%); }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out forwards;
    }
    .animate-slide-out {
      animation: slideOut 0.3s ease-in forwards;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Array<Notification & { id: number }> = [];
  private subscription!: Subscription;
  private toastId = 0;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(notification => {
      this.addToast(notification);
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  addToast(notification: Notification): void {
    const id = ++this.toastId;
    this.toasts.push({ ...notification, id });

    // Auto remove after duration
    setTimeout(() => {
      this.removeToastById(id);
    }, notification.duration || 5000);
  }

  removeToast(index: number): void {
    this.toasts.splice(index, 1);
  }

  removeToastById(id: number): void {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }
  }

  getToastClasses(type: string): string {
    const baseClasses = {
      'success': 'bg-green-900/90 border-green-500/50 text-green-100',
      'error': 'bg-red-900/90 border-red-500/50 text-red-100',
      'warning': 'bg-yellow-900/90 border-yellow-500/50 text-yellow-100',
      'info': 'bg-blue-900/90 border-blue-500/50 text-blue-100'
    };
    return baseClasses[type as keyof typeof baseClasses] || baseClasses.info;
  }

  getIcon(type: string): string {
    const icons = {
      'success': 'checkmark-circle',
      'error': 'alert-circle',
      'warning': 'warning',
      'info': 'information-circle'
    };
    return icons[type as keyof typeof icons] || icons.info;
  }
}
