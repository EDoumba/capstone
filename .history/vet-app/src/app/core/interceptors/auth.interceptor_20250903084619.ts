import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {  HttpRequest,HttpHandler,HttpEvent,HttpInterceptor, HttpErrorResponse} from '@angular/common/http';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {} // ✅ used here
  
  //constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add auth token for API requests
    if (request.url.startsWith('/api')) {
      const token = localStorage.getItem('token');
      const apiReq = request.clone({
        url: `${environment.apiUrl}${request.url.replace('/api', '')}`,
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(apiReq);
    }

    return next.handle(request);
  }
}