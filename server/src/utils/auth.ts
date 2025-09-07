import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/environment';
import { Context, User } from '../types';
import { UserModel } from '../models/User';

export interface JWTPayload {
  userId: string;
  username: string;
}

export const generateToken = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
  };
  
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const createContext = async ({ req }: { req: any }): Promise<Context> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return { isAuthenticated: false };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  
  if (!payload) {
    return { isAuthenticated: false };
  }
  
  try {
    const user = await UserModel.findById(payload.userId);
    
    if (!user) {
      return { isAuthenticated: false };
    }
    
    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      isAuthenticated: true,
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
};

export const requireAuth = (context: Context): User => {
  if (!context.isAuthenticated || !context.user) {
    throw new Error('Authentication required');
  }
  
  return context.user;
};