import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminGraphQLService } from '../../../../services/admin-graphql.service';
import { DataService } from '../../../../services';
import { AdminService } from '../../../../services/admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-skills-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './skills-form.html',
  styleUrl: './skills-form.scss'
})
export class SkillsFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private adminGraphQLService = inject(AdminGraphQLService);
  private dataService = inject(DataService);
  private adminService = inject(AdminService);
  
  // Form state
  skillsForm!: FormGroup;
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  lastSaved = signal<string | null>(null);
  skillsArray = signal<string[]>([]);
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  
  ngOnInit() {
    this.initializeForm();
    this.loadCurrentData();
    this.setupFormListener();
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  private initializeForm() {
    this.skillsForm = this.fb.group({
      skillsText: ['', [Validators.required]]
    });
  }
  
  private setupFormListener() {
    // Listen to skills text changes to update preview
    this.skillsForm.get('skillsText')?.valueChanges.subscribe((value: string) => {
      if (value) {
        const skills = value
          .split('\n')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0);
        this.skillsArray.set(skills);
      } else {
        this.skillsArray.set([]);
      }
    });
  }
  
  private loadCurrentData() {
    const resumeData = this.dataService.resumeData();
    
    // Load existing skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      const skillsText = resumeData.skills.join('\n');
      this.skillsForm.patchValue({
        skillsText: skillsText
      });
      this.skillsArray.set(resumeData.skills);
    }
  }
  
  onSubmit() {
    if (this.skillsForm.valid) {
      this.saveSkills();
    } else {
      this.markFormGroupTouched();
    }
  }
  
  private async saveSkills() {
    if (this.isSaving()) return;
    
    this.isSaving.set(true);
    this.errorMessage.set(null);
    
    try {
      const formValue = this.skillsForm.value;
      
      // Transform form data to skills array
      const skills = formValue.skillsText
        .split('\n')
        .map((skill: string) => skill.trim())
        .filter((skill: string) => skill.length > 0);
      
      // Call GraphQL mutation
      const success = await this.adminGraphQLService.updateSkills(skills).toPromise();
      
      if (!success) {
        throw new Error('Failed to save skills');
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
      console.error('Error saving skills:', error);
      this.errorMessage.set(error.message || 'Failed to save changes. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }
  
  resetForm() {
    this.skillsForm.reset();
    this.loadCurrentData();
    this.errorMessage.set(null);
  }
  
  private markFormGroupTouched() {
    Object.keys(this.skillsForm.controls).forEach(key => {
      const control = this.skillsForm.get(key);
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
