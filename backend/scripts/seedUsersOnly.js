import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../dist/models/User.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'seeker',
    status: 'active',
    phone: '+250788123456',
    bio: 'Experienced software developer with 5+ years in full-stack development',
    address: 'KG 123 St, Kacyiru',
    city: 'Kigali',
    country: 'Rwanda',
    linkedin: 'https://linkedin.com/in/johndoe',
    profile_image: '',
    is_verified: true,
    profileComplete: true
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    role: 'seeker',
    status: 'active',
    phone: '+250788234567',
    bio: 'UI/UX Designer passionate about creating user-centered designs',
    address: 'KG 456 St, Kimisagara',
    city: 'Kigali',
    country: 'Rwanda',
    linkedin: 'https://linkedin.com/in/janesmith',
    profile_image: '',
    is_verified: true,
    profileComplete: true
  },
  {
    name: 'Rwanda Innovation Hub',
    email: 'jobs@innovationhub.rw',
    password: 'password123',
    role: 'employer',
    status: 'active',
    phone: '+250788345678',
    bio: 'Leading innovation hub in Rwanda fostering tech entrepreneurship',
    address: 'KG 789 St, Kacyiru',
    city: 'Kigali',
    country: 'Rwanda',
    website: 'https://innovationhub.rw',
    linkedin: 'https://linkedin.com/company/rwanda-innovation-hub',
    company_name: 'Rwanda Innovation Hub',
    company_size: '51-200 employees',
    industry: 'Technology',
    profile_image: '',
    is_verified: true,
    profileComplete: true
  },
  {
    name: 'East Africa Fintech',
    email: 'hr@eafintech.com',
    password: 'password123',
    role: 'employer',
    status: 'active',
    phone: '+250788456789',
    bio: 'Financial technology company revolutionizing digital payments in East Africa',
    address: 'KG 321 St, Nyarutarama',
    city: 'Kigali',
    country: 'Rwanda',
    website: 'https://eafintech.com',
    linkedin: 'https://linkedin.com/company/east-africa-fintech',
    company_name: 'East Africa Fintech',
    company_size: '11-50 employees',
    industry: 'Finance',
    profile_image: '',
    is_verified: true,
    profileComplete: true
  },
  {
    name: 'Kigali Digital Agency',
    email: 'careers@kigalidigital.rw',
    password: 'password123',
    role: 'employer',
    status: 'pending',
    phone: '+250788567890',
    bio: 'Digital marketing and web development agency',
    address: 'KG 654 St, Remera',
    city: 'Kigali',
    country: 'Rwanda',
    website: 'https://kigalidigital.rw',
    company_name: 'Kigali Digital Agency',
    company_size: '1-10 employees',
    industry: 'Marketing',
    profile_image: '',
    is_verified: false,
    profileComplete: false
  },
  {
    name: 'Tech Solutions Rwanda Ltd',
    email: 'hr@techsolutions.rw',
    password: 'password123',
    role: 'employer',
    status: 'active',
    phone: '+250788678901',
    bio: 'IT consulting and software development company',
    address: 'KG 987 St, Gikondo',
    city: 'Kigali',
    country: 'Rwanda',
    website: 'https://techsolutions.rw',
    company_name: 'Tech Solutions Rwanda Ltd',
    company_size: '51-200 employees',
    industry: 'Technology',
    profile_image: '',
    is_verified: true,
    profileComplete: true
  },
  {
    name: 'Elvin Mgeni',
    email: 'elvin.mgeni@example.com',
    password: 'password123',
    role: 'seeker',
    status: 'inactive',
    phone: '+250788789012',
    bio: 'Recent computer science graduate looking for entry-level opportunities',
    address: 'KG 147 St, Nyamirambo',
    city: 'Kigali',
    country: 'Rwanda',
    profile_image: '',
    is_verified: false,
    profileComplete: false
  },
  {
    name: 'eMirimo Admin',
    email: 'admin@emirimo.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    phone: '+250788890123',
    bio: 'System administrator for eMirimo platform',
    address: 'KG 258 St, Kacyiru',
    city: 'Kigali',
    country: 'Rwanda',
    profile_image: '',
    is_verified: true,
    profileComplete: true
  }
];

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emirimo');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

async function clearUsers() {
  try {
    await User.deleteMany({});
    console.log('Users cleared');
  } catch (error) {
    console.error('Error clearing users:', error);
  }
}

async function createUsers() {
  const createdUsers = [];
  
  for (const userData of sampleUsers) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: userData.status === 'active' ? new Date() : null
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${savedUser.name} (${savedUser.role}) - ID: ${savedUser._id}`);
    } catch (error) {
      console.error(`Error creating user ${userData.name}:`, error);
    }
  }
  
  return createdUsers;
}

async function seedUsers() {
  try {
    console.log('Starting user seeding...');
    
    await connectToDatabase();
    await clearUsers();
    
    console.log('Creating users...');
    const users = await createUsers();
    
    console.log('\n=== USER SEEDING COMPLETE ===');
    console.log(`Created ${users.length} users`);
    console.log('\nUser IDs for testing:');
    users.forEach(user => {
      console.log(`${user.name} (${user.role}): ${user._id}`);
    });
    
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

// Run the seeding
seedUsers();

export { seedUsers };
