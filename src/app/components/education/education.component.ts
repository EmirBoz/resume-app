import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services';
import { CardComponent, CardHeaderComponent, CardContentComponent } from '../ui';
import { Education } from '../../models';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [
    CommonModule, 
    CardComponent, 
    CardHeaderComponent, 
    CardContentComponent
  ],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss'
})
export class EducationComponent {
  // Inject services
  private dataService = inject(DataService);

  // Data from service
  education = this.dataService.education;

  // Helper methods
  formatEducationPeriod(start: string, end: string): string {
    return `${start} - ${end}`;
  }

  getEducationPeriodTitle(start: string, end: string): string {
    return `Period: ${start} to ${end}`;
  }

  getSchoolId(school: string): string {
    return `education-${school.toLowerCase().replace(/\s+/g, '-')}`;
  }

  trackByEducation(index: number, education: Education): string {
    return education.school;
  }
}