import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, ThemeService } from './services';
import { SkeletonComponent } from './components/ui';
import { HeaderComponent } from './components/header/header.component';
import { SummaryComponent } from './components/summary/summary.component';
import { WorkExperienceComponent } from './components/work-experience/work-experience.component';
import { EducationComponent } from './components/education/education.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { CommandMenuComponent } from './components/command-menu/command-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, HeaderComponent, SummaryComponent, WorkExperienceComponent, EducationComponent, SkillsComponent, ProjectsComponent, CommandMenuComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Inject services
  private dataService = inject(DataService);
  private themeService = inject(ThemeService);

  // Expose data for template
  resumeData = this.dataService.resumeData;
  
  // Loading state
  isLoading = signal<boolean>(false);

  // Error state
  errorState = signal<string | null>(null);

  // Computed properties
  pageTitle = computed(() => `${this.resumeData().name} - Resume`);
  
  constructor() {
    // Force light theme for CV - CVs should always be readable
    this.themeService.setTheme('light');
    
    // Remove any dark theme classes from document
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }

  // Error boundary-like functionality
  handleError(error: Error, sectionName: string): void {
    console.error(`Error in ${sectionName}:`, error);
    this.errorState.set(`Error loading ${sectionName}`);
  }

  // Retry functionality
  retry(): void {
    this.errorState.set(null);
    this.isLoading.set(false);
  }
}
