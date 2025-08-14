import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { RESUME_DATA } from '../data/resume-data';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  updatePageMeta() {
    const { name, about } = RESUME_DATA;
    
    // Update title
    this.titleService.setTitle(`${name} - Developer`);
    
    // Update meta description
    this.metaService.updateTag({
      name: 'description',
      content: `${name} - ${about.replace('\n', ' ')} 3+ years experience in TypeScript, Angular, React.`
    });
    
    // Update Open Graph tags
    this.metaService.updateTag({
      property: 'og:title',
      content: `${name} - Full Stack Developer`
    });
    
    this.metaService.updateTag({
      property: 'og:description',
      content: `${about.replace('\n', ' ')} 3+ years experience in TypeScript, Angular, React.`
    });
    
    // Update Twitter tags
    this.metaService.updateTag({
      property: 'twitter:title',
      content: `${name} - Full Stack Developer`
    });
    
    this.metaService.updateTag({
      property: 'twitter:description',
      content: `${about.replace('\n', ' ')} 3+ years experience in TypeScript, Angular, React.`
    });
  }
}
