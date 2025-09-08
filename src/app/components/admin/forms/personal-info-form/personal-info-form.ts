import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminGraphQLService } from '../../../../services/admin-graphql.service';
import { DataService } from '../../../../services';
import { AdminService } from '../../../../services/admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-personal-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Form Header -->
      <div class="flex items-center justify-between">
        
        <!-- Save Status -->
        <div class="flex items-center space-x-2">
          @if (isSaving()) {
            <div class="flex items-center text-blue-600 text-sm">
              <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </div>
          } @else if (lastSaved()) {
            <div class="flex items-center text-green-600 text-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Saved Successfully - Panel closing...
            </div>
          }
        </div>
      </div>

      <!-- Error Message -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h4 class="text-sm font-medium text-red-800">Error saving changes</h4>
              <p class="text-sm text-red-700 mt-1">{{ errorMessage() }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Form -->
      <form [formGroup]="personalInfoForm" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <!-- Basic Info Section -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Full Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                formControlName="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
              @if (personalInfoForm.get('name')?.invalid && personalInfoForm.get('name')?.touched) {
                <p class="text-red-600 text-sm mt-1">Full name is required</p>
              }
            </div>

            <!-- Initials -->
            <div>
              <label for="initials" class="block text-sm font-medium text-gray-700 mb-1">
                Initials *
              </label>
              <input
                type="text"
                id="initials"
                formControlName="initials"
                maxlength="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., EB"
              />
              @if (personalInfoForm.get('initials')?.invalid && personalInfoForm.get('initials')?.touched) {
                <p class="text-red-600 text-sm mt-1">Initials are required</p>
              }
            </div>
          </div>
        </div>

        <!-- Location Section -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">Location</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Location -->
            <div>
              <label for="location" class="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                id="location"
                formControlName="location"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Istanbul, Turkey"
              />
            </div>

            <!-- Location Link -->
            <div>
              <label for="locationLink" class="block text-sm font-medium text-gray-700 mb-1">
                Location Link
              </label>
              <input
                type="url"
                id="locationLink"
                formControlName="locationLink"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>
        </div>

        <!-- Contact Section -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">Contact Information</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                formControlName="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your.email@example.com"
              />
              @if (personalInfoForm.get('email')?.invalid && personalInfoForm.get('email')?.touched) {
                <p class="text-red-600 text-sm mt-1">Valid email is required</p>
              }
            </div>

            <!-- Phone -->
            <div>
              <label for="tel" class="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="tel"
                formControlName="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+90 555 123 45 67"
              />
            </div>
          </div>
        </div>

        <!-- Profile Section -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">Profile</h4>
          
          <div class="space-y-4">
            <!-- Avatar URL -->
            <div>
              <label for="avatarUrl" class="block text-sm font-medium text-gray-700 mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                id="avatarUrl"
                formControlName="avatarUrl"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="/profile.jpeg or https://..."
              />
            </div>

            <!-- Personal Website -->
            <div>
              <label for="personalWebsiteUrl" class="block text-sm font-medium text-gray-700 mb-1">
                Personal Website
              </label>
              <input
                type="url"
                id="personalWebsiteUrl"
                formControlName="personalWebsiteUrl"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        <!-- About Section -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">About & Summary</h4>
          
          <div class="space-y-4">
            <!-- About -->
            <div>
              <label for="about" class="block text-sm font-medium text-gray-700 mb-1">
                About (Short Description)
              </label>
              <textarea
                id="about"
                formControlName="about"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description about yourself..."
              ></textarea>
            </div>

            <!-- Summary -->
            <div>
              <label for="summary" class="block text-sm font-medium text-gray-700 mb-1">
                Professional Summary
              </label>
              <textarea
                id="summary"
                formControlName="summary"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detailed professional summary..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            (click)="resetForm()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset
          </button>
          
          <button
            type="submit"
            [disabled]="personalInfoForm.invalid || isSaving()"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (isSaving()) {
              <svg class="animate-spin w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            } @else {
              Save Changes
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Custom focus styles */
    input:focus, textarea:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    /* Form validation styles */
    .ng-invalid.ng-touched {
      border-color: #ef4444;
    }
    
    .ng-valid.ng-touched {
      border-color: #10b981;
    }
  `]
})
export class PersonalInfoFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private adminGraphQLService = inject(AdminGraphQLService);
  private dataService = inject(DataService);
  private adminService = inject(AdminService);
  
  // Form state
  personalInfoForm!: FormGroup;
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  lastSaved = signal<string | null>(null);
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  
  ngOnInit() {
    this.initializeForm();
    this.loadCurrentData();
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  private initializeForm() {
    this.personalInfoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      initials: ['', [Validators.required, Validators.maxLength(3)]],
      location: ['', Validators.required],
      locationLink: [''],
      email: ['', [Validators.required, Validators.email]],
      tel: [''],
      avatarUrl: [''],
      personalWebsiteUrl: [''],
      about: [''],
      summary: ['']
    });
    
    // Auto-save on form changes (debounced)
    const formChanges$ = this.personalInfoForm.valueChanges.pipe(
      // debounceTime(2000), // Wait 2 seconds after user stops typing
      // distinctUntilChanged(),
      // filter(() => this.personalInfoForm.valid)
    );
    
    // Uncomment for auto-save functionality
    // this.subscriptions.push(
    //   formChanges$.subscribe(() => {
    //     if (this.personalInfoForm.valid && !this.isSaving()) {
    //       this.savePersonalInfo();
    //     }
    //   })
    // );
  }
  
  private loadCurrentData() {
    const resumeData = this.dataService.resumeData();
    
    this.personalInfoForm.patchValue({
      name: resumeData.name || '',
      initials: resumeData.initials || '',
      location: resumeData.location || '',
      locationLink: resumeData.locationLink || '',
      email: resumeData.contact?.email || '',
      tel: resumeData.contact?.tel || '',
      avatarUrl: resumeData.avatarUrl || '',
      personalWebsiteUrl: resumeData.personalWebsiteUrl || '',
      about: resumeData.about || '',
      summary: resumeData.summary || ''
    });
  }
  
  onSubmit() {
    if (this.personalInfoForm.valid) {
      this.savePersonalInfo();
    } else {
      this.markFormGroupTouched();
    }
  }
  
  private async savePersonalInfo() {
    if (this.isSaving()) return;
    
    this.isSaving.set(true);
    this.errorMessage.set(null);
    
    try {
      const formValue = this.personalInfoForm.value;
      console.log('Saving personal info with data:', formValue);
      
      // Call GraphQL mutation with proper subscription handling
      this.adminGraphQLService.updatePersonalInfo(formValue).subscribe({
        next: (success) => {
          console.log('Update personal info result:', success);
          
          if (success) {
            // Update success state
            this.lastSaved.set(this.formatTime(new Date()));
            
            // Refresh data service to update UI
            this.dataService.refreshFromGraphQL();
            
            // Close admin panel after successful save
            setTimeout(() => {
              this.adminService.closeAdminPanel();
            }, 500); // Small delay to show success message
            
            console.log('Personal info updated successfully');
          } else {
            throw new Error('Update returned false');
          }
          
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error saving personal info:', error);
          this.errorMessage.set(error.message || 'Failed to save changes. Please try again.');
          this.isSaving.set(false);
        }
      });
      
    } catch (error: any) {
      console.error('Error in savePersonalInfo:', error);
      this.errorMessage.set(error.message || 'Failed to save changes. Please try again.');
      this.isSaving.set(false);
    }
  }
  
  resetForm() {
    this.personalInfoForm.reset();
    this.loadCurrentData();
    this.errorMessage.set(null);
  }
  
  private markFormGroupTouched() {
    Object.keys(this.personalInfoForm.controls).forEach(key => {
      const control = this.personalInfoForm.get(key);
      control?.markAsTouched();
    });
  }
  
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
}
