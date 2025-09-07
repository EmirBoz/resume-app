import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cv-app',
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Admin credentials
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:4200',
    'http://localhost:3000'
  ],
  
  // Production check
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development'
};

// Validate required environment variables in production
if (config.isProduction) {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    process.exit(1);
  }
  
  // Production security validations
  if (config.jwtSecret === 'fallback-secret-change-in-production') {
    console.error('❌ CRITICAL: JWT_SECRET must be changed in production!');
    process.exit(1);
  }
  
  if (config.adminPassword === 'admin123') {
    console.error('❌ CRITICAL: ADMIN_PASSWORD must be changed from default!');
    process.exit(1);
  }
  
  if (config.mongodbUri.includes('localhost')) {
    console.error('❌ CRITICAL: Use MongoDB Atlas in production, not localhost!');
    process.exit(1);
  }
  
  console.log('✅ Production environment validation passed');
}