import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { PersonalInfoFormComponent } from '../forms/personal-info-form/personal-info-form';
import { WorkExperienceFormComponent } from '../forms/work-experience-form/work-experience-form';
import { EducationFormComponent } from '../forms/education-form/education-form';
import { SkillsFormComponent } from '../forms/skills-form/skills-form';
import { ProjectsFormComponent } from '../forms/projects-form/projects-form';
import { SocialLinksFormComponent } from '../forms/social-links-form/social-links-form';
import { BackupExportFormComponent } from '../forms/backup-export-form/backup-export-form';

export type AdminSection = 'personal' | 'work' | 'education' | 'skills' | 'projects' | 'social' | 'backup';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, PersonalInfoFormComponent, WorkExperienceFormComponent, EducationFormComponent, SkillsFormComponent, ProjectsFormComponent, SocialLinksFormComponent, BackupExportFormComponent],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss'
})
export class AdminPanelComponent {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  
  // State
  activeSection = signal<AdminSection>('personal');
  isSaving = signal(false);
  
  // Section definitions
  sections = [
    {
      id: 'personal' as AdminSection,
      label: 'Personal Info',
      description: 'Basic information and contact details',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    },
    {
      id: 'work' as AdminSection,
      label: 'Work Experience',
      description: 'Professional experience and career history',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
    },
    {
      id: 'education' as AdminSection,
      label: 'Education',
      description: 'Academic background and qualifications',
      icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'
    },
    {
      id: 'skills' as AdminSection,
      label: 'Skills',
      description: 'Technical skills and competencies',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
    },
    {
      id: 'projects' as AdminSection,
      label: 'Projects',
      description: 'Portfolio projects and achievements',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      id: 'social' as AdminSection,
      label: 'Social Links',
      description: 'Social media and professional profiles',
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
    },
    {
      id: 'backup' as AdminSection,
      label: 'Backup & Export',
      description: 'Data backup and export functionality',
      icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10'
    }
  ];
  
  // Computed properties
  currentSection = computed(() => {
    return this.sections.find(s => s.id === this.activeSection()) || this.sections[0];
  });
  
  // Methods
  setActiveSection(section: AdminSection) {
    this.activeSection.set(section);
  }
  
  getSectionButtonClass(sectionId: AdminSection): string {
    const isActive = this.activeSection() === sectionId;
    return isActive 
      ? 'bg-blue-100 text-blue-700 border-blue-200' 
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  }
  
  onBackdropClick(event: Event) {
    // Close panel when clicking on backdrop
    this.closePanel();
  }
  
  closePanel() {
    this.adminService.closeAdminPanel();
  }
  
  // Simulate saving state for demo
  simulateSave() {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
    }, 1000);
  }
}
