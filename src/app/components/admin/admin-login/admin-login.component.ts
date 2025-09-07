import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent
  ],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);

  // Form
  loginForm: FormGroup;

  // State
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });

    // Focus username field when component loads
    setTimeout(() => {
      const usernameField = document.getElementById('username');
      if (usernameField) {
        usernameField.focus();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.clearError();
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading()) {
      const { username, password } = this.loginForm.value;
      
      this.isLoading.set(true);
      this.clearError();

      this.authService.login(username, password).subscribe({
        next: (authPayload) => {
          this.isLoading.set(false);
          this.adminService.onLoginSuccess();
          this.resetForm();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.handleLoginError(error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    this.adminService.closeAdminLogin();
    this.resetForm();
  }

  /**
   * Handle overlay click (close modal)
   */
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  /**
   * Check if form field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Handle login error
   */
  private handleLoginError(error: any): void {
    let message = 'Login failed. Please try again.';
    
    if (error?.message) {
      if (error.message.includes('Invalid credentials') || 
          error.message.includes('Authentication failed')) {
        message = 'Invalid username or password.';
      } else if (error.message.includes('Network')) {
        message = 'Network error. Please check your connection.';
      } else {
        message = error.message;
      }
    }
    
    this.errorMessage.set(message);
    this.adminService.onLoginError(message);
  }

  /**
   * Clear error message
   */
  private clearError(): void {
    this.errorMessage.set(null);
    this.adminService.clearError();
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.loginForm.reset();
    this.showPassword.set(false);
    this.clearError();
  }
}