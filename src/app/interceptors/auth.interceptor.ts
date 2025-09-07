import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get token from auth service
    const token = this.authService.getToken();
    
    // Clone request and add authorization header if token exists
    let authReq = req;
    if (token && this.shouldAddToken(req)) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle the request and catch authentication errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // If we get a 401 Unauthorized, logout the user
        if (error.status === 401) {
          this.authService.logout();
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Determine if we should add the auth token to this request
   */
  private shouldAddToken(req: HttpRequest<any>): boolean {
    // Add token to GraphQL requests
    if (req.url.includes('/graphql')) {
      return true;
    }
    
    // Add token to API requests (if you have other API endpoints)
    if (req.url.includes('/api/')) {
      return true;
    }
    
    // Don't add token to other requests (static assets, etc.)
    return false;
  }
}