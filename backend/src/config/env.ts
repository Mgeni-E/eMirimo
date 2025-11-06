import dotenv from 'dotenv';
import { getJWTSecret } from '../utils/generateJWTSecret.js';

// Load environment variables
dotenv.config();

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
  
  // Email (optional)
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || '587',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
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
