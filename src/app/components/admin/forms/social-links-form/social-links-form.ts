import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminGraphQLService } from '../../../../services/admin-graphql.service';
import { DataService } from '../../../../services';
import { AdminService } from '../../../../services/admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-social-links-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './social-links-form.html',
  styleUrl: './social-links-form.scss'
})
export class SocialLinksFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private adminGraphQLService = inject(AdminGraphQLService);
  private dataService = inject(DataService);
  private adminService = inject(AdminService);
  
  // Form state
  socialLinksForm!: FormGroup;
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
    this.socialLinksForm = this.fb.group({
      socialLinks: this.fb.array([])
    });
  }
  
  get socialLinksArray(): FormArray {
    return this.socialLinksForm.get('socialLinks') as FormArray;
  }
  
  private createSocialLinkFormGroup(socialLink?: any): FormGroup {
    return this.fb.group({
      name: [socialLink?.name || '', [Validators.required]],
      url: [socialLink?.url || '', [Validators.required, Validators.pattern('https?://.+')]],
      icon: [socialLink?.icon || '', [Validators.required]]
    });
  }
  
  private loadCurrentData() {
    const resumeData = this.dataService.resumeData();
    
    // Clear existing form array
    while (this.socialLinksArray.length !== 0) {
      this.socialLinksArray.removeAt(0);
    }
    
    // Add social links or create empty one
    if (resumeData.contact?.social && resumeData.contact.social.length > 0) {
      resumeData.contact.social.forEach(socialLink => {
        this.socialLinksArray.push(this.createSocialLinkFormGroup(socialLink));
      });
    } else {
      this.addSocialLink();
    }
  }
  
  addSocialLink() {
    this.socialLinksArray.push(this.createSocialLinkFormGroup());
  }
  
  removeSocialLink(index: number) {
    if (this.socialLinksArray.length > 1) {
      this.socialLinksArray.removeAt(index);
    }
  }
  
  onSubmit() {
    if (this.socialLinksForm.valid) {
      this.saveSocialLinks();
    } else {
      this.markFormGroupTouched();
    }
  }
  
  private async saveSocialLinks() {
    if (this.isSaving()) return;
    
    this.isSaving.set(true);
    this.errorMessage.set(null);
    
    try {
      const formValue = this.socialLinksForm.value;
      
      // Transform form data to match API expectations
      const socialLinks = formValue.socialLinks.map((link: any) => ({
        name: link.name,
        url: link.url,
        icon: link.icon.toUpperCase() // Convert to uppercase for backend compatibility
      }));
      
      // Call GraphQL mutation
      const success = await this.adminGraphQLService.updateSocialLinks(socialLinks).toPromise();
      
      if (!success) {
        throw new Error('Failed to save social links');
      }
      
      // Update success state
      this.lastSaved.set(this.formatTime(new Date()));
      
      // Refresh data service to update UI
      this.dataService.refreshFromGraphQL();
      
      // Close admin panel after successful save
      setTimeout(() => {
        this.adminService.closeAdminPanel();
      }, 500);
      
    } catch (error: any) {
      console.error('Error saving social links:', error);
      this.errorMessage.set(error.message || 'Failed to save changes. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }
  
  resetForm() {
    this.socialLinksForm.reset();
    this.loadCurrentData();
    this.errorMessage.set(null);
  }
  
  private markFormGroupTouched() {
    this.socialLinksArray.controls.forEach(control => {
      this.markFormGroupTouchedRecursive(control as FormGroup);
    });
  }
  
  private markFormGroupTouchedRecursive(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
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
