// import { Injectable } from "@angular/core";
// import { Observable, tap } from "rxjs";
// import { HttpClient } from "@angular/common/http";
// import { environment } from "../../environments/environment";
// import {
//   AuthRequest,
//   RegisterRequest,
//   LoginResponseDto,
//   ForceChangePasswordRequest,
//   ForgotPasswordRequest,
//   ResetPasswordRequest
// } from "../models/auth.models";

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   constructor(private http: HttpClient) { }

//   private url = environment.apiUrl + '/auth';

//   register(registerRequest: RegisterRequest): Observable<any> {
//     return this.http.post(`${this.url}/register`, registerRequest);
//   }

//   // login(authRequest: AuthRequest): Observable<LoginResponseDto> {
//   //   return this.http.post<LoginResponseDto>(`${this.url}/login`, authRequest);
//   // }
// //   login(authRequest: AuthRequest): Observable<LoginResponseDto> {
// //   return this.http.post<LoginResponseDto>(`${this.url}/login`, authRequest).pipe(
// //     tap((response) => {
// //       // Store token and user info immediately upon successful login
// //       this.setToken(response.accessToken);
// //       this.setUserInfo(response);
// //       console.log('Login successful, token stored:', response.accessToken);
// //       console.log('User role:', response.role);
// //     })
//   )
// // }

//   forceChangePassword(forceChangePasswordRequest: ForceChangePasswordRequest): Observable<string> {
//     return this.http.post<string>(`${this.url}/force-change-password`, forceChangePasswordRequest);
//   }

//   forgotPassword(forgotPasswordRequest: ForgotPasswordRequest): Observable<string> {
//     return this.http.post<string>(`${this.url}/forgot-password`, forgotPasswordRequest);
//   }

//   resetPassword(resetPasswordRequest: ResetPasswordRequest): Observable<string> {
//     return this.http.post<string>(`${this.url}/reset-password`, resetPasswordRequest);
//   }

//   // Utility methods for token management
//   setToken(token: string): void {
//     localStorage.setItem('access_token', token);
//   }

//   getToken(): string | null {
//     return localStorage.getItem('access_token');
//   }

//   removeToken(): void {
//     localStorage.removeItem('access_token');
//   }

//   isLoggedIn(): boolean {
//     return !!this.getToken();
//   }

//   // Store user info
//   // setUserInfo(user: LoginResponseDto): void {
//   //   localStorage.setItem('user_info', JSON.stringify(user));
//   // }

//   getUserInfo(): LoginResponseDto | null {
//     const user = localStorage.getItem('user_info');
//     return user ? JSON.parse(user) : null;
//   }

//   clearUserInfo(): void {
//     localStorage.removeItem('user_info');
//   }

//   logout(): void {
//     this.removeToken();
//     this.clearUserInfo();
//   }

//   setUserInfo(user: LoginResponseDto): void {
//   localStorage.setItem('user_info', JSON.stringify(user));
//   console.log('User info stored:', user);
// }

// // Add a method to check if user is authenticated
// isAuthenticated(): boolean {
//   const token = this.getToken();
//   const userInfo = this.getUserInfo();
//   return !!token && !!userInfo;
// }

// // Add a method to get user role
// getUserRole(): string | null {
//   const userInfo = this.getUserInfo();
//   return userInfo ? userInfo.role : null;
// }
// }
