import crypto from 'node:crypto';

export const generateJWTSecret = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

export const getJWTSecret = (): string => {
  // Check if JWT_SECRET exists in environment
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  
  // Generate a new JWT_SECRET if none exists
  const newSecret = generateJWTSecret();
  
  // Log the generated secret for development (in production, this should be stored securely)
  console.log('\n🔐 JWT Secret Configuration:');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ Generated new JWT_SECRET for development                   │');
  console.log('│                                                             │');
  console.log(`│ Secret: ${newSecret.substring(0, 20)}...${newSecret.substring(newSecret.length - 20)} │`);
  console.log('│                                                             │');
  console.log('│ ⚠️  Save this to your .env file for production use         │');
  console.log('└─────────────────────────────────────────────────────────────┘\n');
  
  return newSecret;
};
