import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { LearningResource } from '../dist/models/LearningResource.js';

dotenv.config();

const rwandaSpecificLearningResources = [
  // Technical Skills for Rwanda Job Market
  {
    title: 'Web Development for Rwanda - Complete Course',
    description: 'Learn web development skills specifically tailored for Rwanda\'s growing tech sector. This comprehensive course covers modern web technologies and how to apply them in Rwanda\'s digital economy.',
    type: 'course',
    category: 'technical',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Web Development', 'Rwanda Tech'],
    difficulty: 'beginner',
    duration: 480, // 8 hours
    language: 'en',
    content_url: 'https://example.com/rwanda-web-development',
    author: 'Rwanda Tech Academy',
    source: 'eMirimo Learning',
    tags: ['web-development', 'rwanda', 'tech', 'programming'],
    is_active: true,
    is_featured: true
  },
  {
    title: 'Digital Marketing in Rwanda - Local Strategies',
    description: 'Master digital marketing strategies specifically for Rwanda\'s market. Learn how to reach Rwandan audiences, understand local consumer behavior, and create effective campaigns.',
    type: 'course',
    category: 'technical',
    skills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Rwanda Market', 'Local SEO', 'Kinyarwanda Marketing'],
    difficulty: 'intermediate',
    duration: 360, // 6 hours
    language: 'en',
    content_url: 'https://example.com/rwanda-digital-marketing',
    author: 'Rwanda Marketing Institute',
    source: 'eMirimo Learning',
    tags: ['digital-marketing', 'rwanda', 'social-media', 'local-marketing'],
    is_active: true,
    is_featured: true
  },
  {
    title: 'Data Analysis for Rwanda Development',
    description: 'Learn data analysis skills to support Rwanda\'s development goals. This course focuses on analyzing economic, social, and development data relevant to Rwanda\'s growth.',
    type: 'course',
    category: 'technical',
    skills: ['Python', 'Data Analysis', 'Statistics', 'Excel', 'Rwanda Data', 'Development Analytics'],
    difficulty: 'intermediate',
    duration: 420, // 7 hours
    language: 'en',
    content_url: 'https://example.com/rwanda-data-analysis',
    author: 'Rwanda Data Institute',
    source: 'eMirimo Learning',
    tags: ['data-analysis', 'rwanda', 'development', 'statistics'],
    is_active: true,
    is_featured: false
  },
  {
    title: 'Mobile App Development for African Markets',
    description: 'Build mobile applications that work well in African markets, including Rwanda. Learn about mobile-first design, offline functionality, and local payment integration.',
    type: 'course',
    category: 'technical',
    skills: ['Mobile Development', 'Flutter', 'React Native', 'African Markets', 'Offline Apps', 'Mobile Payments'],
    difficulty: 'intermediate',
    duration: 600, // 10 hours
    language: 'en',
    content_url: 'https://example.com/african-mobile-development',
    author: 'African Tech Academy',
    source: 'eMirimo Learning',
    tags: ['mobile-development', 'africa', 'flutter', 'mobile-payments'],
    is_active: true,
    is_featured: true
  },

  // Soft Skills for Rwanda Context
  {
    title: 'Professional Communication in Rwanda',
    description: 'Master professional communication skills for Rwanda\'s workplace. Learn how to communicate effectively in English and Kinyarwanda in professional settings.',
    type: 'course',
    category: 'soft-skills',
    skills: ['Professional Communication', 'English', 'Kinyarwanda', 'Workplace Communication', 'Rwanda Culture'],
    difficulty: 'beginner',
    duration: 180, // 3 hours
    language: 'en',
    content_url: 'https://example.com/rwanda-professional-communication',
    author: 'Rwanda Professional Institute',
    source: 'eMirimo Learning',
    tags: ['communication', 'rwanda', 'professional', 'language'],
    is_active: true,
    is_featured: true
  },
  {
    title: 'Leadership Skills for Rwanda\'s Youth',
    description: 'Develop leadership skills specifically for Rwanda\'s young professionals. Learn how to lead teams, manage projects, and drive change in Rwanda\'s growing economy.',
    type: 'course',
    category: 'soft-skills',
    skills: ['Leadership', 'Team Management', 'Project Management', 'Youth Leadership', 'Rwanda Leadership'],
    difficulty: 'intermediate',
    duration: 300, // 5 hours
    language: 'en',
    content_url: 'https://example.com/rwanda-youth-leadership',
    author: 'Rwanda Leadership Academy',
    source: 'eMirimo Learning',
    tags: ['leadership', 'youth', 'rwanda', 'management'],
    is_active: true,
    is_featured: false
  },
  {
    title: 'Entrepreneurship in Rwanda - Starting Your Business',
    description: 'Learn how to start and grow a business in Rwanda. This course covers Rwanda\'s business environment, regulations, funding opportunities, and success strategies.',
    type: 'course',
    category: 'career',
    skills: ['Entrepreneurship', 'Business Planning', 'Rwanda Business', 'Funding', 'Market Research', 'Business Development'],
    difficulty: 'beginner',
    duration: 240, // 4 hours
    language: 'en',
    content_url: 'https://example.com/rwanda-entrepreneurship',
    author: 'Rwanda Entrepreneurship Center',
    source: 'eMirimo Learning',
    tags: ['entrepreneurship', 'business', 'rwanda', 'startup'],
    is_active: true,
    is_featured: true
  },

  // Career Development for Rwanda
  {
    title: 'Career Planning for Rwanda\'s Job Market',
    description: 'Plan your career path in Rwanda\'s growing economy. Learn about job opportunities, salary expectations, and career advancement strategies in Rwanda.',
    type: 'course',
    category: 'career',
    skills: ['Career Planning', 'Job Search', 'Rwanda Jobs', 'Salary Negotiation', 'Career Development'],
    difficulty: 'beginner',
    duration: 150, // 2.5 hours
    language: 'en',
    content_url: 'https://example.com/rwanda-career-planning',
    author: 'Rwanda Career Services',
    source: 'eMirimo Learning',
    tags: ['career', 'job-search', 'rwanda', 'planning'],
    is_active: true,
    is_featured: true
  },
  {
    title: 'Resume Writing for Rwanda Employers',
    description: 'Create compelling resumes that appeal to Rwanda employers. Learn about local hiring practices, cultural considerations, and how to stand out in Rwanda\'s job market.',
    type: 'course',
    category: 'resume',
    skills: ['Resume Writing', 'Job Applications', 'Rwanda Employers', 'Cultural Awareness', 'Professional Presentation'],
    difficulty: 'beginner',
    duration: 120, // 2 hours
    language: 'en',
    content_url: 'https://example.com/rwanda-resume-writing',
    author: 'Rwanda HR Professionals',
    source: 'eMirimo Learning',
    tags: ['resume', 'job-application', 'rwanda', 'hr'],
    is_active: true,
    is_featured: false
  },
  {
    title: 'Interview Skills for Rwanda Companies',
    description: 'Master interview techniques for Rwanda\'s job market. Learn about local interview practices, cultural expectations, and how to succeed in Rwanda company interviews.',
    type: 'course',
    category: 'interview',
    skills: ['Interview Skills', 'Job Interviews', 'Rwanda Companies', 'Cultural Awareness', 'Professional Presentation'],
    difficulty: 'intermediate',
    duration: 180, // 3 hours
    language: 'en',
    content_url: 'https://example.com/rwanda-interview-skills',
    author: 'Rwanda HR Institute',
    source: 'eMirimo Learning',
    tags: ['interview', 'job-search', 'rwanda', 'professional'],
    is_active: true,
    is_featured: true
  },

  // Industry-Specific Skills
  {
    title: 'Agriculture Technology in Rwanda',
    description: 'Learn about AgriTech solutions for Rwanda\'s agriculture sector. This course covers IoT, mobile apps, and digital solutions for farmers in Rwanda.',
    type: 'course',
    category: 'technical',
    skills: ['AgriTech', 'IoT', 'Mobile Apps', 'Agriculture', 'Rwanda Farming', 'Digital Solutions'],
    difficulty: 'intermediate',
    duration: 360, // 6 hours
    language: 'en',
    content_url: 'https://example.com/rwanda-agritech',
    author: 'Rwanda Agriculture Institute',
    source: 'eMirimo Learning',
    tags: ['agritech', 'agriculture', 'iot', 'rwanda'],
    is_active: true,
    is_featured: false
  },
  {
    title: 'Healthcare IT in Rwanda',
    description: 'Learn about healthcare technology solutions for Rwanda\'s health sector. This course covers electronic health records, telemedicine, and digital health systems.',
    type: 'course',
    category: 'technical',
    skills: ['Healthcare IT', 'Electronic Health Records', 'Telemedicine', 'Digital Health', 'Rwanda Healthcare'],
    difficulty: 'intermediate',
    duration: 300, // 5 hours
    language: 'en',
    content_url: 'https://example.com/rwanda-healthcare-it',
    author: 'Rwanda Health Tech Institute',
    source: 'eMirimo Learning',
    tags: ['healthcare', 'health-tech', 'telemedicine', 'rwanda'],
    is_active: true,
    is_featured: true
  },
  {
    title: 'Financial Technology in Rwanda',
    description: 'Explore FinTech solutions for Rwanda\'s financial sector. Learn about mobile money, digital banking, and financial inclusion technologies.',
    type: 'course',
    category: 'technical',
    skills: ['FinTech', 'Mobile Money', 'Digital Banking', 'Financial Inclusion', 'Rwanda Finance'],
    difficulty: 'intermediate',
    duration: 240, // 4 hours
    language: 'en',
    content_url: 'https://example.com/rwanda-fintech',
    author: 'Rwanda FinTech Academy',
    source: 'eMirimo Learning',
    tags: ['fintech', 'mobile-money', 'banking', 'rwanda'],
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

async function seedRwandaLearningResources() {
  try {
    console.log('Starting Rwanda-specific learning resources seeding...');
    
    await connectToDatabase();
    
    console.log('Creating Rwanda-specific learning resources...');
    const createdResources = [];
    
    for (const resourceData of rwandaSpecificLearningResources) {
      try {
        const resource = new LearningResource({
          ...resourceData,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        const savedResource = await resource.save();
        createdResources.push(savedResource);
        console.log(`Created learning resource: ${savedResource.title}`);
      } catch (error) {
        console.error(`Error creating learning resource ${resourceData.title}:`, error);
      }
    }
    
    console.log('\n=== RWANDA LEARNING RESOURCES SEEDING COMPLETE ===');
    console.log(`Created ${createdResources.length} Rwanda-specific learning resources`);
    console.log('\nLearning resources created:');
    createdResources.forEach(resource => {
      console.log(`- ${resource.title} (${resource.category}, ${resource.difficulty})`);
    });
    
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

// Run the seeding
seedRwandaLearningResources();

export { seedRwandaLearningResources };
