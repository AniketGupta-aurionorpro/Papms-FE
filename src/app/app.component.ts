import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './modules/shared/components/ui/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'PAYROLL-SYSTEM';
  constructor(private router: Router) { }

  isAuthPage(): boolean {
    const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
    return authRoutes.includes(this.router.url) || this.router.url === '/';
  }
}
