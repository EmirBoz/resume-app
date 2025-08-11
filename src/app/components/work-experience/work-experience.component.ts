import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services';
import { BadgeComponent, CardComponent, CardHeaderComponent, CardContentComponent } from '../ui';
import { WorkExperience } from '../../models';

@Component({
  selector: 'app-work-experience',
  standalone: true,
  imports: [
    CommonModule, 
    BadgeComponent, 
    CardComponent, 
    CardHeaderComponent, 
    CardContentComponent
  ],
  templateUrl: './work-experience.component.html',
  styleUrl: './work-experience.component.scss'
})
export class WorkExperienceComponent {
  // Inject services
  private dataService = inject(DataService);

  // Data from service
  workExperience = this.dataService.workExperience;

  // Helper methods
  formatWorkPeriod(start: string, end: string | null): string {
    return `${start} - ${end ?? 'Present'}`;
  }

  getWorkPeriodTitle(start: string, end: string | null): string {
    return `Employment period: ${start} to ${end ?? 'Present'}`;
  }

  getCompanyAriaLabel(company: string): string {
    return `${company} company website`;
  }

  trackByWork(index: number, work: WorkExperience): string {
    return `${work.company}-${work.start}`;
  }

  trackByBadge(index: number, badge: string): string {
    return badge;
  }
}