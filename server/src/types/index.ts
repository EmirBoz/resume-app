export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalInfo {
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
}

export interface WorkExperience {
  id: string;
  company: string;
  link: string;
  badges: string[];
  title: string;
  start: string;
  end?: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
}

export interface Project {
  id: string;
  title: string;
  techStack: string[];
  description: string;
  link?: {
    label: string;
    href: string;
  };
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface ResumeData {
  id: string;
  userId: string;
  personalInfo: PersonalInfo;
  work: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  social: SocialLink[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    username: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Context {
  user?: User;
  isAuthenticated: boolean;
}

// Input Types
export interface PersonalInfoInput {
  name?: string;
  initials?: string;
  location?: string;
  locationLink?: string;
  about?: string;
  summary?: string;
  avatarUrl?: string;
  personalWebsiteUrl?: string;
  email?: string;
  tel?: string;
}

export interface WorkExperienceInput {
  id?: string;
  company: string;
  link: string;
  badges: string[];
  title: string;
  start: string;
  end?: string;
  description: string;
}

export interface EducationInput {
  id?: string;
  school: string;
  degree: string;
  start: string;
  end: string;
}

export interface ProjectInput {
  id?: string;
  title: string;
  techStack: string[];
  description: string;
  link?: {
    label: string;
    href: string;
  };
}

export interface SocialLinkInput {
  name: string;
  url: string;
  icon: string;
}