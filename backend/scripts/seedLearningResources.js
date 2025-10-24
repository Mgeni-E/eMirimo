import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { LearningResource } from '../dist/models/LearningResource.js';

dotenv.config();

const sampleLearningResources = [
  // Technical Skills
  {
    title: 'Complete JavaScript Course for Beginners',
    description: 'Learn JavaScript from scratch with hands-on projects and real-world examples',
    type: 'course',
    category: 'technical',
    skills: ['JavaScript', 'Programming', 'Web Development', 'ES6'],
    difficulty: 'beginner',
    duration: 480, // 8 hours
    language: 'en',
    content_url: 'https://example.com/javascript-course',
    author: 'Tech Academy',
    source: 'eMirimo Learning',
    tags: ['programming', 'web', 'frontend'],
    is_active: true,
    is_featured: true
  },
  {
    title: 'React.js Advanced Patterns',
    description: 'Master advanced React patterns, hooks, and performance optimization',
    type: 'course',
    category: 'technical',
    skills: ['React', 'JavaScript', 'Frontend', 'Hooks', 'Performance'],
    difficulty: 'advanced',
    duration: 360, // 6 hours
    language: 'en',
    content_url: 'https://example.com/react-advanced',
    author: 'React Expert',
    source: 'eMirimo Learning',
    tags: ['react', 'frontend', 'advanced'],
    is_active: true,
    is_featured: false
  },
  {
    title: 'Python for Data Science',
    description: 'Learn Python programming for data analysis, machine learning, and visualization',
    type: 'course',
    category: 'technical',
    skills: ['Python', 'Data Science', 'Pandas', 'NumPy', 'Matplotlib'],
    difficulty: 'intermediate',
    duration: 600, // 10 hours
    language: 'en',
    content_url: 'https://example.com/python-data-science',
    author: 'Data Science Institute',
    source: 'eMirimo Learning',
    tags: ['python', 'data-science', 'analytics'],
    is_active: true,
    is_featured: true
  },
  {
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js, Express, and MongoDB',
    type: 'course',
    category: 'technical',
    skills: ['Node.js', 'Express', 'MongoDB', 'Backend', 'API Development'],
    difficulty: 'intermediate',
    duration: 420, // 7 hours
    language: 'en',
    content_url: 'https://example.com/nodejs-backend',
    author: 'Backend Master',
    source: 'eMirimo Learning',
    tags: ['nodejs', 'backend', 'api'],
    is_active: true,
    is_featured: false
  },

  // Soft Skills
  {
    title: 'Effective Communication in the Workplace',
    description: 'Improve your communication skills for better team collaboration and career growth',
    type: 'course',
    category: 'soft-skills',
    skills: ['Communication', 'Leadership', 'Teamwork', 'Presentation'],
    difficulty: 'beginner',
    duration: 180, // 3 hours
    language: 'en',
    content_url: 'https://example.com/communication-skills',
    author: 'HR Training Institute',
    source: 'eMirimo Learning',
    tags: ['communication', 'soft-skills', 'career'],
    is_active: true,
    is_featured: true
  },
  {
    title: 'Project Management Fundamentals',
    description: 'Learn essential project management skills and methodologies',
    type: 'course',
    category: 'soft-skills',
    skills: ['Project Management', 'Leadership', 'Planning', 'Agile'],
    difficulty: 'intermediate',
    duration: 300, // 5 hours
    language: 'en',
    content_url: 'https://example.com/project-management',
    author: 'PM Institute',
    source: 'eMirimo Learning',
    tags: ['project-management', 'leadership', 'planning'],
    is_active: true,
    is_featured: false
  },

  // Career Development
  {
    title: 'Building Your Professional Network',
    description: 'Learn how to network effectively and build meaningful professional relationships',
    type: 'course',
    category: 'networking',
    skills: ['Networking', 'Professional Relationships', 'Career Growth'],
    difficulty: 'beginner',
    duration: 120, // 2 hours
    language: 'en',
    content_url: 'https://example.com/networking',
    author: 'Career Coach',
    source: 'eMirimo Learning',
    tags: ['networking', 'career', 'professional'],
    is_active: true,
    is_featured: true
  },
  {
    title: 'Resume Writing Masterclass',
    description: 'Create compelling resumes that get you noticed by recruiters',
    type: 'course',
    category: 'resume',
    skills: ['Resume Writing', 'Job Applications', 'Career Development'],
    difficulty: 'beginner',
    duration: 90, // 1.5 hours
    language: 'en',
    content_url: 'https://example.com/resume-writing',
    author: 'Career Services',
    source: 'eMirimo Learning',
    tags: ['resume', 'job-search', 'career'],
    is_active: true,
    is_featured: false
  },
  {
    title: 'Interview Preparation Guide',
    description: 'Master the art of job interviews with proven strategies and techniques',
    type: 'course',
    category: 'interview',
    skills: ['Interview Skills', 'Communication', 'Job Search'],
    difficulty: 'intermediate',
    duration: 150, // 2.5 hours
    language: 'en',
    content_url: 'https://example.com/interview-prep',
    author: 'HR Professionals',
    source: 'eMirimo Learning',
    tags: ['interview', 'job-search', 'career'],
    is_active: true,
    is_featured: true
  },

  // Advanced Technical
  {
    title: 'Machine Learning with Python',
    description: 'Introduction to machine learning algorithms and implementation',
    type: 'course',
    category: 'technical',
    skills: ['Machine Learning', 'Python', 'AI', 'Data Science', 'Scikit-learn'],
    difficulty: 'advanced',
    duration: 720, // 12 hours
    language: 'en',
    content_url: 'https://example.com/ml-python',
    author: 'AI Research Lab',
    source: 'eMirimo Learning',
    tags: ['machine-learning', 'ai', 'python'],
    is_active: true,
    is_featured: true
  },
  {
    title: 'Cloud Computing with AWS',
    description: 'Learn cloud computing fundamentals and AWS services',
    type: 'course',
    category: 'technical',
    skills: ['AWS', 'Cloud Computing', 'DevOps', 'Infrastructure'],
    difficulty: 'intermediate',
    duration: 480, // 8 hours
    language: 'en',
    content_url: 'https://example.com/aws-cloud',
    author: 'Cloud Expert',
    source: 'eMirimo Learning',
    tags: ['aws', 'cloud', 'devops'],
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

async function clearLearningResources() {
  try {
    await LearningResource.deleteMany({});
    console.log('Learning resources cleared');
  } catch (error) {
    console.error('Error clearing learning resources:', error);
  }
}

async function createLearningResources() {
  const createdResources = [];
  
  for (const resourceData of sampleLearningResources) {
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
  
  return createdResources;
}

async function seedLearningResources() {
  try {
    console.log('Starting learning resources seeding...');
    
    await connectToDatabase();
    await clearLearningResources();
    
    console.log('Creating learning resources...');
    const resources = await createLearningResources();
    
    console.log('\n=== LEARNING RESOURCES SEEDING COMPLETE ===');
    console.log(`Created ${resources.length} learning resources`);
    console.log('\nLearning resources created:');
    resources.forEach(resource => {
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
seedLearningResources();

export { seedLearningResources };
