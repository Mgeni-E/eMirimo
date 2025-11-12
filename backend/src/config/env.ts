import dotenv from 'dotenv';
import { getJWTSecret } from '../utils/generateJWTSecret.js';

// Load environment variables (quiet mode)
dotenv.config({ quiet: true });

// Environment configuration with defaults
export const config = {
  // Server
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/emirimo',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || getJWTSecret(),
  JWT_EXPIRES: process.env.JWT_EXPIRES || '7d',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Frontend URL (for email links and redirects)
  FRONTEND_URL: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Email (optional)
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || '587',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  
  // Firebase Admin SDK (for document storage)
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_SERVICE_ACCOUNT_KEY_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || '',
  FIREBASE_SERVICE_ACCOUNT_KEY_BASE64: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
};

// Validate required environment variables
export const validateEnv = () => {
  const required = ['MONGO_URI'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
  }
};

export default config;
