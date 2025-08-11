import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  Globe, 
  Mail, 
  Phone,
  Github,
  Linkedin,
  Twitter
} from 'lucide-angular';
import { DataService } from '../../services';
import { AvatarComponent, ButtonComponent } from '../ui';
import { IconType } from '../../models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    AvatarComponent, 
    ButtonComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  // Inject services
  private dataService = inject(DataService);

  // Icons
  readonly Globe = Globe;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly Github = Github;
  readonly Linkedin = Linkedin;
  readonly Twitter = Twitter;

  // Data from service
  personalInfo = this.dataService.personalInfo;
  contactInfo = this.dataService.contactInfo;

  // Computed properties
  websiteHostname = computed(() => {
    const url = this.personalInfo().personalWebsiteUrl;
    if (!url) return '';
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  });

  // Icon mapping for social links
  getIconForSocial(iconType: IconType) {
    const iconMap = {
      github: this.Github,
      linkedin: this.Linkedin,
      x: this.Twitter,
      globe: this.Globe,
      mail: this.Mail,
      phone: this.Phone,
    };
    return iconMap[iconType] || this.Globe;
  }

  // Helper methods
  getEmailHref(email: string): string {
    return `mailto:${email}`;
  }

  getTelHref(tel: string): string {
    return `tel:${tel}`;
  }

  getLocationLabel(location: string): string {
    return `Location: ${location}`;
  }
}