const { ApolloServer } = require('@apollo/server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MongoDB connection with proper async handling
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cv-development', {
      maxPoolSize: 1, // Maintain up to 1 socket connection
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    });
    isConnected = true;
    console.log('MongoDB connected successfully');
    
    // Seed default data if database is empty
    await seedDefaultData();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Default sample data for seeding
const defaultResumeData = {
  personalInfo: {
    name: 'Emir Boz',
    initials: 'EB',
    title: 'Frontend Developer',
    location: 'İstanbul, Turkey',
    locationLink: 'https://www.google.com/maps/place/İstanbul',
    about: 'A proactive Frontend Developer with 3+ years of experience in building scalable and user-friendly web applications. Passionate about continuous learning and exploring modern technologies to deliver high-quality solutions.',
    summary: 'I specialize in creating scalable and user-friendly applications using TypeScript and Angular. While my primary focus is frontend, I continuously explore other technologies such as React, Java Spring Boot, and .NET to become a more versatile engineer.',
    avatarUrl: '/profile.jpeg',
    personalWebsiteUrl: 'https://emirboz.dev',
    email: 'emirrbozz@gmail.com',
    tel: '+90 505 411 14 80',
    phone: '+90 505 411 14 80'
  },
  workExperience: [
    {
      id: '1',
      company: 'Vodafone',
      link: 'https://vodafone.com.tr',
      badges: ['Hybrid', 'Angular', 'TypeScript'],
      title: 'Software Developer',
      position: 'Software Developer',
      start: '2022/03',
      startDate: '2022/03',
      end: null,
      endDate: null,
      description: 'Developing modern web applications using Angular and TypeScript.',
      current: true
    }
  ],
  education: [
    {
      id: '1',
      institution: 'University Example',
      school: 'University Example',
      degree: 'Computer Science',
      field: 'Computer Science',
      start: '2018',
      startDate: '2018',
      end: '2022',
      endDate: '2022',
      current: false
    }
  ],
  skills: [
    { name: 'TypeScript', level: 'Advanced', category: 'Frontend' },
    { name: 'Angular', level: 'Advanced', category: 'Frontend' },
    { name: 'React', level: 'Intermediate', category: 'Frontend' },
    { name: 'Node.js', level: 'Intermediate', category: 'Backend' },
    { name: 'MongoDB', level: 'Intermediate', category: 'Database' }
  ],
  projects: [
    {
      id: '1',
      name: 'Resume Application',
      title: 'Resume Application',
      description: 'A modern resume application built with Angular and GraphQL.',
      technologies: ['Angular', 'GraphQL', 'TypeScript'],
      techStack: ['Angular', 'GraphQL', 'TypeScript'],
      url: 'https://example.com',
      github: 'https://github.com/EmirBoz',
      link: {
        label: 'View Project',
        href: 'https://example.com'
      }
    }
  ],
  socialLinks: [
    {
      name: 'GitHub',
      platform: 'GitHub',
      url: 'https://github.com/EmirBoz',
      username: 'EmirBoz',
      icon: 'github'
    },
    {
      name: 'LinkedIn',
      platform: 'LinkedIn',
      url: 'https://www.linkedin.com/in/emir-boz/',
      username: 'emir-boz',
      icon: 'linkedin'
    }
  ]
};

// Function to seed default data
const seedDefaultData = async () => {
  try {
    console.log('Checking for existing resume data...');
    const existingData = await ResumeData.findOne();
    if (!existingData) {
      console.log('No resume data found, creating default data...');
      const newResumeData = new ResumeData(defaultResumeData);
      const savedData = await newResumeData.save();
      console.log('Default resume data created successfully with ID:', savedData._id);
    } else {
      console.log('Existing resume data found with ID:', existingData._id);
    }
  } catch (error) {
    console.error('Error seeding default data:', error);
    // Don't throw error, just log it - seeding is optional
  }
};

// MongoDB Schema definitions
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  role: { type: String, default: 'user' }
}, {
  timestamps: true // createdAt ve updatedAt otomatik eklenir
});

const resumeDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  personalInfo: {
    name: String,
    initials: String,
    title: String,
    email: String,
    phone: String,
    tel: String,
    location: String,
    locationLink: String,
    website: String,
    personalWebsiteUrl: String,
    linkedin: String,
    github: String,
    about: String,
    summary: String,
    avatarUrl: String
  },
  summary: String,
  workExperience: [{
    id: String,
    company: String,
    link: String,
    badges: [String],
    title: String,
    position: String,
    start: String,
    startDate: String,
    end: String,
    endDate: String,
    description: String,
    current: Boolean
  }],
  education: [{
    id: String,
    institution: String,
    school: String,
    degree: String,
    field: String,
    start: String,
    startDate: String,
    end: String,
    endDate: String,
    current: Boolean
  }],
  skills: [{
    name: String,
    level: String,
    category: String
  }],
  projects: [{
    id: String,
    name: String,
    title: String,
    description: String,
    technologies: [String],
    techStack: [String],
    url: String,
    github: String,
    link: {
      label: String,
      href: String
    },
    startDate: String,
    endDate: String
  }],
  socialLinks: [{
    name: String,
    platform: String,
    url: String,
    username: String,
    icon: String
  }]
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const ResumeData = mongoose.models.ResumeData || mongoose.model('ResumeData', resumeDataSchema);

// GraphQL Type Definitions (inline string)
const typeDefs = `
  type PersonalInfo {
    name: String
    initials: String
    title: String
    email: String
    phone: String
    tel: String
    location: String
    locationLink: String
    website: String
    personalWebsiteUrl: String
    linkedin: String
    github: String
    about: String
    summary: String
    avatarUrl: String
  }

  type WorkExperience {
    id: String
    company: String
    link: String
    badges: [String]
    title: String
    position: String
    start: String
    startDate: String
    end: String
    endDate: String
    description: String
    current: Boolean
  }

  type Education {
    id: String
    institution: String
    school: String
    degree: String
    field: String
    start: String
    startDate: String
    end: String
    endDate: String
    current: Boolean
  }

  type Skill {
    name: String
    level: String
    category: String
  }

  type ProjectLink {
    label: String
    href: String
  }

  type Project {
    id: String
    name: String
    title: String
    description: String
    technologies: [String]
    techStack: [String]
    url: String
    github: String
    link: ProjectLink
    startDate: String
    endDate: String
  }

  type SocialLink {
    name: String
    platform: String
    url: String
    username: String
    icon: String
  }

  type ResumeData {
    id: ID!
    personalInfo: PersonalInfo
    summary: String
    workExperience: [WorkExperience]
    work: [WorkExperience]
    education: [Education]
    skills: [String]  # Changed to simple string array
    projects: [Project]
    socialLinks: [SocialLink]
    social: [SocialLink]
  }

  type User {
    id: ID!
    username: String!
    email: String
    role: String
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
    expiresAt: String
  }

  input PersonalInfoInput {
    name: String
    initials: String
    title: String
    email: String
    phone: String
    tel: String
    location: String
    locationLink: String
    website: String
    personalWebsiteUrl: String
    linkedin: String
    github: String
    about: String
    summary: String
    avatarUrl: String
  }

  input WorkExperienceInput {
    company: String
    position: String
    startDate: String
    endDate: String
    description: String
    current: Boolean
  }

  input EducationInput {
    institution: String
    degree: String
    field: String
    startDate: String
    endDate: String
    current: Boolean
  }

  input SkillInput {
    name: String
    level: String
    category: String
  }

  input ProjectInput {
    name: String
    description: String
    technologies: [String]
    url: String
    github: String
    startDate: String
    endDate: String
  }

  input SocialLinkInput {
    platform: String
    url: String
    username: String
  }

  type Query {
    getResumeData: ResumeData
    me: User
    getServerInfo: String
    clearAllData: String
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
    updatePersonalInfo(input: PersonalInfoInput!): PersonalInfo
    updateSummary(summary: String!): ResumeData
    updateWorkExperience(workExperience: [WorkExperienceInput!]!): ResumeData
    updateEducation(education: [EducationInput!]!): ResumeData
    updateSkills(skills: [SkillInput!]!): ResumeData
    updateProjects(projects: [ProjectInput!]!): ResumeData
    updateSocialLinks(socialLinks: [SocialLinkInput!]!): ResumeData
    seedDefaultData: String
  }
`;

