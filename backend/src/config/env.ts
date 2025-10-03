import dotenv from 'dotenv';
import { getJWTSecret } from '../utils/generateJWTSecret';

// Load environment variables
dotenv.config();

// Environment configuration with defaults
export const config = {
  // Server
  PORT: process.env.PORT || 3000,
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
    console.warn('Using default values. Please set these in your .env file for production.');
  }
  
  // Log configuration (without sensitive data)
  console.log('\n📋 Environment Configuration:');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log(`│ Server Port:     ${config.PORT.toString().padEnd(40)} │`);
  console.log(`│ Environment:     ${config.NODE_ENV.padEnd(40)} │`);
  console.log(`│ Database:        ${config.MONGO_URI.includes('localhost') ? 'Local MongoDB' : 'Cloud MongoDB'.padEnd(40)} │`);
  console.log(`│ CORS Origin:     ${config.CORS_ORIGIN.padEnd(40)} │`);
  console.log(`│ JWT Secret:      ${config.JWT_SECRET ? 'Configured'.padEnd(40) : 'Missing'.padEnd(40)} │`);
  console.log(`│ JWT Expiry:      ${config.JWT_EXPIRES.padEnd(40)} │`);
  console.log('└─────────────────────────────────────────────────────────────┘\n');
};

export default config;
