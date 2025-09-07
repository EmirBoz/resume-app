import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminGraphQLService } from '../../../../services/admin-graphql.service';
import { DataService } from '../../../../services';
import { AdminService } from '../../../../services/admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-projects-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './projects-form.html',
  styleUrl: './projects-form.scss'
})
export class ProjectsFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private adminGraphQLService = inject(AdminGraphQLService);
  private dataService = inject(DataService);
  private adminService = inject(AdminService);
  
  // Form state
  projectsForm!: FormGroup;
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
    this.projectsForm = this.fb.group({
      projects: this.fb.array([])
    });
  }
  
  get projectsArray(): FormArray {
    return this.projectsForm.get('projects') as FormArray;
  }
  
  private createProjectFormGroup(project?: any): FormGroup {
    return this.fb.group({
      id: [project?.id || ''],
      title: [project?.title || '', [Validators.required]],
      techStackString: [project?.techStack?.join(', ') || '', [Validators.required]],
      description: [project?.description || '', [Validators.required]],
      linkLabel: [project?.link?.label || ''],
      linkHref: [project?.link?.href || '']
    });
  }
  
  private loadCurrentData() {
    const resumeData = this.dataService.resumeData();
    
    // Clear existing form array
    while (this.projectsArray.length !== 0) {
      this.projectsArray.removeAt(0);
    }
    
    // Add projects or create empty one
    if (resumeData.projects && resumeData.projects.length > 0) {
      resumeData.projects.forEach(project => {
        this.projectsArray.push(this.createProjectFormGroup(project));
      });
    } else {
      this.addProject();
    }
  }
  
  addProject() {
    this.projectsArray.push(this.createProjectFormGroup());
  }
  
  removeProject(index: number) {
    if (this.projectsArray.length > 1) {
      this.projectsArray.removeAt(index);
    }
  }
  
  onSubmit() {
    if (this.projectsForm.valid) {
      this.saveProjects();
    } else {
      this.markFormGroupTouched();
    }
  }
  
  private async saveProjects() {
    if (this.isSaving()) return;
    
    this.isSaving.set(true);
    this.errorMessage.set(null);
    
    try {
      const formValue = this.projectsForm.value;
      
      // Transform form data to match API expectations
      const projects = formValue.projects.map((project: any) => ({
        id: project.id || undefined,
        title: project.title,
        techStack: project.techStackString ? project.techStackString.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
        description: project.description,
        link: (project.linkLabel && project.linkHref) ? {
          label: project.linkLabel,
          href: project.linkHref
        } : undefined
      }));
      
      // Call GraphQL mutation
      const success = await this.adminGraphQLService.updateProjects(projects).toPromise();
      
      if (!success) {
        throw new Error('Failed to save projects');
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
      console.error('Error saving projects:', error);
      this.errorMessage.set(error.message || 'Failed to save changes. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }
  
  resetForm() {
    this.projectsForm.reset();
    this.loadCurrentData();
    this.errorMessage.set(null);
  }
  
  private markFormGroupTouched() {
    this.projectsArray.controls.forEach(control => {
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