// Helper function to get user from JWT
const getUserFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    return decoded;
  } catch (error) {
    return null;
  }
};

// Resolvers
const resolvers = {
  Query: {
    getResumeData: async (_, __, context) => {
      try {
        console.log('getResumeData resolver called');
        
        // Ensure database connection
        await connectToDatabase();
        
        const resumeData = await ResumeData.findOne().exec();
        console.log('Resume data query result:', {
          found: !!resumeData,
          id: resumeData?._id,
          hasPersonalInfo: !!resumeData?.personalInfo
        });
        
        if (!resumeData) {
          console.log('No resume data found, attempting to seed...');
          await seedDefaultData();
          // Try again after seeding
          const newResumeData = await ResumeData.findOne().exec();
          console.log('After seeding, resume data found:', !!newResumeData);
          return newResumeData;
        }
        return resumeData;
      } catch (error) {
        console.error('Error fetching resume data:', error);
        throw new Error('Failed to fetch resume data: ' + error.message);
      }
    },
    me: async (_, __, context) => {
      try {
        await connectToDatabase();
        
        const authHeader = context.headers.authorization;
        if (!authHeader) return null;
        
        const token = authHeader.replace('Bearer ', '');
        const decoded = getUserFromToken(token);
        if (!decoded) return null;
        
        return await User.findById(decoded.userId);
      } catch (error) {
        console.error('Error in me query:', error);
        return null;
      }
    },
    getServerInfo: async (_, __, context) => {
      // IP adresini log etmek için yardımcı query
      const ip = context.headers['x-forwarded-for'] || 
                 context.headers['x-real-ip'] || 
                 context.headers['cf-connecting-ip'] || 
                 'unknown';
      console.log('Server IP Info:', {
        'x-forwarded-for': context.headers['x-forwarded-for'],
        'x-real-ip': context.headers['x-real-ip'],
        'cf-connecting-ip': context.headers['cf-connecting-ip'],
        'user-agent': context.headers['user-agent']
      });
      return `Server IP: ${ip}`;
    },
    clearAllData: async () => {
      try {
        await connectToDatabase();
        
        console.log('Clearing all resume data from database...');
        const result = await ResumeData.deleteMany({});
        console.log('Deleted documents:', result.deletedCount);
        
        // Seed new default data
        await seedDefaultData();
        
        return `Cleared ${result.deletedCount} documents and seeded new data`;
      } catch (error) {
        console.error('Clear data error:', error);
        throw new Error('Failed to clear data: ' + error.message);
      }
    }
  },
  ResumeData: {
    // Alias support for different field names
    work: (parent) => parent.workExperience,
    social: (parent) => parent.socialLinks,
    // Convert skills objects to simple strings
    skills: (parent) => {
      if (!parent.skills) return [];
      return parent.skills.map(skill => {
        if (typeof skill === 'string') return skill;
        return skill.name || skill.category || skill.level || skill;
      });
    }
  },
  PersonalInfo: {
    // Map alternative field names
    tel: (parent) => parent.phone || parent.tel,
    personalWebsiteUrl: (parent) => parent.website || parent.personalWebsiteUrl,
    locationLink: (parent) => parent.locationLink || parent.location
  },
  WorkExperience: {
    // Generate ID if not present
    id: (parent) => parent.id || parent._id || `work-${Date.now()}-${Math.random()}`,
    // Map alternative field names
    title: (parent) => parent.position || parent.title,
    start: (parent) => parent.startDate || parent.start,
    end: (parent) => parent.endDate || parent.end
  },
  Education: {
    // Generate ID if not present
    id: (parent) => parent.id || parent._id || `edu-${Date.now()}-${Math.random()}`,
    // Map alternative field names
    school: (parent) => parent.institution || parent.school,
    start: (parent) => parent.startDate || parent.start,
    end: (parent) => parent.endDate || parent.end
  },
  Project: {
    // Generate ID if not present
    id: (parent) => parent.id || parent._id || `proj-${Date.now()}-${Math.random()}`,
    // Map alternative field names
    title: (parent) => parent.name || parent.title,
    techStack: (parent) => parent.technologies || parent.techStack,
    // Create link object if needed
    link: (parent) => {
      if (parent.link) return parent.link;
      if (parent.url) {
        return {
          label: parent.name || parent.title || 'View Project',
          href: parent.url
        };
      }
      return null;
    }
  },
  SocialLink: {
    // Map alternative field names
    name: (parent) => parent.platform || parent.name,
    icon: (parent) => parent.icon || parent.platform
  },
  Mutation: {
    login: async (_, { username, password }) => {
      try {
        await connectToDatabase();
        
        // Admin credentials check
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
          // Create or find admin user
          let adminUser = await User.findOne({ username });
          if (!adminUser) {
            const hashedPassword = await bcrypt.hash(password, 12);
            adminUser = new User({ 
              username, 
              password: hashedPassword,
              email: process.env.ADMIN_EMAIL || 'admin@example.com',
              role: 'admin'
            });
            await adminUser.save();
          }

          const token = jwt.sign(
            { userId: adminUser._id, username: adminUser.username },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
          );

          // Calculate expiration date  
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);

          return {
            token,
            expiresAt: expiresAt.toISOString(),
            user: {
              id: adminUser._id,
              username: adminUser.username,
              email: adminUser.email,
              role: adminUser.role,
              createdAt: adminUser.createdAt ? adminUser.createdAt.toISOString() : new Date().toISOString(),
              updatedAt: adminUser.updatedAt ? adminUser.updatedAt.toISOString() : new Date().toISOString()
            }
          };
        }

        // Regular user authentication
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
          { userId: user._id, username: user.username },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        return {
          token,
          expiresAt: expiresAt.toISOString(),
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString()
          }
        };
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    updatePersonalInfo: async (_, { input }, context) => {
      await connectToDatabase();
      
      const authHeader = context.headers.authorization;
      if (!authHeader) throw new Error('Not authenticated');
      
      const token = authHeader.replace('Bearer ', '');
      const decoded = getUserFromToken(token);
      if (!decoded) throw new Error('Invalid token');

      let resumeData = await ResumeData.findOne({ userId: decoded.userId });
      if (!resumeData) {
        resumeData = new ResumeData({ userId: decoded.userId, personalInfo: input });
      } else {
        resumeData.personalInfo = { ...resumeData.personalInfo, ...input };
      }
      
      await resumeData.save();
      
      // Return PersonalInfo type
      return resumeData.personalInfo;
    },
    updateSummary: async (_, { summary }, context) => {
      await connectToDatabase();
      
      const authHeader = context.headers.authorization;
      if (!authHeader) throw new Error('Not authenticated');
      
      const token = authHeader.replace('Bearer ', '');
      const decoded = getUserFromToken(token);
      if (!decoded) throw new Error('Invalid token');

      let resumeData = await ResumeData.findOne({ userId: decoded.userId });
      if (!resumeData) {
        resumeData = new ResumeData({ userId: decoded.userId, summary });
      } else {
        resumeData.summary = summary;
      }
      
      return await resumeData.save();
    },
    updateWorkExperience: async (_, { workExperience }, context) => {
      await connectToDatabase();
      
      const authHeader = context.headers.authorization;
      if (!authHeader) throw new Error('Not authenticated');
      
      const token = authHeader.replace('Bearer ', '');
      const decoded = getUserFromToken(token);
      if (!decoded) throw new Error('Invalid token');

      let resumeData = await ResumeData.findOne({ userId: decoded.userId });
      if (!resumeData) {
        resumeData = new ResumeData({ userId: decoded.userId, workExperience });
      } else {
        resumeData.workExperience = workExperience;
      }
      
      return await resumeData.save();
    },
    updateEducation: async (_, { education }, context) => {
      await connectToDatabase();
      
      const authHeader = context.headers.authorization;
      if (!authHeader) throw new Error('Not authenticated');
      
      const token = authHeader.replace('Bearer ', '');
      const decoded = getUserFromToken(token);
      if (!decoded) throw new Error('Invalid token');

      let resumeData = await ResumeData.findOne({ userId: decoded.userId });
      if (!resumeData) {
        resumeData = new ResumeData({ userId: decoded.userId, education });
      } else {
        resumeData.education = education;
      }
      
      return await resumeData.save();
    },
    updateSkills: async (_, { skills }, context) => {
      await connectToDatabase();
      
      const authHeader = context.headers.authorization;
      if (!authHeader) throw new Error('Not authenticated');
      
      const token = authHeader.replace('Bearer ', '');
      const decoded = getUserFromToken(token);
      if (!decoded) throw new Error('Invalid token');

      let resumeData = await ResumeData.findOne({ userId: decoded.userId });
      if (!resumeData) {
        resumeData = new ResumeData({ userId: decoded.userId, skills });
      } else {
        resumeData.skills = skills;
      }
      
      return await resumeData.save();
    },
    updateProjects: async (_, { projects }, context) => {
      await connectToDatabase();
      
      const authHeader = context.headers.authorization;
      if (!authHeader) throw new Error('Not authenticated');
      
      const token = authHeader.replace('Bearer ', '');
      const decoded = getUserFromToken(token);
      if (!decoded) throw new Error('Invalid token');

      let resumeData = await ResumeData.findOne({ userId: decoded.userId });
      if (!resumeData) {
        resumeData = new ResumeData({ userId: decoded.userId, projects });
      } else {
        resumeData.projects = projects;
      }
      
      return await resumeData.save();
    },
    updateSocialLinks: async (_, { socialLinks }, context) => {
      await connectToDatabase();
      
      const authHeader = context.headers.authorization;
      if (!authHeader) throw new Error('Not authenticated');
      
      const token = authHeader.replace('Bearer ', '');
      const decoded = getUserFromToken(token);
      if (!decoded) throw new Error('Invalid token');

      let resumeData = await ResumeData.findOne({ userId: decoded.userId });
      if (!resumeData) {
        resumeData = new ResumeData({ userId: decoded.userId, socialLinks });
      } else {
        resumeData.socialLinks = socialLinks;
      }
      
      return await resumeData.save();
    },
    seedDefaultData: async () => {
      try {
        await connectToDatabase();
        
        console.log('Manual seed triggered...');
        const existingData = await ResumeData.findOne();
        if (existingData) {
          return 'Data already exists in database';
        }
        
        const newResumeData = new ResumeData(defaultResumeData);
        const savedData = await newResumeData.save();
        console.log('Manual seed completed with ID:', savedData._id);
        return 'Default data created successfully';
      } catch (error) {
        console.error('Manual seed error:', error);
        throw new Error('Failed to seed data: ' + error.message);
      }
    }
  }
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Always enable for debugging
  plugins: []
});

