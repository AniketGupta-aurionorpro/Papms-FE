// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { PersistenceService } from './persistence.service';
import { User, LoginResponseDto } from '../models/user.models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthRequest, ForceChangePasswordRequest, ForgotPasswordRequest, RegisterRequest, ResetPasswordRequest } from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private url = environment.apiUrl + '/auth';

  constructor(
    private persistenceService: PersistenceService,
    private http: HttpClient // <-- Add HttpClient
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = this.persistenceService.get('currentUser') as User;
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  // --- Start: Methods moved from the deleted service ---

  // login(authRequest: AuthRequest): Observable<LoginResponseDto> {
  //   return this.http.post<LoginResponseDto>(`${this.url}/login`, authRequest).pipe(
  //     tap((response) => {
  //       // Use the setUser method to update both state and persistence
  //       this.setUser(response as unknown as User, response.accessToken);
  //       console.log('Login successful, user state updated:', response);
  //     })
  //   );
  // }

  // register(registerRequest: RegisterRequest): Observable<any> {
  //   return this.http.post(`${this.url}/register`, registerRequest);
  // }

  // forceChangePassword(forceChangePasswordRequest: ForceChangePasswordRequest): Observable<string> {
  //   return this.http.post<string>(`${this.url}/force-change-password`, forceChangePasswordRequest);
  // }

  // forgotPassword(forgotPasswordRequest: ForgotPasswordRequest): Observable<string> {
  //   return this.http.post<string>(`${this.url}/forgot-password`, forgotPasswordRequest);
  // }

  // resetPassword(resetPasswordRequest: ResetPasswordRequest): Observable<string> {
  //   return this.http.post<string>(`${this.url}/reset-password`, resetPasswordRequest);
  // }

  // --- End: Methods moved from the deleted service ---


  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.persistenceService.get('accessToken') as string || null;
  }

  getUserInfo(): User | null {
    return this.currentUserSubject.value;
  }

  requiresPasswordChange(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.requiresPasswordChange : false;
  }

  setUser(user: User, token: string): void {
    this.persistenceService.set('currentUser', user);
    this.persistenceService.set('accessToken', token);
    this.currentUserSubject.next(user);
  }

  logout(): void {
    this.persistenceService.delete('currentUser');
    this.persistenceService.delete('accessToken');
    this.currentUserSubject.next(null);
  }

  login(authRequest: AuthRequest): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.url}/login`, authRequest).pipe(
      tap((response) => {
        // Use the setUser method to update both state and persistence
        this.setUser(response as unknown as User, response.accessToken);
        console.log('Login successful, user state updated:', response);
      })
    );
  }

  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post(`${this.url}/register`, registerRequest);
  }

  forceChangePassword(forceChangePasswordRequest: ForceChangePasswordRequest): Observable<string> {
    // Expect a text response from the backend
    return this.http.post(`${this.url}/force-change-password`, forceChangePasswordRequest, { responseType: 'text' });
  }

  forgotPassword(forgotPasswordRequest: ForgotPasswordRequest): Observable<string> {
    // Expect a text response from the backend
    return this.http.post(`${this.url}/forgot-password`, forgotPasswordRequest, { responseType: 'text' });
  }

  resetPassword(resetPasswordRequest: ResetPasswordRequest): Observable<string> {
    // Expect a text response from the backend
    return this.http.post(`${this.url}/reset-password`, resetPasswordRequest, { responseType: 'text' });
  }

  // NEW: Real-time availability check methods
  checkUsernameAvailability(username: string): Observable<{ available: boolean; message: string }> {
    return this.http.get<{ available: boolean; message: string }>(`${this.url}/check-username`, {
      params: { username }
    });
  }

  checkEmailAvailability(email: string): Observable<{ available: boolean; message: string }> {
    return this.http.get<{ available: boolean; message: string }>(`${this.url}/check-email`, {
      params: { email }
    });
  }
}
