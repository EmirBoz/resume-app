import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Query {
    me: User
    getResumeData: ResumeData!
    health: String!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    updatePersonalInfo(input: PersonalInfoInput!): PersonalInfo!
    updateWorkExperience(input: [WorkExperienceInput!]!): [WorkExperience!]!
    updateEducation(input: [EducationInput!]!): [Education!]!
    updateSkills(input: [String!]!): [String!]!
    updateProjects(input: [ProjectInput!]!): [Project!]!
    updateSocialLinks(input: [SocialLinkInput!]!): [SocialLink!]!
    exportData: String!
    importData(data: String!): ResumeData!
  }

  type Subscription {
    resumeDataUpdated: ResumeData!
  }

  type User {
    id: ID!
    username: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    expiresAt: String!
    user: User!
  }

  type PersonalInfo {
    name: String!
    initials: String!
    location: String!
    locationLink: String!
    about: String!
    summary: String!
    avatarUrl: String!
    personalWebsiteUrl: String!
    email: String!
    tel: String!
  }

  type WorkExperience {
    id: ID!
    company: String!
    link: String!
    badges: [String!]!
    title: String!
    start: String!
    end: String
    description: String!
  }

  type Education {
    id: ID!
    school: String!
    degree: String!
    start: String
    end: String
  }

  type Project {
    id: ID!
    title: String!
    techStack: [String!]!
    description: String!
    link: ProjectLink
  }

  type ProjectLink {
    label: String!
    href: String!
  }

  type SocialLink {
    name: String!
    url: String!
    icon: String!
  }

  type ResumeData {
    id: ID!
    userId: String!
    personalInfo: PersonalInfo!
    work: [WorkExperience!]!
    education: [Education!]!
    skills: [String!]!
    projects: [Project!]!
    social: [SocialLink!]!
    createdAt: String!
    updatedAt: String!
  }

  # Input Types
  input PersonalInfoInput {
    name: String
    initials: String
    location: String
    locationLink: String
    about: String
    summary: String
    avatarUrl: String
    personalWebsiteUrl: String
    email: String
    tel: String
  }

  input WorkExperienceInput {
    id: ID
    company: String!
    link: String!
    badges: [String!]!
    title: String!
    start: String!
    end: String
    description: String!
  }

  input EducationInput {
    id: ID
    school: String!
    degree: String!
    start: String
    end: String
  }

  input ProjectInput {
    id: ID
    title: String!
    techStack: [String!]!
    description: String!
    link: ProjectLinkInput
  }

  input ProjectLinkInput {
    label: String!
    href: String!
  }

  input SocialLinkInput {
    name: String!
    url: String!
    icon: String!
  }
`;