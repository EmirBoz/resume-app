import { Injectable, inject, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { DataService } from './data.service';

// Admin-specific GraphQL operations
const GET_RESUME_DATA = gql`
  query GetResumeData {
    getResumeData {
      id
      userId
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
      education {
        id
        school
        degree
        start
        end
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
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_PERSONAL_INFO = gql`
  mutation UpdatePersonalInfo($input: PersonalInfoInput!) {
    updatePersonalInfo(input: $input) {
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
  }
`;

const UPDATE_WORK_EXPERIENCE = gql`
  mutation UpdateWorkExperience($input: [WorkExperienceInput!]!) {
    updateWorkExperience(input: $input) {
      id
      company
      link
      badges
      title
      start
      end
      description
    }
  }
`;

const UPDATE_EDUCATION = gql`
  mutation UpdateEducation($input: [EducationInput!]!) {
    updateEducation(input: $input) {
      id
      school
      degree
      start
      end
    }
  }
`;

const UPDATE_SKILLS = gql`
  mutation UpdateSkills($input: [String!]!) {
    updateSkills(input: $input)
  }
`;

const UPDATE_PROJECTS = gql`
  mutation UpdateProjects($input: [ProjectInput!]!) {
    updateProjects(input: $input) {
      id
      title
      techStack
      description
      link {
        label
        href
      }
    }
  }
`;

const UPDATE_SOCIAL_LINKS = gql`
  mutation UpdateSocialLinks($input: [SocialLinkInput!]!) {
    updateSocialLinks(input: $input) {
      name
      url
      icon
    }
  }
`;

const EXPORT_DATA = gql`
  mutation ExportData {
    exportData
  }
`;

const IMPORT_DATA = gql`
  mutation ImportData($data: String!) {
    importData(data: $data) {
      id
      userId
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
      education {
        id
        school
        degree
        start
        end
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
      createdAt
      updatedAt
    }
  }
`;

export interface AdminResumeData {
  id: string;
  userId: string;
  personalInfo: {
    name: string;
    initials: string;
    location: string;
    locationLink: string;
    about: string;
    summary: string;
    avatarUrl: string;
    personalWebsiteUrl: string;
    email: string;
    tel: string;
  };
  work: Array<{
    id: string;
    company: string;
    link: string;
    badges: string[];
    title: string;
    start: string;
    end?: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    start: string;
    end: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    title: string;
    techStack: string[];
    description: string;
    link?: {
      label: string;
      href: string;
    };
  }>;
  social: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminGraphQLService {
  private apollo = inject(Apollo);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  
  // Loading states
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  /**
   * Get resume data for admin panel
   */
  getResumeData(): Observable<AdminResumeData | null> {
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required');
    }

    this.isLoading.set(true);
    this.error.set(null);

    return this.apollo.query<{ getResumeData: AdminResumeData }>({
      query: GET_RESUME_DATA,
      fetchPolicy: 'network-only',
      context: {
        headers: this.authService.getAuthHeaders()
      }
    }).pipe(
      map(result => {
        this.isLoading.set(false);
        
        if (result.errors && result.errors.length > 0) {
          this.error.set('Failed to fetch resume data');
          return null;
        }
        
        return result.data?.getResumeData || null;
      }),
      catchError(error => {
        this.isLoading.set(false);
        this.error.set('Failed to connect to server');
        console.error('Get resume data failed:', error);
        return of(null);
      })
    );
  }

  /**
   * Update personal information with refetch
   */
  updatePersonalInfo(input: any): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required');
    }

    this.isLoading.set(true);
    this.error.set(null);

    // Use direct fetch for Vercel compatibility
    return new Observable(observer => {
      this.updatePersonalInfoWithDirectFetch(input)
        .then(async success => {
          this.isLoading.set(false);
          
          if (success) {
            // Trigger data refetch in DataService
            console.log('Personal info updated, triggering data refetch...');
            this.dataService.refreshFromGraphQL();
          }
          
          observer.next(success);
          observer.complete();
        })
        .catch(error => {
          this.isLoading.set(false);
          this.error.set('Failed to update personal info');
          console.error('Update personal info failed:', error);
          observer.next(false);
          observer.complete();
        });
    });
  }

  /**
   * Direct fetch for updatePersonalInfo - Vercel compatibility
   */
  private async updatePersonalInfoWithDirectFetch(input: any): Promise<boolean> {
    try {
      console.log('Attempting direct updatePersonalInfo fetch...');
      
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `
            mutation UpdatePersonalInfo($input: PersonalInfoInput!) {
              updatePersonalInfo(input: $input) {
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
            }
          `,
          variables: { input }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Direct updatePersonalInfo result:', result);

      // Handle Vercel response format
      let graphqlResult;
      if (result.body && result.body.singleResult) {
        graphqlResult = result.body.singleResult;
        console.log('Detected Vercel response format for updatePersonalInfo');
      } else {
        graphqlResult = result;
      }

      if (graphqlResult.errors) {
        console.error('UpdatePersonalInfo GraphQL errors:', graphqlResult.errors);
        throw new Error(graphqlResult.errors[0].message || 'Update failed');
      }

      if (!graphqlResult.data?.updatePersonalInfo) {
        throw new Error('No update data in response');
      }

      console.log('Personal info update successful:', graphqlResult.data.updatePersonalInfo.name);
      return true;
    } catch (error) {
      console.error('Direct updatePersonalInfo fetch failed:', error);
      throw error;
    }
  }

  /**
   * Update work experience with direct fetch
   */
  updateWorkExperience(input: any[]): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required');
    }

    this.isLoading.set(true);
    this.error.set(null);

    return new Observable(observer => {
      this.updateWorkExperienceWithDirectFetch(input)
        .then(success => {
          this.isLoading.set(false);
          
          if (success) {
            console.log('Work experience updated, triggering data refetch...');
            this.dataService.refreshFromGraphQL();
          }
          
          observer.next(success);
          observer.complete();
        })
        .catch(error => {
          this.isLoading.set(false);
          this.error.set('Failed to update work experience');
          console.error('Update work experience failed:', error);
          observer.next(false);
          observer.complete();
        });
    });
  }

  /**
   * Direct fetch for updateWorkExperience - Vercel compatibility
   */
  private async updateWorkExperienceWithDirectFetch(input: any[]): Promise<boolean> {
    try {
      console.log('Attempting direct updateWorkExperience fetch...');
      
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `
            mutation UpdateWorkExperience($workExperience: [WorkExperienceInput!]!) {
              updateWorkExperience(workExperience: $workExperience) {
                id
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
              }
            }
          `,
          variables: { workExperience: input }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Direct updateWorkExperience result:', result);

      // Handle Vercel response format
      let graphqlResult;
      if (result.body && result.body.singleResult) {
        graphqlResult = result.body.singleResult;
        console.log('Detected Vercel response format for updateWorkExperience');
      } else {
        graphqlResult = result;
      }

      if (graphqlResult.errors) {
        console.error('UpdateWorkExperience GraphQL errors:', graphqlResult.errors);
        throw new Error(graphqlResult.errors[0].message || 'Update failed');
      }

      if (!graphqlResult.data?.updateWorkExperience) {
        throw new Error('No update data in response');
      }

      console.log('Work experience update successful');
      return true;
    } catch (error) {
      console.error('Direct updateWorkExperience fetch failed:', error);
      throw error;
    }
  }

  /**
   * Update education with direct fetch
   */
  updateEducation(input: any[]): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required');
    }

    this.isLoading.set(true);
    this.error.set(null);

    return new Observable(observer => {
      this.updateEducationWithDirectFetch(input)
        .then(success => {
          this.isLoading.set(false);
          
          if (success) {
            console.log('Education updated, triggering data refetch...');
            this.dataService.refreshFromGraphQL();
          }
          
          observer.next(success);
          observer.complete();
        })
        .catch(error => {
          this.isLoading.set(false);
          this.error.set('Failed to update education');
          console.error('Update education failed:', error);
          observer.next(false);
          observer.complete();
        });
    });
  }

  /**
   * Direct fetch for updateEducation - Vercel compatibility
   */
  private async updateEducationWithDirectFetch(input: any[]): Promise<boolean> {
    try {
      console.log('Attempting direct updateEducation fetch...');
      
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `
            mutation UpdateEducation($education: [EducationInput!]!) {
              updateEducation(education: $education) {
                id
                education {
                  id
                  school
                  degree
                  start
                  end
                }
              }
            }
          `,
          variables: { education: input }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Direct updateEducation result:', result);

      // Handle Vercel response format
      let graphqlResult;
      if (result.body && result.body.singleResult) {
        graphqlResult = result.body.singleResult;
        console.log('Detected Vercel response format for updateEducation');
      } else {
        graphqlResult = result;
      }

      if (graphqlResult.errors) {
        console.error('UpdateEducation GraphQL errors:', graphqlResult.errors);
        throw new Error(graphqlResult.errors[0].message || 'Update failed');
      }

      if (!graphqlResult.data?.updateEducation) {
        throw new Error('No update data in response');
      }

      console.log('Education update successful');
      return true;
    } catch (error) {
      console.error('Direct updateEducation fetch failed:', error);
      throw error;
    }
  }

  /**
   * Update skills with direct fetch
   */
  updateSkills(input: string[]): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required');
    }

    this.isLoading.set(true);
    this.error.set(null);

    return new Observable(observer => {
      this.updateSkillsWithDirectFetch(input)
        .then(success => {
          this.isLoading.set(false);
          
          if (success) {
            console.log('Skills updated, triggering data refetch...');
            this.dataService.refreshFromGraphQL();
          }
          
          observer.next(success);
          observer.complete();
        })
        .catch(error => {
          this.isLoading.set(false);
          this.error.set('Failed to update skills');
          console.error('Update skills failed:', error);
          observer.next(false);
          observer.complete();
        });
    });
  }

  /**
   * Direct fetch for updateSkills - Vercel compatibility
   */
  private async updateSkillsWithDirectFetch(input: string[]): Promise<boolean> {
    try {
      console.log('Attempting direct updateSkills fetch...');
      
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `
            mutation UpdateSkills($skills: [String!]!) {
              updateSkills(skills: $skills) {
                id
                skills
              }
            }
          `,
          variables: { skills: input }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Direct updateSkills result:', result);

      // Handle Vercel response format
      let graphqlResult;
      if (result.body && result.body.singleResult) {
        graphqlResult = result.body.singleResult;
        console.log('Detected Vercel response format for updateSkills');
      } else {
        graphqlResult = result;
      }

      if (graphqlResult.errors) {
        console.error('UpdateSkills GraphQL errors:', graphqlResult.errors);
        throw new Error(graphqlResult.errors[0].message || 'Update failed');
      }

      if (graphqlResult.data?.updateSkills === undefined) {
        throw new Error('No update data in response');
      }

      console.log('Skills update successful');
      return true;
    } catch (error) {
      console.error('Direct updateSkills fetch failed:', error);
      throw error;
    }
  }

  /**
   * Update projects with direct fetch
   */
  updateProjects(input: any[]): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required');
    }

    this.isLoading.set(true);
    this.error.set(null);

    return new Observable(observer => {
      this.updateProjectsWithDirectFetch(input)
        .then(success => {
          this.isLoading.set(false);
          
          if (success) {
            console.log('Projects updated, triggering data refetch...');
            this.dataService.refreshFromGraphQL();
          }
          
          observer.next(success);
          observer.complete();
        })
        .catch(error => {
          this.isLoading.set(false);
          this.error.set('Failed to update projects');
          console.error('Update projects failed:', error);
          observer.next(false);
          observer.complete();
        });
    });
  }

  /**
   * Direct fetch for updateProjects - Vercel compatibility
   */
  private async updateProjectsWithDirectFetch(input: any[]): Promise<boolean> {
    try {
      console.log('Attempting direct updateProjects fetch...');
      
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `
            mutation UpdateProjects($projects: [ProjectInput!]!) {
              updateProjects(projects: $projects) {
                id
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
              }
            }
          `,
          variables: { projects: input }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Direct updateProjects result:', result);

      // Handle Vercel response format
      let graphqlResult;
      if (result.body && result.body.singleResult) {
        graphqlResult = result.body.singleResult;
        console.log('Detected Vercel response format for updateProjects');
      } else {
        graphqlResult = result;
      }

      if (graphqlResult.errors) {
        console.error('UpdateProjects GraphQL errors:', graphqlResult.errors);
        throw new Error(graphqlResult.errors[0].message || 'Update failed');
      }

      if (!graphqlResult.data?.updateProjects) {
        throw new Error('No update data in response');
      }

      console.log('Projects update successful');
      return true;
    } catch (error) {
      console.error('Direct updateProjects fetch failed:', error);
      throw error;
    }
  }

  /**
   * Update social links with direct fetch
   */
  updateSocialLinks(input: any[]): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required');
    }

    this.isLoading.set(true);
    this.error.set(null);

    return new Observable(observer => {
      this.updateSocialLinksWithDirectFetch(input)
        .then(success => {
          this.isLoading.set(false);
          
          if (success) {
            console.log('Social links updated, triggering data refetch...');
            this.dataService.refreshFromGraphQL();
          }
          
          observer.next(success);
          observer.complete();
        })
        .catch(error => {
          this.isLoading.set(false);
          this.error.set('Failed to update social links');
          console.error('Update social links failed:', error);
          observer.next(false);
          observer.complete();
        });
    });
  }

  /**
   * Direct fetch for updateSocialLinks - Vercel compatibility
   */
  private async updateSocialLinksWithDirectFetch(input: any[]): Promise<boolean> {
    try {
      console.log('Attempting direct updateSocialLinks fetch...');
      
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `
            mutation UpdateSocialLinks($socialLinks: [SocialLinkInput!]!) {
              updateSocialLinks(socialLinks: $socialLinks) {
                id
                social {
                  name
                  url
                  icon
                }
              }
            }
          `,
          variables: { socialLinks: input }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Direct updateSocialLinks result:', result);

      // Handle Vercel response format
      let graphqlResult;
      if (result.body && result.body.singleResult) {
        graphqlResult = result.body.singleResult;
        console.log('Detected Vercel response format for updateSocialLinks');
      } else {
        graphqlResult = result;
      }

      if (graphqlResult.errors) {
        console.error('UpdateSocialLinks GraphQL errors:', graphqlResult.errors);
        throw new Error(graphqlResult.errors[0].message || 'Update failed');
      }

      if (!graphqlResult.data?.updateSocialLinks) {
        throw new Error('No update data in response');
      }

      console.log('Social links update successful');
      return true;
    } catch (error) {
      console.error('Direct updateSocialLinks fetch failed:', error);
      throw error;
    }
  }

  /**
   * Export resume data
   */
  exportData(): Observable<string | null> {
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required');
    }

    this.isLoading.set(true);
    this.error.set(null);

    return this.apollo.mutate<{ exportData: string }>({
      mutation: EXPORT_DATA,
      context: {
        headers: this.authService.getAuthHeaders()
      }
    }).pipe(
      map(result => {
        this.isLoading.set(false);
        
        if (result.errors && result.errors.length > 0) {
          this.error.set('Failed to export data');
          return null;
        }
        
        return result.data?.exportData || null;
      }),
      catchError(error => {
        this.isLoading.set(false);
        this.error.set('Failed to export data');
        console.error('Export data failed:', error);
        return of(null);
      })
    );
  }

  /**
   * Import resume data
   */
  importData(data: string): Observable<AdminResumeData | null> {
    if (!this.authService.isLoggedIn()) {
      throw new Error('Authentication required');
    }

    this.isLoading.set(true);
    this.error.set(null);

    return this.apollo.mutate<{ importData: AdminResumeData }>({
      mutation: IMPORT_DATA,
      variables: { data },
      context: {
        headers: this.authService.getAuthHeaders()
      }
    }).pipe(
      map(result => {
        this.isLoading.set(false);
        
        if (result.errors && result.errors.length > 0) {
          this.error.set('Failed to import data');
          return null;
        }
        
        return result.data?.importData || null;
      }),
      catchError(error => {
        this.isLoading.set(false);
        this.error.set('Failed to import data');
        console.error('Import data failed:', error);
        return of(null);
      })
    );
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.error.set(null);
  }
}