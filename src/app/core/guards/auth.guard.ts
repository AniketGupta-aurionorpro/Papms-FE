import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})

export class authGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    if (this.authService.isLoggedIn()) {
      const userInfo = this.authService.getUserInfo();

      // Check if password change is required
      if (userInfo && this.authService.requiresPasswordChange()) {
        // --- MODIFICATION: REMOVED queryParams ---
        // Redirect without returnUrl as it's no longer needed.
        this.router.navigate(['/auth/force-password-change']);
        return false;
      }

      return true;
    }

    // Not logged in - redirect to login page
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
