import { Injectable, signal, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

export interface AuthUser {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apollo = inject(Apollo);
  private tokenKey = 'cv_admin_token';
  
  // Signals for reactive state
  private _isAuthenticated = signal<boolean>(false);
  private _currentUser = signal<AuthUser | null>(null);
  private _isLoading = signal<boolean>(false);
  
  // Public readonly signals
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // GraphQL mutations and queries
  private LOGIN_MUTATION = gql`
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        token
        expiresAt
        user {
          id
          username
          createdAt
          updatedAt
        }
      }
    }
  `;

  private ME_QUERY = gql`
    query Me {
      me {
        id
        username
        createdAt
        updatedAt
      }
    }
  `;

  constructor() {
    this.checkAuthStatus();
  }

  /**
   * Login with username and password
   */
  login(username: string, password: string): Observable<AuthPayload> {
    this._isLoading.set(true);
    
    // Direct fetch approach for Vercel compatibility
    return new Observable(observer => {
      this.loginWithDirectFetch(username, password)
        .then(authPayload => {
          // Store token (only in browser)
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.tokenKey, authPayload.token);
          }
          
          // Update state
          this._isAuthenticated.set(true);
          this._currentUser.set(authPayload.user);
          this._isLoading.set(false);
          
          observer.next(authPayload);
          observer.complete();
        })
        .catch(error => {
          console.error('Login failed:', error);
          this._isLoading.set(false);
          this._isAuthenticated.set(false);
          this._currentUser.set(null);
          observer.error(new Error('Invalid credentials'));
        });
    });
  }

  /**
   * Direct fetch login for Vercel compatibility
   */
  private async loginWithDirectFetch(username: string, password: string): Promise<AuthPayload> {
    try {
      console.log('Attempting direct login fetch...');
      
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Login($username: String!, $password: String!) {
              login(username: $username, password: $password) {
                token
                expiresAt
                user {
                  id
                  username
                  createdAt
                  updatedAt
                }
              }
            }
          `,
          variables: { username, password }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Direct login result:', result);

      // Handle Vercel response format
      let graphqlResult;
      if (result.body && result.body.singleResult) {
        graphqlResult = result.body.singleResult;
        console.log('Detected Vercel login response format');
      } else {
        graphqlResult = result;
      }

      if (graphqlResult.errors) {
        console.error('Login GraphQL errors:', graphqlResult.errors);
        throw new Error(graphqlResult.errors[0].message || 'Login failed');
      }

      if (!graphqlResult.data?.login) {
        throw new Error('No login data in response');
      }

      console.log('Login successful:', graphqlResult.data.login.user.username);
      return graphqlResult.data.login;
    } catch (error) {
      console.error('Direct login fetch failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    
    // Clear Apollo cache
    this.apollo.client.clearStore();
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this._isAuthenticated();
  }

  /**
   * Verify token with server
   */
  verifyToken(): Observable<AuthUser> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No token found');
    }

    return this.apollo.query<{ me: AuthUser }>({
      query: this.ME_QUERY,
      context: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      fetchPolicy: 'network-only' // Always fetch from server
    }).pipe(
      map(result => {
        if (!result.data?.me) {
          throw new Error('Invalid token');
        }
        return result.data.me;
      }),
      tap(user => {
        this._isAuthenticated.set(true);
        this._currentUser.set(user);
      }),
      catchError(error => {
        this.logout();
        throw error;
      })
    );
  }

  /**
   * Check authentication status on service initialization
   */
  private checkAuthStatus(): void {
    // Only check auth status in browser environment
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    const token = this.getToken();
    
    if (token) {
      this.verifyToken().subscribe({
        next: () => {
          // Token is valid, user is authenticated
        },
        error: () => {
          // Token is invalid, logout
          this.logout();
        }
      });
    }
  }

  /**
   * Get authorization header for HTTP requests
   */
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    
    if (token) {
      return {
        'Authorization': `Bearer ${token}`
      };
    }
    
    return {};
  }

  /**
   * Check if token is expired (client-side check)
   */
  isTokenExpired(): boolean {
    if (typeof localStorage === 'undefined') {
      return true;
    }
    
    const token = this.getToken();
    
    if (!token) {
      return true;
    }

    try {
      // Decode JWT token (basic check, not cryptographically verified)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Refresh authentication state
   */
  refreshAuth(): Observable<AuthUser> {
    if (this.isTokenExpired()) {
      this.logout();
      throw new Error('Token expired');
    }

    return this.verifyToken();
  }
}