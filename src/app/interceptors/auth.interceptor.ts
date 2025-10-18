import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../core/services/auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Define public routes that should NOT receive an Authorization header
  const isPublicRoute = req.url.includes('/auth/login') ||
                        req.url.includes('/auth/register') ||
                        req.url.includes('/organizations/register');

  // Only attach the token if it exists AND it's not a public auth route
  if (token && !isPublicRoute) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      },
    });
    return next(cloned);
  }

  // For public routes or if no token exists, pass the request as-is
  return next(req);
};
