import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/enums/role.enum';

@Injectable({
  providedIn: 'root'
})
export class roleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as Role[];
    const userInfo = this.authService.getUserInfo();

    if (!userInfo) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (expectedRoles && expectedRoles.includes(userInfo.role)) {
      return true;
    }

    // User doesn't have required role
    this.router.navigate(['/unauthorized']);
    return false;
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    return this.canActivate(route);
  }
}
