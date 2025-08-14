// Generated GraphQL types
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};

export type Query = {
  __typename?: 'Query';
  me: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  updatePersonalInfo: User;
  addWorkExperience: WorkExperience;
  updateWorkExperience: WorkExperience;
  deleteWorkExperience: Scalars['Boolean'];
  addProject: Project;
  updateProject: Project;
  deleteProject: Scalars['Boolean'];
};

export type MutationUpdatePersonalInfoArgs = {
  input: PersonalInfoInput;
};

export type MutationAddWorkExperienceArgs = {
  input: WorkExperienceInput;
};

export type MutationUpdateWorkExperienceArgs = {
  id: Scalars['ID'];
  input: WorkExperienceInput;
};

export type MutationDeleteWorkExperienceArgs = {
  id: Scalars['ID'];
};

export type MutationAddProjectArgs = {
  input: ProjectInput;
};

export type MutationUpdateProjectArgs = {
  id: Scalars['ID'];
  input: ProjectInput;
};

export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};

export type Subscription = {
  __typename?: 'Subscription';
  resumeUpdated: User;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  initials: Scalars['String'];
  location: Scalars['String'];
  locationLink: Scalars['String'];
  about: Scalars['String'];
  summary: Scalars['String'];
  avatarUrl: Scalars['String'];
  personalWebsiteUrl: Scalars['String'];
  contact: Contact;
  education: Array<Education>;
  work: Array<WorkExperience>;
  skills: Array<Scalars['String']>;
  projects: Array<Project>;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

export type Contact = {
  __typename?: 'Contact';
  email: Scalars['String'];
  tel: Scalars['String'];
  social: Array<SocialLink>;
};

export type SocialLink = {
  __typename?: 'SocialLink';
  name: Scalars['String'];
  url: Scalars['String'];
  icon: IconType;
};

export type Education = {
  __typename?: 'Education';
  id: Scalars['ID'];
  school: Scalars['String'];
  degree: Scalars['String'];
  start: Scalars['String'];
  end: Scalars['String'];
};

export type WorkExperience = {
  __typename?: 'WorkExperience';
  id: Scalars['ID'];
  company: Scalars['String'];
  link: Scalars['String'];
  badges: Array<Scalars['String']>;
  title: Scalars['String'];
  start: Scalars['String'];
  end?: Maybe<Scalars['String']>;
  description: Scalars['String'];
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  title: Scalars['String'];
  techStack: Array<Scalars['String']>;
  description: Scalars['String'];
  link?: Maybe<ProjectLink>;
};

export type ProjectLink = {
  __typename?: 'ProjectLink';
  label: Scalars['String'];
  href: Scalars['String'];
};

export enum IconType {
  Github = 'GITHUB',
  Linkedin = 'LINKEDIN',
  X = 'X',
  Globe = 'GLOBE',
  Mail = 'MAIL',
  Phone = 'PHONE'
}

// Input Types
export type PersonalInfoInput = {
  name?: InputMaybe<Scalars['String']>;
  initials?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<Scalars['String']>;
  locationLink?: InputMaybe<Scalars['String']>;
  about?: InputMaybe<Scalars['String']>;
  summary?: InputMaybe<Scalars['String']>;
  avatarUrl?: InputMaybe<Scalars['String']>;
  personalWebsiteUrl?: InputMaybe<Scalars['String']>;
};

export type WorkExperienceInput = {
  company: Scalars['String'];
  link: Scalars['String'];
  badges: Array<Scalars['String']>;
  title: Scalars['String'];
  start: Scalars['String'];
  end?: InputMaybe<Scalars['String']>;
  description: Scalars['String'];
};

export type ProjectInput = {
  title: Scalars['String'];
  techStack: Array<Scalars['String']>;
  description: Scalars['String'];
  link?: InputMaybe<ProjectLinkInput>;
};

export type ProjectLinkInput = {
  label: Scalars['String'];
  href: Scalars['String'];
};

// Query result types
export type GetResumeQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'User';
    id: string;
    name: string;
    initials: string;
    location: string;
    locationLink: string;
    about: string;
    summary: string;
    avatarUrl: string;
    personalWebsiteUrl: string;
    contact: {
      __typename?: 'Contact';
      email: string;
      tel: string;
      social: Array<{
        __typename?: 'SocialLink';
        name: string;
        url: string;
        icon: IconType;
      }>;
    };
    education: Array<{
      __typename?: 'Education';
      id: string;
      school: string;
      degree: string;
      start: string;
      end: string;
    }>;
    work: Array<{
      __typename?: 'WorkExperience';
      id: string;
      company: string;
      link: string;
      badges: Array<string>;
      title: string;
      start: string;
      end?: string | null;
      description: string;
    }>;
    skills: Array<string>;
    projects: Array<{
      __typename?: 'Project';
      id: string;
      title: string;
      techStack: Array<string>;
      description: string;
      link?: {
        __typename?: 'ProjectLink';
        label: string;
        href: string;
      } | null;
    }>;
  };
};

export type ResumeUpdatedSubscription = {
  __typename?: 'Subscription';
  resumeUpdated: {
    __typename?: 'User';
    id: string;
    name: string;
    about: string;
    work: Array<{
      __typename?: 'WorkExperience';
      id: string;
      company: string;
      title: string;
      start: string;
      end?: string | null;
    }>;
    projects: Array<{
      __typename?: 'Project';
      id: string;
      title: string;
      techStack: Array<string>;
    }>;
  };
};

// Mutation response types
export type UpdatePersonalInfoMutation = {
  __typename?: 'Mutation';
  updatePersonalInfo: {
    __typename?: 'User';
    id: string;
    name: string;
    about: string;
  };
};

export type AddWorkExperienceMutation = {
  __typename?: 'Mutation';
  addWorkExperience: {
    __typename?: 'WorkExperience';
    id: string;
    company: string;
    link: string;
    badges: Array<string>;
    title: string;
    start: string;
    end?: string | null;
    description: string;
  };
};

export type UpdateWorkExperienceMutation = {
  __typename?: 'Mutation';
  updateWorkExperience: {
    __typename?: 'WorkExperience';
    id: string;
    company: string;
    title: string;
  };
};

export type DeleteWorkExperienceMutation = {
  __typename?: 'Mutation';
  deleteWorkExperience: boolean;
};

export type AddProjectMutation = {
  __typename?: 'Mutation';
  addProject: {
    __typename?: 'Project';
    id: string;
    title: string;
    techStack: Array<string>;
    description: string;
    link?: {
      __typename?: 'ProjectLink';
      label: string;
      href: string;
    } | null;
  };
};

export type UpdateProjectMutation = {
  __typename?: 'Mutation';
  updateProject: {
    __typename?: 'Project';
    id: string;
    title: string;
  };
};

export type DeleteProjectMutation = {
  __typename?: 'Mutation';
  deleteProject: boolean;
};