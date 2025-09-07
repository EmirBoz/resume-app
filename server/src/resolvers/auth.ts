import { UserModel } from '../models/User';
import { generateToken, hashPassword, comparePassword, requireAuth } from '../utils/auth';
import { Context } from '../types';
import { config } from '../config/environment';

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);
      return user;
    },
    
    health: () => 'OK',
  },

  Mutation: {
    login: async (_: any, { username, password }: { username: string; password: string }) => {
      try {
        // Check if user exists
        let user = await UserModel.findOne({ username });
        
        // If no user exists and this is the admin credentials, create admin user
        if (!user && username === config.adminUsername && password === config.adminPassword) {
          const hashedPassword = await hashPassword(password);
          user = new UserModel({
            username,
            passwordHash: hashedPassword,
          });
          await user.save();
        }
        
        if (!user) {
          throw new Error('Invalid credentials');
        }
        
        // Verify password
        const isValidPassword = await comparePassword(password, user.passwordHash);
        if (!isValidPassword) {
          throw new Error('Invalid credentials');
        }
        
        // Generate token
        const token = generateToken({
          id: user._id.toString(),
          username: user.username,
          passwordHash: user.passwordHash,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
        
        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        return {
          token,
          expiresAt: expiresAt.toISOString(),
          user: {
            id: user._id.toString(),
            username: user.username,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        throw new Error('Authentication failed');
      }
    },
  },
};
