import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private notificationService: NotificationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.status === 0) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else if (error.status >= 400 && error.status < 500) {
            // Client errors
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.status === 404) {
              errorMessage = 'The requested resource was not found.';
            } else if (error.status === 400) {
              errorMessage = 'Bad request. Please check your input.';
            } else {
              errorMessage = `Error: ${error.status} ${error.statusText}`;
            }
          } else if (error.status >= 500) {
            // Server errors
            errorMessage = 'Server error. Please try again later.';
          }
        }

        // Show notification for non-401 errors (handled in token interceptor)
        if (error.status !== 401) {
          this.notificationService.showError(errorMessage);
        }

        return throwError(error);
      })
    );
  }
}
