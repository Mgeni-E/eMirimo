import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { config } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Job } from '../src/models/Job.js';

dotenv.config();

// Keza's profile data
const KEZA_PROFILE = {
  skills: ['Business', 'Acounting', 'Time management', 'Collaboration', 'Communication', 'Marketing', 'Social media management'],
  education: {
    degree: 'Bachelor',
    field: 'Business Administration',
    institution: 'University of Kigali (UoK)'
  },
  workExperience: [
    { position: 'Cashier', company: 'Bbox' },
    { position: 'Teaching Assistant', company: 'Uok' }
  ],
  preferences: {
    job_types: ['full-time', 'contract'],
    salary: { min: 350000, max: 500000, currency: 'RWF' },
    availability: '2-weeks',
    remote_preference: 'flexible'
  },
  location: 'Rwanda'
};

async function createJobsForKeza() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find or create an employer account
    let employer = await User.findOne({ role: 'employer', email: 'employer@emirimo.com' });
    
    if (!employer) {
      console.log('👤 Creating employer account...');
      const password_hash = await bcrypt.hash('employer123', 12);
      employer = await User.create({
        email: 'employer@emirimo.com',
        password_hash,
        name: 'eMirimo Hiring Team',
        role: 'employer',
        employer_profile: {
          company_name: 'eMirimo Solutions',
          company_description: 'A leading business solutions company in Rwanda',
          company_size: '51-200 employees',
          industry: 'Technology',
          can_post_jobs: true
        }
      });
      console.log('✅ Employer account created\n');
    } else {
      console.log('✅ Using existing employer account\n');
    }

    // Job 1: Marketing & Business Development Coordinator
    const job1Data = {
      employer_id: employer._id,
      company_name: employer.employer_profile?.company_name || 'eMirimo Solutions',
      title: 'Marketing & Business Development Coordinator',
      description: `We are seeking a dynamic Marketing & Business Development Coordinator to join our growing team. This role is perfect for someone with a Business Administration background and strong communication skills.

**Key Responsibilities:**
- Develop and execute marketing strategies to promote our services
- Manage social media accounts and create engaging content
- Coordinate business development activities and client relationships
- Collaborate with cross-functional teams to achieve business goals
- Track marketing metrics and prepare reports
- Assist in organizing events and promotional activities
- Support sales team with marketing materials and presentations

**Required Skills:**
- Business administration or marketing background
- Strong communication and collaboration skills
- Experience with social media management
- Time management and organizational abilities
- Proficiency in English (written and spoken)

**Preferred Qualifications:**
- Bachelor's degree in Business Administration, Marketing, or related field
- Previous experience in marketing or business development
- Knowledge of digital marketing tools and platforms

**What We Offer:**
- Competitive salary within your expected range
- Flexible work arrangements (remote/hybrid options available)
- Professional development opportunities
- Collaborative and supportive work environment
- Opportunity to work with a growing technology company`,
      short_description: 'Join our team as a Marketing & Business Development Coordinator. Perfect for Business Administration graduates with strong communication and marketing skills.',
      job_type: 'full-time',
      work_location: 'hybrid',
      experience_level: 'entry',
      category: 'Marketing',
      location: {
        city: 'Kigali',
        country: 'Rwanda',
        address: 'Kigali, Rwanda'
      },
      salary: {
        min: 400000,
        max: 500000,
        currency: 'RWF',
        period: 'monthly'
      },
      skills: ['Marketing', 'Business', 'Communication', 'Social media management', 'Collaboration', 'Time management'],
      required_skills: [
        { name: 'Marketing', level: 'intermediate', is_mandatory: true },
        { name: 'Business', level: 'intermediate', is_mandatory: true },
        { name: 'Communication', level: 'intermediate', is_mandatory: true },
        { name: 'Social media management', level: 'intermediate', is_mandatory: true },
        { name: 'Collaboration', level: 'intermediate', is_mandatory: true }
      ],
      preferred_skills: [
        { name: 'Time management', level: 'intermediate' },
        { name: 'Business Administration', level: 'intermediate' }
      ],
      requirements: [
        {
          type: 'education',
          description: 'Bachelor\'s degree in Business Administration, Marketing, or related field',
          is_mandatory: true
        },
        {
          type: 'language',
          description: 'Proficiency in English (written and spoken)',
          is_mandatory: true
        },
        {
          type: 'other',
          description: 'Strong communication and collaboration skills',
          is_mandatory: true
        }
      ],
      benefits: [
        { category: 'professional', name: 'Professional Development', description: 'Training and growth opportunities' },
        { category: 'work_life', name: 'Flexible Work Arrangements', description: 'Remote and hybrid options' },
        { category: 'health', name: 'Health Insurance', description: 'Comprehensive health coverage' }
      ],
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      posted_at: new Date(),
      is_active: true,
      application_method: 'platform'
    };

    // Job 2: Business Operations Assistant
    const job2Data = {
      employer_id: employer._id,
      company_name: employer.employer_profile?.company_name || 'eMirimo Solutions',
      title: 'Business Operations Assistant',
      description: `We are looking for a detail-oriented Business Operations Assistant to support our operations team. This role is ideal for someone with accounting knowledge and experience in administrative or customer-facing roles.

**Key Responsibilities:**
- Assist with day-to-day business operations and administrative tasks
- Support accounting and financial record-keeping activities
- Manage client communications and handle inquiries
- Coordinate with different departments to ensure smooth operations
- Maintain accurate records and documentation
- Assist in preparing reports and presentations
- Support event planning and coordination activities
- Handle time-sensitive tasks with efficiency

**Required Skills:**
- Accounting or business administration background
- Strong time management and organizational skills
- Excellent communication abilities
- Attention to detail and accuracy
- Collaboration and teamwork skills
- Proficiency in English and Kinyarwanda

**Preferred Qualifications:**
- Bachelor's degree in Business Administration, Accounting, or related field
- Previous experience in administrative, cashier, or customer service roles
- Basic accounting knowledge
- Experience with office software and tools

**What We Offer:**
- Competitive salary within your expected range
- Flexible work arrangements
- Supportive team environment
- Opportunities for career growth
- Comprehensive benefits package`,
      short_description: 'Join our operations team as a Business Operations Assistant. Perfect for candidates with accounting knowledge and administrative experience.',
      job_type: 'full-time',
      work_location: 'onsite',
      experience_level: 'entry',
      category: 'Business',
      location: {
        city: 'Kigali',
        country: 'Rwanda',
        address: 'Kigali, Rwanda'
      },
      salary: {
        min: 350000,
        max: 450000,
        currency: 'RWF',
        period: 'monthly'
      },
      skills: ['Acounting', 'Business', 'Time management', 'Collaboration', 'Communication'],
      required_skills: [
        { name: 'Acounting', level: 'intermediate', is_mandatory: true },
        { name: 'Business', level: 'intermediate', is_mandatory: true },
        { name: 'Time management', level: 'intermediate', is_mandatory: true },
        { name: 'Collaboration', level: 'intermediate', is_mandatory: true },
        { name: 'Communication', level: 'intermediate', is_mandatory: true }
      ],
      preferred_skills: [
        { name: 'Administrative skills', level: 'intermediate' },
        { name: 'Customer service', level: 'intermediate' }
      ],
      requirements: [
        {
          type: 'education',
          description: 'Bachelor\'s degree in Business Administration, Accounting, or related field',
          is_mandatory: true
        },
        {
          type: 'language',
          description: 'Proficiency in English and Kinyarwanda',
          is_mandatory: true
        },
        {
          type: 'experience',
          description: 'Previous experience in administrative, cashier, or customer service roles preferred',
          is_mandatory: false
        }
      ],
      benefits: [
        { category: 'professional', name: 'Career Development', description: 'Growth and learning opportunities' },
        { category: 'work_life', name: 'Work-Life Balance', description: 'Flexible scheduling options' },
        { category: 'financial', name: 'Performance Bonus', description: 'Quarterly performance incentives' }
      ],
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      posted_at: new Date(),
      is_active: true,
      application_method: 'platform'
    };

    // Check if jobs already exist
    const existingJob1 = await Job.findOne({ 
      title: 'Marketing & Business Development Coordinator',
      employer_id: employer._id
    });
    const existingJob2 = await Job.findOne({ 
      title: 'Business Operations Assistant',
      employer_id: employer._id
    });

    if (existingJob1) {
      console.log('⚠️  Job 1 already exists, skipping...');
    } else {
      const job1 = await Job.create(job1Data);
      console.log('✅ Created Job 1: Marketing & Business Development Coordinator');
      console.log(`   Job ID: ${job1._id}`);
    }

    if (existingJob2) {
      console.log('⚠️  Job 2 already exists, skipping...');
    } else {
      const job2 = await Job.create(job2Data);
      console.log('✅ Created Job 2: Business Operations Assistant');
      console.log(`   Job ID: ${job2._id}`);
    }

    console.log('\n🎉 Successfully created jobs for Keza!');
    console.log('\n📋 Job Summary:');
    console.log('   1. Marketing & Business Development Coordinator');
    console.log('      - Matches: Marketing, Business, Communication, Social media management');
    console.log('      - Salary: 400,000 - 500,000 RWF');
    console.log('      - Type: Full-time, Hybrid');
    console.log('\n   2. Business Operations Assistant');
    console.log('      - Matches: Accounting, Business, Time management, Collaboration');
    console.log('      - Salary: 350,000 - 450,000 RWF');
    console.log('      - Type: Full-time, Onsite');
    console.log('\n✨ These jobs should appear in Keza\'s recommended jobs!');

  } catch (error: any) {
    console.error('❌ Error creating jobs:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
createJobsForKeza();

