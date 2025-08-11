import { Injectable, signal, computed } from '@angular/core';
import { ResumeData } from '../models/resume.interface';
import { RESUME_DATA } from '../data/resume-data';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Private signal for resume data
  private resumeDataSignal = signal<ResumeData>(RESUME_DATA);

  // Public computed signal for reading resume data
  resumeData = computed(() => this.resumeDataSignal());

  // Computed signals for specific sections
  personalInfo = computed(() => {
    const data = this.resumeDataSignal();
    return {
      name: data.name,
      initials: data.initials,
      location: data.location,
      locationLink: data.locationLink,
      about: data.about,
      summary: data.summary,
      avatarUrl: data.avatarUrl,
      personalWebsiteUrl: data.personalWebsiteUrl,
    };
  });

  contactInfo = computed(() => this.resumeDataSignal().contact);
  
  workExperience = computed(() => this.resumeDataSignal().work);
  
  education = computed(() => this.resumeDataSignal().education);
  
  skills = computed(() => this.resumeDataSignal().skills);
  
  projects = computed(() => this.resumeDataSignal().projects);

  /**
   * Update resume data (for future use)
   */
  updateResumeData(data: Partial<ResumeData>): void {
    this.resumeDataSignal.update(current => ({ ...current, ...data }));
  }

  /**
   * Reset resume data to default
   */
  resetResumeData(): void {
    this.resumeDataSignal.set(RESUME_DATA);
  }

  /**
   * Get command menu links for navigation
   */
  getCommandMenuLinks = computed(() => {
    const data = this.resumeDataSignal();
    const links = [];

    if (data.personalWebsiteUrl) {
      links.push({
        url: data.personalWebsiteUrl,
        title: 'Personal Website',
      });
    }

    return [
      ...links,
      ...data.contact.social.map((socialLink) => ({
        url: socialLink.url,
        title: socialLink.name,
      })),
    ];
  });
}