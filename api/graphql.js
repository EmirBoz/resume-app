const { ApolloServer } = require('@apollo/server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MongoDB connection
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cv-development');
}

// MongoDB Schema definitions
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  role: { type: String, default: 'user' }
});

const resumeDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  personalInfo: {
    name: String,
    title: String,
    email: String,
    phone: String,
    location: String,
    website: String,
    linkedin: String,
    github: String
  },
  summary: String,
  workExperience: [{
    company: String,
    position: String,
    startDate: String,
    endDate: String,
    description: String,
    current: Boolean
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    current: Boolean
  }],
  skills: [{
    name: String,
    level: String,
    category: String
  }],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    url: String,
    github: String,
    startDate: String,
    endDate: String
  }],
  socialLinks: [{
    platform: String,
    url: String,
    username: String
  }]
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const ResumeData = mongoose.models.ResumeData || mongoose.model('ResumeData', resumeDataSchema);

// GraphQL Type Definitions (inline string)
const typeDefs = `
  type PersonalInfo {
    name: String
    title: String
    email: String
    phone: String
    location: String
    website: String
    linkedin: String
    github: String
  }

  type WorkExperience {
    company: String
    position: String
    startDate: String
    endDate: String
    description: String
    current: Boolean
  }

  type Education {
    institution: String
    degree: String
    field: String
    startDate: String
    endDate: String
    current: Boolean
  }

  type Skill {
    name: String
    level: String
    category: String
  }

  type Project {
    name: String
    description: String
    technologies: [String]
    url: String
    github: String
    startDate: String
    endDate: String
  }

  type SocialLink {
    platform: String
    url: String
    username: String
  }

  type ResumeData {
    id: ID!
    personalInfo: PersonalInfo
    summary: String
    workExperience: [WorkExperience]
    education: [Education]
    skills: [Skill]
    projects: [Project]
    socialLinks: [SocialLink]
  }

  type User {
    id: ID!
    username: String!
    email: String
    role: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input PersonalInfoInput {
    name: String
    title: String
    email: String
    phone: String
    location: String
    website: String
    linkedin: String
    github: String
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
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
    updatePersonalInfo(personalInfo: PersonalInfoInput!): ResumeData
    updateSummary(summary: String!): ResumeData
    updateWorkExperience(workExperience: [WorkExperienceInput!]!): ResumeData
    updateEducation(education: [EducationInput!]!): ResumeData
    updateSkills(skills: [SkillInput!]!): ResumeData
    updateProjects(projects: [ProjectInput!]!): ResumeData
    updateSocialLinks(socialLinks: [SocialLinkInput!]!): ResumeData
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
        const resumeData = await ResumeData.findOne().exec();
        return resumeData;
      } catch (error) {
        console.error('Error fetching resume data:', error);
        throw new Error('Failed to fetch resume data');
      }
    },
    me: async (_, __, context) => {
      const authHeader = context.headers.authorization;
      if (!authHeader) return null;
      
      const token = authHeader.replace('Bearer ', '');
      const decoded = getUserFromToken(token);
      if (!decoded) return null;
      
      return await User.findById(decoded.userId);
    }
  },
  Mutation: {
    login: async (_, { username, password }) => {
      try {
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

        return {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        };
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    updatePersonalInfo: async (_, { personalInfo }, context) => {
      const authHeader = context.headers.authorization;
      if (!authHeader) throw new Error('Not authenticated');
      
      const token = authHeader.replace('Bearer ', '');
      const decoded = getUserFromToken(token);
      if (!decoded) throw new Error('Invalid token');

      let resumeData = await ResumeData.findOne({ userId: decoded.userId });
      if (!resumeData) {
        resumeData = new ResumeData({ userId: decoded.userId, personalInfo });
      } else {
        resumeData.personalInfo = personalInfo;
      }
      
      return await resumeData.save();
    },
    updateSummary: async (_, { summary }, context) => {
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
    
    // Execute GraphQL
    const result = await server.executeOperation(
      { query, variables },
      { 
        contextValue: {
          headers: req.headers
        }
      }
    );
    
    // Send response
    res.status(200).json(result);
    
  } catch (error) {
    console.error('GraphQL Error:', error);
    res.status(500).json({ 
      errors: [{ message: 'Internal server error', details: error.message }] 
    });
  }
};