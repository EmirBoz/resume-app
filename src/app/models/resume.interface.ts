export type IconType = 'github' | 'linkedin' | 'x' | 'globe' | 'mail' | 'phone';

export interface SocialLink {
  name: string;
  url: string;
  icon: IconType;
}

export interface ContactInfo {
  email: string;
  tel: string;
  social: SocialLink[];
}

export interface Education {
  school: string;
  degree: string;
  start: string;
  end: string;
}

export interface WorkExperience {
  company: string;
  link: string;
  badges: string[];
  title: string;
  start: string;
  end: string | null;
  description: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  title: string;
  techStack: string[];
  description: string;
  link?: ProjectLink;
}

export interface ResumeData {
  name: string;
  initials: string;
  location: string;
  locationLink: string;
  about: string;
  summary: string;
  avatarUrl: string;
  personalWebsiteUrl: string;
  contact: ContactInfo;
  education: Education[];
  work: WorkExperience[];
  skills: string[];
  projects: Project[];
}

// GraphQL compatible types
export interface GraphQLSocial {
  name: string;
  url: string;
}

export interface GraphQLContact {
  email: string;
  tel: string;
  social: GraphQLSocial[];
}

export interface GraphQLEducation {
  school: string;
  degree: string;
  start: string;
  end: string;
}

export interface GraphQLWork {
  company: string;
  link: string;
  badges: string[];
  title: string;
  start: string;
  end: string;
  description: string;
}

export interface GraphQLProject {
  title: string;
  techStack: string[];
  description: string;
  link?: ProjectLink;
}

export interface GraphQLResumeData {
  name: string;
  initials: string;
  location: string;
  locationLink: string;
  about: string;
  summary: string;
  avatarUrl: string;
  personalWebsiteUrl: string;
  contact: GraphQLContact;
  education: GraphQLEducation[];
  work: GraphQLWork[];
  skills: string[];
  projects: GraphQLProject[];
}