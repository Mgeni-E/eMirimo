import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../dist/models/User.js';
import { Job } from '../dist/models/Job.js';

dotenv.config();

const rwandaSpecificJobs = [
  // Technology Sector - High demand in Rwanda
  {
    employer_id: null, // Will be set to admin user
    title: 'Software Developer - Kigali Tech Hub',
    type: 'hybrid',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git', 'Problem Solving', 'Teamwork'],
    description: 'Join our growing tech team in Kigali! We are looking for passionate software developers to build innovative solutions for Rwanda\'s digital transformation. This role offers excellent growth opportunities in Rwanda\'s booming tech sector.\n\nKey Responsibilities:\n• Develop web applications using modern technologies\n• Collaborate with local and international teams\n• Contribute to Rwanda\'s digital economy growth\n• Learn and apply cutting-edge technologies\n\nWhat We Offer:\n• Competitive salary in RWF\n• Mentorship from experienced developers\n• Opportunities to work on impactful projects\n• Professional development support\n• Flexible working arrangements',
    location: 'Kigali, Rwanda',
    salary: { min: 800000, max: 1500000, currency: 'RWF' },
    job_category: 'technology',
    experience_level: 'entry',
    posted_at: new Date(),
    application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      'Basic knowledge of JavaScript and web development',
      'Passion for technology and learning',
      'Good communication skills in English',
      'Understanding of Rwanda\'s digital transformation goals',
      'Willingness to work in a collaborative environment'
    ],
    benefits: [
      'Competitive salary (RWF 800K - 1.5M)',
      'Health insurance coverage',
      'Professional development opportunities',
      'Flexible working hours',
      'Team building activities',
      'Career growth path'
    ],
    is_active: true,
    is_featured: true
  },
  {
    employer_id: null,
    title: 'Digital Marketing Specialist - Rwanda Tourism',
    type: 'onsite',
    skills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Google Analytics', 'SEO', 'Kinyarwanda', 'English'],
    description: 'Help promote Rwanda\'s tourism industry through digital marketing! We need a creative digital marketing specialist to showcase Rwanda\'s beauty to the world and attract more visitors.\n\nKey Responsibilities:\n• Develop digital marketing campaigns for tourism\n• Create engaging content in English and Kinyarwanda\n• Manage social media platforms\n• Analyze marketing performance\n• Collaborate with tourism stakeholders\n\nWhat We Offer:\n• Opportunity to promote Rwanda globally\n• Creative and dynamic work environment\n• Professional development in digital marketing\n• Competitive compensation package',
    location: 'Kigali, Rwanda',
    salary: { min: 700000, max: 1200000, currency: 'RWF' },
    job_category: 'marketing',
    experience_level: 'entry',
    posted_at: new Date(),
    application_deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    expiry_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    requirements: [
      'Bachelor\'s degree in Marketing, Communications, or related field',
      'Basic knowledge of digital marketing tools',
      'Fluent in English and Kinyarwanda',
      'Creative thinking and content creation skills',
      'Understanding of Rwanda\'s tourism sector',
      'Social media management experience preferred'
    ],
    benefits: [
      'Competitive salary (RWF 700K - 1.2M)',
      'Health insurance',
      'Marketing tools and software access',
      'Professional development support',
      'Flexible work arrangements',
      'Opportunity to travel within Rwanda'
    ],
    is_active: true,
    is_featured: false
  },
  {
    employer_id: null,
    title: 'Data Analyst - Rwanda Development Bank',
    type: 'hybrid',
    skills: ['Python', 'SQL', 'Excel', 'Data Analysis', 'Statistics', 'R', 'Tableau', 'Problem Solving'],
    description: 'Join Rwanda Development Bank\'s data team to analyze economic trends and support Rwanda\'s development goals. This role offers the opportunity to work with data that directly impacts Rwanda\'s economic growth.\n\nKey Responsibilities:\n• Analyze economic and financial data\n• Create reports for decision makers\n• Support Rwanda\'s development initiatives\n• Collaborate with government and private sector\n• Present findings to stakeholders\n\nWhat We Offer:\n• Meaningful work contributing to Rwanda\'s development\n• Professional growth in data analysis\n• Competitive benefits package\n• Work-life balance',
    location: 'Kigali, Rwanda',
    salary: { min: 1000000, max: 1800000, currency: 'RWF' },
    job_category: 'finance',
    experience_level: 'mid',
    posted_at: new Date(),
    application_deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    expiry_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    requirements: [
      'Bachelor\'s degree in Economics, Statistics, or related field',
      '2+ years of data analysis experience',
      'Proficiency in Python and SQL',
      'Strong analytical and problem-solving skills',
      'Understanding of Rwanda\'s economic landscape',
      'Excellent communication skills in English'
    ],
    benefits: [
      'Competitive salary (RWF 1M - 1.8M)',
      'Comprehensive health insurance',
      'Professional development opportunities',
      'Pension plan',
      'Flexible working arrangements',
      'Career advancement opportunities'
    ],
    is_active: true,
    is_featured: true
  },
  {
    employer_id: null,
    title: 'AgriTech Solutions Developer',
    type: 'remote',
    skills: ['Mobile Development', 'Flutter', 'Dart', 'Agriculture', 'IoT', 'Problem Solving', 'Innovation'],
    description: 'Develop innovative technology solutions for Rwanda\'s agriculture sector! Join our team to create mobile apps and IoT solutions that help farmers increase productivity and improve their livelihoods.\n\nKey Responsibilities:\n• Develop mobile applications for farmers\n• Create IoT solutions for agriculture\n• Collaborate with agricultural experts\n• Test solutions with local farmers\n• Contribute to Rwanda\'s agricultural transformation\n\nWhat We Offer:\n• Opportunity to impact Rwanda\'s agriculture sector\n• Remote work flexibility\n• Professional development in AgriTech\n• Competitive compensation',
    location: 'Remote (Rwanda)',
    salary: { min: 900000, max: 1600000, currency: 'RWF' },
    job_category: 'technology',
    experience_level: 'mid',
    posted_at: new Date(),
    application_deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    expiry_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      'Experience in mobile app development',
      'Knowledge of Flutter/Dart preferred',
      'Interest in agriculture and technology',
      'Understanding of Rwanda\'s agricultural sector',
      'Problem-solving and innovation mindset'
    ],
    benefits: [
      'Competitive salary (RWF 900K - 1.6M)',
      'Remote work flexibility',
      'Health insurance coverage',
      'Professional development budget',
      'Opportunity to work with farmers',
      'Innovation-focused work environment'
    ],
    is_active: true,
    is_featured: false
  },
  {
    employer_id: null,
    title: 'Financial Inclusion Officer - Microfinance',
    type: 'onsite',
    skills: ['Finance', 'Microfinance', 'Customer Service', 'Kinyarwanda', 'English', 'Communication', 'Problem Solving'],
    description: 'Help expand financial inclusion in Rwanda by working with microfinance institutions. This role focuses on bringing financial services to underserved communities across Rwanda.\n\nKey Responsibilities:\n• Develop financial products for rural communities\n• Train local communities on financial literacy\n• Manage microfinance operations\n• Build relationships with community leaders\n• Support Rwanda\'s financial inclusion goals\n\nWhat We Offer:\n• Meaningful work in financial inclusion\n• Competitive salary and benefits\n• Professional development opportunities\n• Opportunity to travel across Rwanda\n• Impact on community development',
    location: 'Kigali, Rwanda',
    salary: { min: 600000, max: 1100000, currency: 'RWF' },
    job_category: 'finance',
    experience_level: 'entry',
    posted_at: new Date(),
    application_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    expiry_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    requirements: [
      'Bachelor\'s degree in Finance, Economics, or related field',
      'Fluent in Kinyarwanda and English',
      'Interest in financial inclusion',
      'Good communication and interpersonal skills',
      'Understanding of Rwanda\'s rural communities',
      'Willingness to travel within Rwanda'
    ],
    benefits: [
      'Competitive salary (RWF 600K - 1.1M)',
      'Health insurance coverage',
      'Travel allowance',
      'Professional development support',
      'Opportunity to impact communities',
      'Career growth in microfinance'
    ],
    is_active: true,
    is_featured: true
  },
  {
    employer_id: null,
    title: 'Healthcare IT Specialist - Rwanda Health',
    type: 'hybrid',
    skills: ['Healthcare IT', 'Database Management', 'System Administration', 'Problem Solving', 'Communication', 'Healthcare'],
    description: 'Support Rwanda\'s healthcare system through technology! Join our team to maintain and improve healthcare IT systems that serve communities across Rwanda.\n\nKey Responsibilities:\n• Maintain healthcare IT systems\n• Train healthcare workers on technology\n• Support digital health initiatives\n• Troubleshoot technical issues\n• Contribute to Rwanda\'s health sector digitization\n\nWhat We Offer:\n• Opportunity to impact healthcare in Rwanda\n• Professional development in healthcare IT\n• Competitive benefits package\n• Work-life balance',
    location: 'Kigali, Rwanda',
    salary: { min: 800000, max: 1400000, currency: 'RWF' },
    job_category: 'healthcare',
    experience_level: 'mid',
    posted_at: new Date(),
    application_deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    expiry_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    requirements: [
      'Bachelor\'s degree in IT, Computer Science, or related field',
      '2+ years of IT support experience',
      'Knowledge of healthcare systems preferred',
      'Strong problem-solving skills',
      'Good communication skills',
      'Understanding of Rwanda\'s healthcare system'
    ],
    benefits: [
      'Competitive salary (RWF 800K - 1.4M)',
      'Health insurance coverage',
      'Professional development opportunities',
      'Flexible working arrangements',
      'Opportunity to serve communities',
      'Career advancement in healthcare IT'
    ],
    is_active: true,
    is_featured: false
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

async function seedRwandaJobs() {
  try {
    console.log('Starting Rwanda-specific jobs seeding...');
    
    await connectToDatabase();
    
    // Find admin user to be the employer
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('Admin user not found. Please run user seeding first.');
      process.exit(1);
    }
    
    console.log('Creating Rwanda-specific jobs...');
    const createdJobs = [];
    
    for (const jobData of rwandaSpecificJobs) {
      try {
        const job = new Job({
          ...jobData,
          employer_id: adminUser._id,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        const savedJob = await job.save();
        createdJobs.push(savedJob);
        console.log(`Created job: ${savedJob.title}`);
      } catch (error) {
        console.error(`Error creating job ${jobData.title}:`, error);
      }
    }
    
    console.log('\n=== RWANDA JOBS SEEDING COMPLETE ===');
    console.log(`Created ${createdJobs.length} Rwanda-specific jobs`);
    console.log('\nJobs created:');
    createdJobs.forEach(job => {
      console.log(`- ${job.title} (${job.job_category}, ${job.experience_level}) - ${job.location}`);
    });
    
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

// Run the seeding
seedRwandaJobs();

export { seedRwandaJobs };
