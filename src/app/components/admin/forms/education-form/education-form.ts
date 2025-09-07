import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminGraphQLService } from '../../../../services/admin-graphql.service';
import { DataService } from '../../../../services';
import { AdminService } from '../../../../services/admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-education-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './education-form.html',
  styleUrl: './education-form.scss'
})
export class EducationFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private adminGraphQLService = inject(AdminGraphQLService);
  private dataService = inject(DataService);
  private adminService = inject(AdminService);
  
  // Form state
  educationForm!: FormGroup;
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
    this.educationForm = this.fb.group({
      educations: this.fb.array([])
    });
  }
  
  get educationsArray(): FormArray {
    return this.educationForm.get('educations') as FormArray;
  }
  
  private createEducationFormGroup(education?: any): FormGroup {
    return this.fb.group({
      id: [education?.id || ''],
      school: [education?.school || '', [Validators.required]],
      degree: [education?.degree || '', [Validators.required]],
      start: [education?.start || ''],
      end: [education?.end || '']
    });
  }
  
  private loadCurrentData() {
    const resumeData = this.dataService.resumeData();
    
    // Clear existing form array
    while (this.educationsArray.length !== 0) {
      this.educationsArray.removeAt(0);
    }
    
    // Add educations or create empty one
    if (resumeData.education && resumeData.education.length > 0) {
      resumeData.education.forEach(education => {
        this.educationsArray.push(this.createEducationFormGroup(education));
      });
    } else {
      this.addEducation();
    }
  }
  
  addEducation() {
    this.educationsArray.push(this.createEducationFormGroup());
  }
  
  removeEducation(index: number) {
    if (this.educationsArray.length > 1) {
      this.educationsArray.removeAt(index);
    }
  }
  
  onSubmit() {
    if (this.educationForm.valid) {
      this.saveEducation();
    } else {
      this.markFormGroupTouched();
    }
  }
  
  private async saveEducation() {
    if (this.isSaving()) return;
    
    this.isSaving.set(true);
    this.errorMessage.set(null);
    
    try {
      const formValue = this.educationForm.value;
      
      // Transform form data to match API expectations
      const educations = formValue.educations.map((edu: any) => ({
        id: edu.id || undefined,
        school: edu.school,
        degree: edu.degree,
        start: edu.start || null,
        end: edu.end || null
      }));
      
      // Call GraphQL mutation
      const success = await this.adminGraphQLService.updateEducation(educations).toPromise();
      
      if (!success) {
        throw new Error('Failed to save education');
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
      console.error('Error saving education:', error);
      this.errorMessage.set(error.message || 'Failed to save changes. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }
  
  resetForm() {
    this.educationForm.reset();
    this.loadCurrentData();
    this.errorMessage.set(null);
  }
  
  private markFormGroupTouched() {
    this.educationsArray.controls.forEach(control => {
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
