import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminGraphQLService } from '../../../../services/admin-graphql.service';
import { DataService } from '../../../../services';
import { AdminService } from '../../../../services/admin.service';
import { Subscription } from 'rxjs';

interface WorkExperienceForm {
  id?: string;
  company: string;
  link: string;
  badges: string[];
  title: string;
  start: string;
  end?: string;
  description: string;
}

@Component({
  selector: 'app-work-experience-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './work-experience-form.html',
  styleUrl: './work-experience-form.scss'
})
export class WorkExperienceFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private adminGraphQLService = inject(AdminGraphQLService);
  private dataService = inject(DataService);
  private adminService = inject(AdminService);
  
  // Form state
  workExperienceForm!: FormGroup;
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
    this.workExperienceForm = this.fb.group({
      workExperiences: this.fb.array([])
    });
  }
  
  get workExperiencesArray(): FormArray {
    return this.workExperienceForm.get('workExperiences') as FormArray;
  }
  
  private createWorkExperienceFormGroup(workExp?: any): FormGroup {
    return this.fb.group({
      id: [workExp?.id || ''],
      company: [workExp?.company || '', [Validators.required]],
      link: [workExp?.link || ''],
      title: [workExp?.title || '', [Validators.required]],
      start: [workExp?.start || '', [Validators.required]],
      end: [workExp?.end || ''],
      description: [workExp?.description || '', [Validators.required]],
      badgesString: [workExp?.badges?.join(', ') || '']
    });
  }
  
  private loadCurrentData() {
    const resumeData = this.dataService.resumeData();
    
    // Clear existing form array
    while (this.workExperiencesArray.length !== 0) {
      this.workExperiencesArray.removeAt(0);
    }
    
    // Add work experiences or create empty one
    if (resumeData.work && resumeData.work.length > 0) {
      resumeData.work.forEach(workExp => {
        this.workExperiencesArray.push(this.createWorkExperienceFormGroup(workExp));
      });
    } else {
      this.addWorkExperience();
    }
  }
  
  addWorkExperience() {
    this.workExperiencesArray.push(this.createWorkExperienceFormGroup());
  }
  
  removeWorkExperience(index: number) {
    if (this.workExperiencesArray.length > 1) {
      this.workExperiencesArray.removeAt(index);
    }
  }
  
  onSubmit() {
    if (this.workExperienceForm.valid) {
      this.saveWorkExperience();
    } else {
      this.markFormGroupTouched();
    }
  }
  
  private async saveWorkExperience() {
    if (this.isSaving()) return;
    
    this.isSaving.set(true);
    this.errorMessage.set(null);
    
    try {
      const formValue = this.workExperienceForm.value;
      
      // Transform form data to match API expectations
      const workExperiences = formValue.workExperiences.map((work: any) => ({
        id: work.id || undefined,
        company: work.company,
        link: work.link || '',
        badges: work.badgesString ? work.badgesString.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
        title: work.title,
        start: work.start,
        end: work.end || null,
        description: work.description
      }));
      
      // Call GraphQL mutation
      const success = await this.adminGraphQLService.updateWorkExperience(workExperiences).toPromise();
      
      if (!success) {
        throw new Error('Failed to save work experience');
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
      console.error('Error saving work experience:', error);
      this.errorMessage.set(error.message || 'Failed to save changes. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }
  
  resetForm() {
    this.workExperienceForm.reset();
    this.loadCurrentData();
    this.errorMessage.set(null);
  }
  
  private markFormGroupTouched() {
    this.workExperiencesArray.controls.forEach(control => {
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
