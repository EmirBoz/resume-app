import { gql } from 'apollo-angular';

// Main resume query
export const GET_RESUME = gql`
  query GetResume {
    me {
      id
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
          icon
        }
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
    }
  }
`;

// Subscription for real-time updates
export const RESUME_UPDATED = gql`
  subscription ResumeUpdated {
    resumeUpdated {
      id
      name
      about
      work {
        id
        company
        title
        start
        end
      }
      projects {
        id
        title
        techStack
      }
    }
  }
`;

// Mutations for updating data
export const UPDATE_PERSONAL_INFO = gql`
  mutation UpdatePersonalInfo($input: PersonalInfoInput!) {
    updatePersonalInfo(input: $input) {
      id
      name
      about
      summary
      location
    }
  }
`;

export const ADD_WORK_EXPERIENCE = gql`
  mutation AddWorkExperience($input: WorkExperienceInput!) {
    addWorkExperience(input: $input) {
      id
      company
      title
      start
      end
      description
      badges
    }
  }
`;

export const UPDATE_WORK_EXPERIENCE = gql`
  mutation UpdateWorkExperience($id: ID!, $input: WorkExperienceInput!) {
    updateWorkExperience(id: $id, input: $input) {
      id
      company
      title
      start
      end
      description
      badges
    }
  }
`;

export const DELETE_WORK_EXPERIENCE = gql`
  mutation DeleteWorkExperience($id: ID!) {
    deleteWorkExperience(id: $id)
  }
`;

export const ADD_PROJECT = gql`
  mutation AddProject($input: ProjectInput!) {
    addProject(input: $input) {
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

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: ProjectInput!) {
    updateProject(id: $id, input: $input) {
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

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

// Fragment definitions for reusability
export const PERSONAL_INFO_FRAGMENT = gql`
  fragment PersonalInfo on User {
    id
    name
    initials
    location
    locationLink
    about
    summary
    avatarUrl
    personalWebsiteUrl
  }
`;

export const CONTACT_INFO_FRAGMENT = gql`
  fragment ContactInfo on User {
    contact {
      email
      tel
      social {
        name
        url
        icon
      }
    }
  }
`;

export const WORK_EXPERIENCE_FRAGMENT = gql`
  fragment WorkExperienceInfo on WorkExperience {
    id
    company
    link
    badges
    title
    start
    end
    description
  }
`;

export const PROJECT_FRAGMENT = gql`
  fragment ProjectInfo on Project {
    id
    title
    techStack
    description
    link {
      label
      href
    }
  }
`;