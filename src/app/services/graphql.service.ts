import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { GraphQLResumeData, ResumeData } from '../models/resume.interface';

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

interface GraphQLMeResponse {
  me: GraphQLResumeData;
}

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {
  private httpClient = inject(HttpClient);
  private readonly graphqlEndpoint = '/graphql';

  /**
   * Get resume data from GraphQL endpoint
   */
  getResumeData(): Observable<ResumeData | null> {
    const query = `
      query GetResume {
        me {
          name
          initials
          location
          locationLink
          about
          summary
          avatarUrl
          personalWebsiteUrl
          contact {
            email
            tel
            social {
              name
              url
            }
          }
          education {
            school
            degree
            start
            end
          }
          work {
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
    `;

    return this.httpClient.post<GraphQLResponse<GraphQLMeResponse>>(
      this.graphqlEndpoint,
      { query }
    ).pipe(
      map(response => {
        if (response.errors && response.errors.length > 0) {
          console.error('GraphQL errors:', response.errors);
          return null;
        }
        return this.transformGraphQLToResumeData(response.data.me);
      }),
      catchError(error => {
        console.error('GraphQL request failed:', error);
        return of(null);
      })
    );
  }

  /**
   * Transform GraphQL response to ResumeData format
   */
  private transformGraphQLToResumeData(graphqlData: GraphQLResumeData): ResumeData {
    return {
      name: graphqlData.name,
      initials: graphqlData.initials,
      location: graphqlData.location,
      locationLink: graphqlData.locationLink,
      about: graphqlData.about,
      summary: graphqlData.summary,
      avatarUrl: graphqlData.avatarUrl,
      personalWebsiteUrl: graphqlData.personalWebsiteUrl,
      contact: {
        email: graphqlData.contact.email,
        tel: graphqlData.contact.tel,
        social: graphqlData.contact.social.map(social => ({
          name: social.name,
          url: social.url,
          icon: this.mapSocialNameToIcon(social.name),
        })),
      },
      education: graphqlData.education,
      work: graphqlData.work.map(work => ({
        ...work,
        end: work.end === 'Present' ? null : work.end,
      })),
      skills: graphqlData.skills,
      projects: graphqlData.projects,
    };
  }

  /**
   * Map social media name to icon type
   */
  private mapSocialNameToIcon(name: string): 'github' | 'linkedin' | 'x' | 'globe' | 'mail' | 'phone' {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('github')) return 'github';
    if (lowerName.includes('linkedin')) return 'linkedin';
    if (lowerName.includes('x') || lowerName.includes('twitter')) return 'x';
    return 'globe';
  }

  /**
   * Execute custom GraphQL query
   */
  executeQuery<T>(query: string, variables?: Record<string, any>): Observable<T | null> {
    return this.httpClient.post<GraphQLResponse<T>>(
      this.graphqlEndpoint,
      { query, variables }
    ).pipe(
      map(response => {
        if (response.errors && response.errors.length > 0) {
          console.error('GraphQL errors:', response.errors);
          return null;
        }
        return response.data;
      }),
      catchError(error => {
        console.error('GraphQL request failed:', error);
        return of(null);
      })
    );
  }
}