// Start server immediately at module load
const serverStartPromise = server.start();

// Manual Vercel handler
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST and GET
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    // Debug environment variables
    console.log('GraphQL Handler - Environment Check:', {
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'Not set',
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAdminCredentials: !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD),
      method: req.method,
      url: req.url
    });
    
    // Wait for server to start (no-op if already started)
    await serverStartPromise;
    
    // Get query and variables
    let query, variables;
    if (req.method === 'POST') {
      query = req.body.query;
      variables = req.body.variables;
    } else {
      query = req.query.query;
      variables = req.query.variables ? JSON.parse(req.query.variables) : undefined;
    }
    
    console.log('GraphQL Query:', query ? query.substring(0, 100) + '...' : 'No query');
    
    // Execute GraphQL
    const result = await server.executeOperation(
      { query, variables },
      { 
        contextValue: {
          headers: req.headers
        }
      }
    );
    
    console.log('GraphQL Result:', {
      hasData: !!result.body?.singleResult?.data,
      hasErrors: !!result.body?.singleResult?.errors,
      kind: result.body?.kind
    });
    
    // Send response
    res.status(200).json(result);
    
  } catch (error) {
    console.error('GraphQL Handler Error:', error);
    res.status(500).json({ 
      errors: [{ message: 'Internal server error', details: error.message }] 
    });
  }
};
