// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Interfaces
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'client' | 'vet' | 'admin';
  profile_picture?: string | null;
  preferences?: any;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private BASE_URL = 'http://localhost:6000/api/auth'; // Full backend URL

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // LOGIN
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/login`, { email, password })
      .pipe(tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
      }));
  }

  // SIGNUP
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/signup`, userData)
      .pipe(tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
      }));
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // FORGOT PASSWORD
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/forgot-password`, { email });
  }

  // Check login state
  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  // Role checks
  isAdmin(): boolean {
    return this.currentUserValue?.user_type === 'admin';
  }

  isVet(): boolean {
    return this.currentUserValue?.user_type === 'vet';
  }

  // Helper to get token for protected requests
  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  // Example for making authenticated requests
  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
  }
}
