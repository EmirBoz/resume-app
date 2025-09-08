import { Injectable, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map, catchError, of, BehaviorSubject, from, switchMap } from 'rxjs';
import { ApolloQueryResult, FetchResult, WatchQueryFetchPolicy } from '@apollo/client/core';
import { ResumeData, WorkExperience, Project } from '../models/resume.interface';
import { IconType as FrontendIconType } from '../models/resume.interface';
import { 
  GET_RESUME, 
  RESUME_UPDATED, 
  UPDATE_PERSONAL_INFO,
  ADD_WORK_EXPERIENCE,
  UPDATE_WORK_EXPERIENCE,
  DELETE_WORK_EXPERIENCE,
  ADD_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT
} from '../graphql/queries';
import { 
  GetResumeQuery, 
  ResumeUpdatedSubscription,
  PersonalInfoInput,
  WorkExperienceInput,
  ProjectInput,
  IconType,
  UpdatePersonalInfoMutation,
  AddWorkExperienceMutation,
  UpdateWorkExperienceMutation,
  DeleteWorkExperienceMutation,
  AddProjectMutation,
  UpdateProjectMutation,
  DeleteProjectMutation
} from '../graphql/types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {
  private apollo = inject(Apollo);
  
  // Loading states
  isLoading = signal<boolean>(false);
  isSubscribed = signal<boolean>(false);
  
  // Error handling
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();
  
  // Connection status
  isConnected = signal<boolean>(false);

  /**
   * Get resume data from GraphQL endpoint with Apollo Client
   */
  getResumeData(): Observable<ResumeData | null> {
    if (!environment.enableGraphQL) {
      return of(null);
    }

    this.isLoading.set(true);
    this.clearError();

    console.log('Starting GraphQL query with:', {
      query: GET_RESUME.loc?.source?.body || 'Query source not available',
      endpoint: environment.graphqlEndpoint
    });

    // Apollo Client bypass - direkt fetch kullan
    return from(this.fetchGraphQLDirectly()).pipe(
      switchMap((directResult) => {
        if (directResult) {
          console.log('Direct fetch successful, using that data');
          return of(directResult);
        }
        
        // Apollo Client fallback
        console.log('Trying Apollo Client as backup...');
        return this.apollo.watchQuery<GetResumeQuery>({
          query: GET_RESUME,
          fetchPolicy: 'no-cache' as WatchQueryFetchPolicy,
          errorPolicy: 'all',
          notifyOnNetworkStatusChange: true
        }).valueChanges.pipe(
          map((result: ApolloQueryResult<GetResumeQuery>) => {
            this.isLoading.set(false);
            
            console.log('Apollo Client Result:', {
              data: result.data,
              errors: result.errors,
              loading: result.loading,
              networkStatus: result.networkStatus
            });
            
            if (result.errors && result.errors.length > 0) {
              console.error('GraphQL errors:', result.errors);
              this.setError('GraphQL query failed: ' + result.errors[0].message);
              if (result.data?.getResumeData) {
                this.isConnected.set(true);
                console.log('Data found despite errors, transforming...');
                return this.transformGraphQLToResumeData(result.data.getResumeData);
              }
              return null;
            }

            if (result.data?.getResumeData) {
              this.isConnected.set(true);
              console.log('Raw GraphQL data:', result.data.getResumeData);
              const transformedData = this.transformGraphQLToResumeData(result.data.getResumeData);
              console.log('GraphQL data successfully transformed:', transformedData?.name);
              return transformedData;
            }

            console.log('No data received from GraphQL - result.data:', result.data);
            return null;
          })
        );
      }),
      catchError(error => {
        console.error('GraphQL request failed:', error);
        this.isLoading.set(false);
        this.isConnected.set(false);
        this.setError('Failed to connect to GraphQL server');
        return of(null);
      })
    );
  }

  /**
   * Direct GraphQL fetch bypass Apollo Client
   */
  private async fetchGraphQLDirectly(): Promise<ResumeData | null> {
    try {
      console.log('Attempting direct GraphQL fetch to:', environment.graphqlEndpoint);
      
      // Production endpoint için tam URL oluştur
      const endpoint = environment.production && !environment.graphqlEndpoint.startsWith('http')
        ? window.location.origin + environment.graphqlEndpoint
        : environment.graphqlEndpoint;
        
      console.log('Resolved endpoint URL:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_RESUME.loc?.source?.body || `
            query GetResume {
              getResumeData {
                id
                personalInfo {
                  name
                  initials
                  location
                  locationLink
                  about
                  summary
                  avatarUrl
                  personalWebsiteUrl
                  email
                  tel
                }
                education {
                  id
                  school
                  degree
                  start
                  end
                }
                work {
                  id
                  company
                  link
                  badges
                  title
                  start
                  end
                  description
                }
                skills
                projects {
                  id
                  title
                  techStack
                  description
                  link {
                    label
                    href
                  }
                }
                social {
                  name
                  url
                  icon
                }
              }
            }
          `
        }),
      });

      console.log('Direct fetch response status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('Direct fetch HTTP error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        return null;
      }

      const result = await response.json();
      console.log('Direct fetch raw result:', result);

      // Vercel GraphQL response format handling (from memory)
      let graphqlResult;
      if (result.body && result.body.singleResult) {
        // Vercel wrapper format: { body: { singleResult: { data: ... } } }
        graphqlResult = result.body.singleResult;
        console.log('Detected Vercel response format, extracting data from singleResult...');
      } else {
        // Standard GraphQL format
        graphqlResult = result;
        console.log('Using standard GraphQL response format');
      }

      if (graphqlResult.errors) {
        console.error('Direct fetch GraphQL errors:', graphqlResult.errors);
        return null;
      }

      if (graphqlResult.data?.getResumeData) {
        this.isLoading.set(false);
        this.isConnected.set(true);
        console.log('Direct fetch successful, transforming data:', graphqlResult.data.getResumeData.personalInfo?.name);
        return this.transformGraphQLToResumeData(graphqlResult.data.getResumeData);
      }

      console.log('Direct fetch: No data in response, graphqlResult.data:', graphqlResult.data);
      return null;
    } catch (error) {
      console.error('Direct fetch failed with error:', error);
      return null;
    }
  }

  /**
   * Transform GraphQL response to ResumeData format
   */
  private transformGraphQLToResumeData(graphqlData: GetResumeQuery['getResumeData']): ResumeData {
    return {
      name: graphqlData.personalInfo.name,
      initials: graphqlData.personalInfo.initials,
      location: graphqlData.personalInfo.location,
      locationLink: graphqlData.personalInfo.locationLink,
      about: graphqlData.personalInfo.about,
      summary: graphqlData.personalInfo.summary,
      avatarUrl: graphqlData.personalInfo.avatarUrl,
      personalWebsiteUrl: graphqlData.personalInfo.personalWebsiteUrl,
      contact: {
        email: graphqlData.personalInfo.email,
        tel: graphqlData.personalInfo.tel,
        social: graphqlData.social.map(social => ({
          name: social.name,
          url: social.url,
          icon: this.mapBackendIconToFrontend(social.icon),
        })),
      },
      education: graphqlData.education.map(edu => ({
        school: edu.school,
        degree: edu.degree,
        start: edu.start,
        end: edu.end,
      })),
      work: graphqlData.work.map(work => ({
        company: work.company,
        link: work.link,
        badges: work.badges,
        title: work.title,
        start: work.start,
        end: work.end === 'Present' ? null : (work.end || null),
        description: work.description,
      })),
      skills: graphqlData.skills,
      projects: graphqlData.projects.map(project => ({
        title: project.title,
        techStack: project.techStack,
        description: project.description,
        link: project.link ? {
          label: project.link.label,
          href: project.link.href,
        } : undefined,
      })),
    };
  }

  /**
   * Map backend icon format to frontend format
   */
  private mapBackendIconToFrontend(backendIcon: string): FrontendIconType {
    const iconMapping: Record<string, FrontendIconType> = {
      'GITHUB': 'github',
      'github': 'github',
      'LINKEDIN': 'linkedin',
      'linkedin': 'linkedin',
      'X': 'x',
      'x': 'x',
      'TWITTER': 'x',
      'twitter': 'x',
      'GLOBE': 'globe',
      'globe': 'globe',
      'WEBSITE': 'globe',
      'website': 'globe',
      'MAIL': 'mail',
      'mail': 'mail',
      'EMAIL': 'mail',
      'email': 'mail',
      'PHONE': 'phone',
      'phone': 'phone',
      'TEL': 'phone',
      'tel': 'phone'
    };
    
    return iconMapping[backendIcon] || 'globe';
  }

  /**
   * Map GraphQL IconType enum to string
   */
  private mapIconTypeToString(iconType: IconType): 'github' | 'linkedin' | 'x' | 'globe' | 'mail' | 'phone' {
    switch (iconType) {
      case IconType.Github:
        return 'github';
      case IconType.Linkedin:
        return 'linkedin';
      case IconType.X:
        return 'x';
      case IconType.Mail:
        return 'mail';
      case IconType.Phone:
        return 'phone';
      case IconType.Globe:
      default:
        return 'globe';
    }
  }

  /**
   * Subscribe to real-time resume updates
   */
  subscribeToResumeUpdates(): Observable<ResumeUpdatedSubscription['resumeUpdated'] | null> {
    if (!environment.enableGraphQL) {
      return of(null);
    }

    this.isSubscribed.set(true);

    return this.apollo.subscribe<ResumeUpdatedSubscription>({
      query: RESUME_UPDATED,
      errorPolicy: 'all'
    }).pipe(
      map(result => {
        if (result.errors && result.errors.length > 0) {
          console.error('GraphQL subscription errors:', result.errors);
          return null;
        }
        return result.data?.resumeUpdated || null;
      }),
      catchError(error => {
        console.error('GraphQL subscription failed:', error);
        this.isSubscribed.set(false);
        return of(null);
      })
    );
  }

  /**
   * Update personal information
   */
  updatePersonalInfo(input: PersonalInfoInput): Observable<boolean> {
    return this.apollo.mutate<UpdatePersonalInfoMutation>({
      mutation: UPDATE_PERSONAL_INFO,
      variables: { input },
      refetchQueries: [{ query: GET_RESUME }]
    }).pipe(
      map((result) => {
        if (result.errors && result.errors.length > 0) {
          console.error('Update personal info failed:', result.errors);
          this.setError('Failed to update personal information');
          return false;
        }
        return !!result.data?.updatePersonalInfo;
      }),
      catchError(error => {
        console.error('Update personal info mutation failed:', error);
        this.setError('Failed to update personal information');
        return of(false);
      })
    );
  }

  /**
   * Add new work experience
   */
  addWorkExperience(input: WorkExperienceInput): Observable<WorkExperience | null> {
    return this.apollo.mutate<AddWorkExperienceMutation>({
      mutation: ADD_WORK_EXPERIENCE,
      variables: { input },
      refetchQueries: [{ query: GET_RESUME }]
    }).pipe(
      map((result) => {
        if (result.errors && result.errors.length > 0) {
          console.error('Add work experience failed:', result.errors);
          this.setError('Failed to add work experience');
          return null;
        }
        
        const workData = result.data?.addWorkExperience;
        if (!workData) return null;
        
        // Transform GraphQL response to WorkExperience interface
        return {
          company: workData.company,
          link: workData.link,
          badges: workData.badges,
          title: workData.title,
          start: workData.start,
          end: workData.end === 'Present' ? null : (workData.end || null),
          description: workData.description,
        };
      }),
      catchError(error => {
        console.error('Add work experience mutation failed:', error);
        this.setError('Failed to add work experience');
        return of(null);
      })
    );
  }

  /**
   * Update work experience
   */
  updateWorkExperience(id: string, input: WorkExperienceInput): Observable<boolean> {
    return this.apollo.mutate<UpdateWorkExperienceMutation>({
      mutation: UPDATE_WORK_EXPERIENCE,
      variables: { id, input },
      refetchQueries: [{ query: GET_RESUME }]
    }).pipe(
      map((result) => {
        if (result.errors && result.errors.length > 0) {
          console.error('Update work experience failed:', result.errors);
          this.setError('Failed to update work experience');
          return false;
        }
        return !!result.data?.updateWorkExperience;
      }),
      catchError(error => {
        console.error('Update work experience mutation failed:', error);
        this.setError('Failed to update work experience');
        return of(false);
      })
    );
  }

  /**
   * Delete work experience
   */
  deleteWorkExperience(id: string): Observable<boolean> {
    return this.apollo.mutate<DeleteWorkExperienceMutation>({
      mutation: DELETE_WORK_EXPERIENCE,
      variables: { id },
      refetchQueries: [{ query: GET_RESUME }]
    }).pipe(
      map((result) => {
        if (result.errors && result.errors.length > 0) {
          console.error('Delete work experience failed:', result.errors);
          this.setError('Failed to delete work experience');
          return false;
        }
        return !!result.data?.deleteWorkExperience;
      }),
      catchError(error => {
        console.error('Delete work experience mutation failed:', error);
        this.setError('Failed to delete work experience');
        return of(false);
      })
    );
  }

  /**
   * Add new project
   */
  addProject(input: ProjectInput): Observable<Project | null> {
    return this.apollo.mutate<AddProjectMutation>({
      mutation: ADD_PROJECT,
      variables: { input },
      refetchQueries: [{ query: GET_RESUME }]
    }).pipe(
      map((result) => {
        if (result.errors && result.errors.length > 0) {
          console.error('Add project failed:', result.errors);
          this.setError('Failed to add project');
          return null;
        }
        
        const projectData = result.data?.addProject;
        if (!projectData) return null;
        
        // Transform GraphQL response to Project interface
        return {
          title: projectData.title,
          techStack: projectData.techStack,
          description: projectData.description,
          link: projectData.link ? {
            label: projectData.link.label,
            href: projectData.link.href,
          } : undefined,
        };
      }),
      catchError(error => {
        console.error('Add project mutation failed:', error);
        this.setError('Failed to add project');
        return of(null);
      })
    );
  }

  /**
   * Update project
   */
  updateProject(id: string, input: ProjectInput): Observable<boolean> {
    return this.apollo.mutate<UpdateProjectMutation>({
      mutation: UPDATE_PROJECT,
      variables: { id, input },
      refetchQueries: [{ query: GET_RESUME }]
    }).pipe(
      map((result) => {
        if (result.errors && result.errors.length > 0) {
          console.error('Update project failed:', result.errors);
          this.setError('Failed to update project');
          return false;
        }
        return !!result.data?.updateProject;
      }),
      catchError(error => {
        console.error('Update project mutation failed:', error);
        this.setError('Failed to update project');
        return of(false);
      })
    );
  }

  /**
   * Delete project
   */
  deleteProject(id: string): Observable<boolean> {
    return this.apollo.mutate<DeleteProjectMutation>({
      mutation: DELETE_PROJECT,
      variables: { id },
      refetchQueries: [{ query: GET_RESUME }]
    }).pipe(
      map((result) => {
        if (result.errors && result.errors.length > 0) {
          console.error('Delete project failed:', result.errors);
          this.setError('Failed to delete project');
          return false;
        }
        return !!result.data?.deleteProject;
      }),
      catchError(error => {
        console.error('Delete project mutation failed:', error);
        this.setError('Failed to delete project');
        return of(false);
      })
    );
  }

  /**
   * Clear cache and refetch data
   */
  refetchData(): Observable<ResumeData | null> {
    return from(
      this.apollo.client.refetchQueries({
        include: [GET_RESUME]
      })
    ).pipe(
      switchMap(() => this.getResumeData()),
      catchError(error => {
        console.error('Refetch failed:', error);
        this.setError('Failed to refresh data');
        return of(null);
      })
    );
  }

  /**
   * Clear Apollo cache
   */
  clearCache(): void {
    this.apollo.client.clearStore().catch(error => {
      console.error('Clear cache failed:', error);
    });
  }

  /**
   * Check GraphQL server health
   */
  checkServerHealth(): Observable<boolean> {
    return this.apollo.query({
      query: GET_RESUME,
      fetchPolicy: 'network-only',
      errorPolicy: 'none'
    }).pipe(
      map(() => {
        this.isConnected.set(true);
        return true;
      }),
      catchError(() => {
        this.isConnected.set(false);
        return of(false);
      })
    );
  }

  /**
   * Error handling utilities
   */
  private setError(message: string): void {
    this.errorSubject.next(message);
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Get current error
   */
  getCurrentError(): string | null {
    return this.errorSubject.value;
  }
}
