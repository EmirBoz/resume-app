import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services';
import { BadgeComponent } from '../ui';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent {
  // Inject services
  private dataService = inject(DataService);

  // Data from service
  skills = this.dataService.skills;

  // Helper methods
  getSkillId(skill: string): string {
    return `skill-${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }

  getSkillAriaLabel(skill: string): string {
    return `Skill: ${skill}`;
  }

  trackBySkill(index: number, skill: string): string {
    return skill;
  }
}