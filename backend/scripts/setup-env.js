const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate a secure JWT secret
const generateJWTSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Default environment configuration
const envContent = `# Environment Configuration
NODE_ENV=development
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/emirimo

# JWT Configuration
JWT_SECRET=${generateJWTSecret()}
JWT_EXPIRES=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
`;

// Write .env file
const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, envContent);

console.log('✅ Environment file created successfully!');
console.log('📁 Location:', envPath);
console.log('🔐 JWT_SECRET has been auto-generated');
console.log('⚠️  Please update EMAIL_USER and EMAIL_PASS for email functionality');
