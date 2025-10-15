import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import {
  AuthRequest,
  RegisterRequest,
  LoginResponseDto,
  ForceChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from "../models/auth.models";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl + '/auth';

  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post(`${this.url}/register`, registerRequest);
  }

  login(authRequest: AuthRequest): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.url}/login`, authRequest);
  }

  forceChangePassword(forceChangePasswordRequest: ForceChangePasswordRequest): Observable<string> {
    return this.http.post<string>(`${this.url}/force-change-password`, forceChangePasswordRequest);
  }

  forgotPassword(forgotPasswordRequest: ForgotPasswordRequest): Observable<string> {
    return this.http.post<string>(`${this.url}/forgot-password`, forgotPasswordRequest);
  }

  resetPassword(resetPasswordRequest: ResetPasswordRequest): Observable<string> {
    return this.http.post<string>(`${this.url}/reset-password`, resetPasswordRequest);
  }

  // Utility methods for token management
  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  removeToken(): void {
    localStorage.removeItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Store user info
  setUserInfo(user: LoginResponseDto): void {
    localStorage.setItem('user_info', JSON.stringify(user));
  }

  getUserInfo(): LoginResponseDto | null {
    const user = localStorage.getItem('user_info');
    return user ? JSON.parse(user) : null;
  }

  clearUserInfo(): void {
    localStorage.removeItem('user_info');
  }

  logout(): void {
    this.removeToken();
    this.clearUserInfo();
  }
}
