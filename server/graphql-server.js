const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const { buildSchema } = require('graphql');
const cors = require('cors');

// GraphQL Schema
const schema = buildSchema(`
  type Query {
    me: User!
  }

  type Mutation {
    updatePersonalInfo(input: PersonalInfoInput!): User!
    addWorkExperience(input: WorkExperienceInput!): WorkExperience!
    updateWorkExperience(id: ID!, input: WorkExperienceInput!): WorkExperience!
    deleteWorkExperience(id: ID!): Boolean!
    addProject(input: ProjectInput!): Project!
    updateProject(id: ID!, input: ProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
  }

  type Subscription {
    resumeUpdated: User!
  }

  type User {
    id: ID!
    name: String!
    initials: String!
    location: String!
    locationLink: String!
    about: String!
    summary: String!
    avatarUrl: String!
    personalWebsiteUrl: String!
    contact: Contact!
    education: [Education!]!
    work: [WorkExperience!]!
    skills: [String!]!
    projects: [Project!]!
    createdAt: String!
    updatedAt: String!
  }

  type Contact {
    email: String!
    tel: String!
    social: [SocialLink!]!
  }

  type SocialLink {
    name: String!
    url: String!
    icon: IconType!
  }

  type Education {
    id: ID!
    school: String!
    degree: String!
    start: String!
    end: String!
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

  enum IconType {
    GITHUB
    LINKEDIN
    X
    GLOBE
    MAIL
    PHONE
  }

  input PersonalInfoInput {
    name: String
    initials: String
    location: String
    locationLink: String
    about: String
    summary: String
    avatarUrl: String
    personalWebsiteUrl: String
  }

  input WorkExperienceInput {
    company: String!
    link: String!
    badges: [String!]!
    title: String!
    start: String!
    end: String
    description: String!
  }

  input ProjectInput {
    title: String!
    techStack: [String!]!
    description: String!
    link: ProjectLinkInput
  }

  input ProjectLinkInput {
    label: String!
    href: String!
  }
`);

// Mock Data
let mockUser = {
  id: '1',
  name: 'Emir Boz',
  initials: 'EB',
  location: 'İstanbul, Turkey',
  locationLink: 'https://www.google.com/maps/place/İstanbul',
  about: 'Detail-oriented Full Stack Engineer\ndedicated to building high-quality products.',
  summary: 'As a passionate Frontend Developer with 3 years of experience, I specialize in building scalable, efficient, and user-friendly web applications.\n\nMy expertise lies in TypeScript, Angular, React,\nand I am also expanding my backend knowledge with Java Spring Boot,\nNodejs to become a more versatile developer.',
  avatarUrl: '/profile.jpeg',
  personalWebsiteUrl: 'null',
  contact: {
    email: 'emirrbozz@gmail.com',
    tel: '+90 505 411 14 80',
    social: [
      {
        name: 'GitHub',
        url: 'https://github.com/EmirBoz',
        icon: 'GITHUB',
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/emir-boz/',
        icon: 'LINKEDIN',
      },
    ],
  },
  education: [
    {
      id: '1',
      school: 'Gebze Technical University',
      degree: "Bachelor's Degree in Electronics Engineering",
      start: '2018',
      end: '2022',
    },
  ],
  work: [
    {
      id: '1',
      company: 'Vodafone via Pia',
      link: 'https://vodafone.com.tr',
      badges: ['Hybrid', 'Angular', 'Angular Material', 'TypeScript', 'Agile'],
      title: 'Software Developer | Vodafone Next',
      start: '2022/03',
      end: null,
      description: 'As a Frontend Developer, I contributed to Vodafone Next, a project that enables customers to manage their internet service products, including purchasing, cancellation, transfer, and package changes.',
    },
    {
      id: '2',
      company: 'Turk Telecom',
      link: 'https://www.turktelekom.com.tr',
      badges: ['On Site', 'C/C++'],
      title: 'Intern Engineer',
      start: '2019/06',
      end: '2019/09',
      description: 'I completed an internship in the Network Management Systems department at Türk Telekom.',
    },
  ],
  skills: [
    'Angular/ Angular Material',
    'React/ Next.js',
    'TypeScript',
    'Tailwind CSS',
    'Design Systems',
    'Node.js',
    'Git',
    'Jira',
    'Scss',
  ],
  projects: [
    {
      id: '1',
      title: 'E-Commerce Platform',
      techStack: ['Angular', 'NestJS', 'PostgreSQL', 'Stripe', 'Docker'],
      description: 'Full-featured e-commerce platform\nwith payment integration, inventory management,\nand admin dashboard.',
      link: {
        label: 'ecommerce-demo.com',
        href: 'https://ecommerce-demo.com/',
      },
    },
    {
      id: '2',
      title: 'Task Management App',
      techStack: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'Tailwind CSS'],
      description: 'Real-time collaborative task management application\nwith drag-and-drop functionality.',
      link: {
        label: 'taskmanager-app.com',
        href: 'https://taskmanager-app.com/',
      },
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Resolvers
const root = {
  me: () => mockUser,
  
  updatePersonalInfo: ({ input }) => {
    mockUser = { ...mockUser, ...input, updatedAt: new Date().toISOString() };
    return mockUser;
  },
  
  addWorkExperience: ({ input }) => {
    const newWork = {
      id: String(mockUser.work.length + 1),
      ...input,
    };
    mockUser.work.unshift(newWork);
    mockUser.updatedAt = new Date().toISOString();
    return newWork;
  },
  
  updateWorkExperience: ({ id, input }) => {
    const workIndex = mockUser.work.findIndex(w => w.id === id);
    if (workIndex === -1) throw new Error('Work experience not found');
    
    mockUser.work[workIndex] = { ...mockUser.work[workIndex], ...input };
    mockUser.updatedAt = new Date().toISOString();
    return mockUser.work[workIndex];
  },
  
  deleteWorkExperience: ({ id }) => {
    const workIndex = mockUser.work.findIndex(w => w.id === id);
    if (workIndex === -1) return false;
    
    mockUser.work.splice(workIndex, 1);
    mockUser.updatedAt = new Date().toISOString();
    return true;
  },
  
  addProject: ({ input }) => {
    const newProject = {
      id: String(mockUser.projects.length + 1),
      ...input,
    };
    mockUser.projects.unshift(newProject);
    mockUser.updatedAt = new Date().toISOString();
    return newProject;
  },
  
  updateProject: ({ id, input }) => {
    const projectIndex = mockUser.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) throw new Error('Project not found');
    
    mockUser.projects[projectIndex] = { ...mockUser.projects[projectIndex], ...input };
    mockUser.updatedAt = new Date().toISOString();
    return mockUser.projects[projectIndex];
  },
  
  deleteProject: ({ id }) => {
    const projectIndex = mockUser.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return false;
    
    mockUser.projects.splice(projectIndex, 1);
    mockUser.updatedAt = new Date().toISOString();
    return true;
  },
};

// Express App
const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true
}));

// GraphQL endpoint
app.all('/graphql', createHandler({
  schema: schema,
  rootValue: root,
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 GraphQL Server running at http://localhost:${PORT}/graphql`);
  console.log(`📊 GraphiQL interface available at http://localhost:${PORT}/graphql`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health`);
});

module.exports = app;