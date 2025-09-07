import { Injectable, signal, computed, inject, effect, DestroyRef } from '@angular/core';
import { ResumeData } from '../models/resume.interface';
import { RESUME_DATA } from '../data/resume-data';
import { GraphQLService } from './graphql.service';
import { environment } from '../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private graphqlService = inject(GraphQLService);
  private destroyRef = inject(DestroyRef);
  
  // Private signal for resume data - start with empty data, will be updated from GraphQL
  private resumeDataSignal = signal<ResumeData>(RESUME_DATA);
  
  // Loading and error states
  isLoading = signal<boolean>(false);
  isGraphQLEnabled = signal<boolean>(environment.enableGraphQL);
  dataSource = signal<'static' | 'graphql'>('static');

  // Public computed signal for reading resume data
  resumeData = computed(() => this.resumeDataSignal());
  
  constructor() {
    // Initialize data loading
    this.initializeData();
    
    // Set up real-time updates if GraphQL is enabled
    if (environment.enableGraphQL) {
      this.setupRealtimeUpdates();
    }
  }
  
  /**
   * Initialize data loading from GraphQL or fallback to static
   */
  private initializeData(): void {
    if (!environment.enableGraphQL) {
      this.dataSource.set('static');
      return;
    }

    this.isLoading.set(true);
    
    this.graphqlService.getResumeData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.isLoading.set(false);
          
          if (data) {
            // Successfully loaded from GraphQL
            this.resumeDataSignal.set(data);
            this.dataSource.set('graphql');
            console.log('Resume data loaded from GraphQL');
          } else if (environment.fallbackToStaticData) {
            // Fallback to static data
            this.dataSource.set('static');
            console.log('Falling back to static resume data');
          }
        },
        error: (error) => {
          console.error('Failed to load resume data from GraphQL:', error);
          this.isLoading.set(false);
          
          if (environment.fallbackToStaticData) {
            this.dataSource.set('static');
            console.log('Error occurred, falling back to static resume data');
          }
        }
      });
  }
  
  /**
   * Setup real-time updates via GraphQL subscriptions
   */
  private setupRealtimeUpdates(): void {
    // Temporarily disabled subscriptions
    console.log('Real-time updates disabled - subscriptions not implemented yet');
    
    // TODO: Implement subscriptions when server supports them
    // this.graphqlService.subscribeToResumeUpdates()
    //   .pipe(takeUntilDestroyed())
    //   .subscribe({
    //     next: (updatedData) => {
    //       if (updatedData) {
    //         console.log('Received real-time resume update:', updatedData);
    //         // Refresh full data when updates are received
    //         this.refreshFromGraphQL();
    //       }
    //     },
    //     error: (error) => {
    //       console.error('Real-time updates subscription failed:', error);
    //     }
    //   });
  }
  
  /**
   * Refresh data from GraphQL
   */
  refreshFromGraphQL(): void {
    if (!environment.enableGraphQL) {
      return;
    }

    this.isLoading.set(true);
    
    this.graphqlService.refetchData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.isLoading.set(false);
          if (data) {
            this.resumeDataSignal.set(data);
            console.log('Resume data refreshed from GraphQL');
          }
        },
        error: (error) => {
          console.error('Failed to refresh resume data:', error);
          this.isLoading.set(false);
        }
      });
  }

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
   * Update resume data locally (immediate UI update)
   */
  updateResumeData(data: Partial<ResumeData>): void {
    this.resumeDataSignal.update(current => ({ ...current, ...data }));
  }

  /**
   * Reset resume data to default
   */
  resetResumeData(): void {
    this.resumeDataSignal.set(RESUME_DATA);
    this.dataSource.set('static');
  }
  
  /**
   * Switch between GraphQL and static data
   */
  switchDataSource(source: 'static' | 'graphql'): void {
    if (source === 'graphql' && environment.enableGraphQL) {
      this.initializeData();
    } else {
      this.resumeDataSignal.set(RESUME_DATA);
      this.dataSource.set('static');
    }
  }
  
  /**
   * Check if GraphQL is available and connected
   */
  isGraphQLConnected(): boolean {
    return this.graphqlService.isConnected();
  }
  
  /**
   * Get GraphQL service for direct access to mutations
   */
  getGraphQLService(): GraphQLService {
    return this.graphqlService;
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