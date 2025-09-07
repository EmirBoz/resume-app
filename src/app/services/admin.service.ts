import { Injectable, signal, inject, computed } from '@angular/core';
import { AuthService } from './auth.service';

export type AdminModalType = 'login' | 'panel' | null;

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private authService = inject(AuthService);

    // Modal state management
    private _activeModal = signal<AdminModalType>(null);
    private _isLoading = signal<boolean>(false);
    private _lastError = signal<string | null>(null);

    // Public readonly signals
    readonly activeModal = this._activeModal.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly lastError = this._lastError.asReadonly();

    // Computed properties
    readonly showAdminLogin = computed(() => this._activeModal() === 'login');
    readonly showAdminPanel = computed(() => this._activeModal() === 'panel');
    readonly isAnyModalOpen = computed(() => this._activeModal() !== null);

    // Authentication state from AuthService
    readonly isAuthenticated = this.authService.isAuthenticated;
    readonly currentUser = this.authService.currentUser;

    /**
     * Open admin login modal
     */
    openAdminLogin(): void {
        if (this.authService.isLoggedIn()) {
            // If already logged in, go directly to admin panel
            this.openAdminPanel();
        } else {
            this._activeModal.set('login');
            this.clearError();
        }
    }

    /**
     * Close admin login modal
     */
    closeAdminLogin(): void {
        if (this._activeModal() === 'login') {
            this._activeModal.set(null);
            this.clearError();
        }
    }

    /**
     * Open admin panel (requires authentication)
     */
    openAdminPanel(): void {
        if (!this.authService.isLoggedIn()) {
            this.openAdminLogin();
            return;
        }

        this._activeModal.set('panel');
        this.clearError();
    }

    /**
     * Close admin panel
     */
    closeAdminPanel(): void {
        if (this._activeModal() === 'panel') {
            this._activeModal.set(null);
            this.clearError();
        }
    }

    /**
     * Close any open modal
     */
    closeAllModals(): void {
        this._activeModal.set(null);
        this.clearError();
    }

    /**
     * Handle successful login
     */
    onLoginSuccess(): void {
        this.closeAdminLogin();
        this.openAdminPanel();
    }

    /**
     * Handle login error
     */
    onLoginError(error: string): void {
        this._lastError.set(error);
        this._isLoading.set(false);
    }

    /**
     * Handle logout
     */
    onLogout(): void {
        this.authService.logout();
        this.closeAllModals();
    }

    /**
     * Set loading state
     */
    setLoading(loading: boolean): void {
        this._isLoading.set(loading);
    }

    /**
     * Set error message
     */
    setError(error: string): void {
        this._lastError.set(error);
    }

    /**
     * Clear error message
     */
    clearError(): void {
        this._lastError.set(null);
    }

    /**
     * Check if user can access admin features
     */
    canAccessAdmin(): boolean {
        return this.authService.isLoggedIn();
    }

    /**
     * Get admin menu items based on authentication state
     */
    getAdminMenuItems(): Array<{ label: string; action: () => void; icon?: string }> {
        const items = [];

        if (this.authService.isLoggedIn()) {
            items.push(
                {
                    label: 'Admin Panel',
                    action: () => this.openAdminPanel(),
                    icon: 'settings'
                },
                {
                    label: 'Logout',
                    action: () => this.onLogout(),
                    icon: 'log-out'
                }
            );
        } else {
            items.push({
                label: 'Admin Login',
                action: () => this.openAdminLogin(),
                icon: 'log-in'
            });
        }

        return items;
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcut(event: KeyboardEvent): boolean {
        // Ctrl/Cmd + Shift + A for admin panel
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
            event.preventDefault();

            if (this.authService.isLoggedIn()) {
                this.openAdminPanel();
            } else {
                this.openAdminLogin();
            }

            return true;
        }

        // Escape to close modals
        if (event.key === 'Escape' && this.isAnyModalOpen()) {
            event.preventDefault();
            this.closeAllModals();
            return true;
        }

        return false;
    }

    /**
     * Initialize admin service
     */
    initialize(): void {
        // Only initialize in browser environment
        if (typeof window === 'undefined') {
            return;
        }

        // Check if user is already authenticated
        if (this.authService.isLoggedIn()) {
            // Verify token is still valid
            this.authService.verifyToken().subscribe({
                next: () => {
                    // Token is valid, user can access admin features
                },
                error: () => {
                    // Token is invalid, logout
                    this.onLogout();
                }
            });
        }

        // Set up keyboard shortcuts
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', (event) => {
                this.handleKeyboardShortcut(event);
            });
        }
    }

    /**
     * Cleanup admin service
     */
    destroy(): void {
        this.closeAllModals();
        this.clearError();
    }
}