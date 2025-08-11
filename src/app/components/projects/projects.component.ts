import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services';
import { BadgeComponent, CardComponent } from '../ui';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, BadgeComponent, CardComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  // Inject services
  private dataService = inject(DataService);

  // Data from service
  projects = this.dataService.projects;

  // Helper methods
  getProjectId(title: string): string {
    return `project-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }

  getProjectAriaLabel(title: string): string {
    return `${title} project (opens in new tab)`;
  }

  getLinkDisplay(link: string): string {
    return link
      .replace('https://', '')
      .replace('www.', '')
      .replace(/\/$/, '');
  }

  trackByProject(index: number, project: any): string {
    return project.title;
  }

  trackByTag(index: number, tag: string): string {
    return tag;
  }
}