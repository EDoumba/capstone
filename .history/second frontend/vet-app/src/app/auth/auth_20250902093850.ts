import { Component } from '@angular/core';

@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class Auth {

}

const BASE_URL = 'http://localhost:6000/api/auth';

login(email: string, password: string): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${BASE_URL}/login`, { email, password })
    .pipe(tap(response => {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      this.currentUserSubject.next(response.user);
    }));
}

register(userData: any): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${BASE_URL}/signup`, userData)
    .pipe(tap(response => {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      this.currentUserSubject.next(response.user);
    }));
}
