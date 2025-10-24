import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../dist/models/User.js';
import { Job } from '../dist/models/Job.js';
import { Application } from '../dist/models/Application.js';
import { Notification } from '../dist/models/Notification.js';

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

const sampleJobs = [
  {
    title: 'Senior Software Developer',
    description: 'We are looking for an experienced software developer to join our team. You will be responsible for developing and maintaining our web applications.',
    requirements: 'Bachelor\'s degree in Computer Science, 3+ years experience with React and Node.js',
    location: 'Kigali, Rwanda',
    type: 'full-time',
    salary_min: 800000,
    salary_max: 1200000,
    currency: 'RWF',
    status: 'active',
    is_featured: true,
    is_active: true,
    application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    skills_required: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    experience_level: 'senior',
    remote_work: 'hybrid'
  },
  {
    title: 'UI/UX Designer',
    description: 'Join our design team to create beautiful and functional user interfaces. You will work closely with developers and product managers.',
    requirements: 'Portfolio demonstrating UI/UX skills, experience with Figma and Adobe Creative Suite',
    location: 'Kigali, Rwanda',
    type: 'full-time',
    salary_min: 600000,
    salary_max: 900000,
    currency: 'RWF',
    status: 'active',
    is_featured: false,
    is_active: true,
    application_deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    skills_required: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
    experience_level: 'mid',
    remote_work: 'remote'
  },
  {
    title: 'Digital Marketing Specialist',
    description: 'We need a creative digital marketing specialist to help us grow our online presence and reach new customers.',
    requirements: 'Experience with social media marketing, Google Ads, and content creation',
    location: 'Kigali, Rwanda',
    type: 'full-time',
    salary_min: 500000,
    salary_max: 750000,
    currency: 'RWF',
    status: 'active',
    is_featured: false,
    is_active: true,
    application_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    skills_required: ['Social Media Marketing', 'Google Ads', 'Content Creation', 'Analytics'],
    experience_level: 'mid',
    remote_work: 'hybrid'
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

async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
    console.log('Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
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
      console.log(`Created user: ${savedUser.name} (${savedUser.role})`);
    } catch (error) {
      console.error(`Error creating user ${userData.name}:`, error);
    }
  }
  
  return createdUsers;
}

async function createJobs(users) {
  const employers = users.filter(user => user.role === 'employer');
  const createdJobs = [];
  
  for (let i = 0; i < sampleJobs.length && i < employers.length; i++) {
    try {
      const jobData = {
        ...sampleJobs[i],
        employer_id: employers[i]._id,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const job = new Job(jobData);
      const savedJob = await job.save();
      createdJobs.push(savedJob);
      console.log(`Created job: ${savedJob.title} by ${employers[i].name}`);
    } catch (error) {
      console.error(`Error creating job ${sampleJobs[i].title}:`, error);
    }
  }
  
  return createdJobs;
}

async function createApplications(users, jobs) {
  const seekers = users.filter(user => user.role === 'seeker');
  const createdApplications = [];
  
  for (const seeker of seekers) {
    // Each seeker applies to 1-2 random jobs
    const numApplications = Math.floor(Math.random() * 2) + 1;
    const shuffledJobs = jobs.sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numApplications && i < shuffledJobs.length; i++) {
      try {
        const job = shuffledJobs[i];
        const application = new Application({
          user_id: seeker._id,
          job_id: job._id,
          employer_id: job.employer_id,
          status: ['pending', 'reviewed', 'accepted', 'rejected'][Math.floor(Math.random() * 4)],
          cover_letter: `I am very interested in the ${job.title} position at your company. I believe my skills and experience make me a great fit for this role.`,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        const savedApplication = await application.save();
        createdApplications.push(savedApplication);
        console.log(`Created application: ${seeker.name} applied to ${job.title}`);
      } catch (error) {
        console.error(`Error creating application for ${seeker.name}:`, error);
      }
    }
  }
  
  return createdApplications;
}

async function createNotifications(users) {
  const notifications = [];
  
  for (const user of users) {
    // Create 1-3 notifications per user
    const numNotifications = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numNotifications; i++) {
      try {
        const notification = new Notification({
          user_id: user._id,
          message: [
            'Welcome to eMirimo! Complete your profile to get started.',
            'New job opportunities are available in your area.',
            'Your application status has been updated.',
            'Don\'t forget to check out our learning resources.',
            'Your profile has been verified successfully.'
          ][Math.floor(Math.random() * 5)],
          type: ['system', 'job', 'application', 'learning'][Math.floor(Math.random() * 4)],
          read_status: Math.random() > 0.5,
          created_at: new Date()
        });
        
        const savedNotification = await notification.save();
        notifications.push(savedNotification);
      } catch (error) {
        console.error(`Error creating notification for ${user.name}:`, error);
      }
    }
  }
  
  console.log(`Created ${notifications.length} notifications`);
  return notifications;
}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    await connectToDatabase();
    await clearDatabase();
    
    console.log('Creating users...');
    const users = await createUsers();
    
    console.log('Creating jobs...');
    const jobs = await createJobs(users);
    
    console.log('Creating applications...');
    const applications = await createApplications(users, jobs);
    
    console.log('Creating notifications...');
    await createNotifications(users);
    
    console.log('\n=== SEEDING COMPLETE ===');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${jobs.length} jobs`);
    console.log(`Created ${applications.length} applications`);
    console.log('\nSample user IDs for testing:');
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
seedDatabase();

export { seedDatabase };
