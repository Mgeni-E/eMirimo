import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../dist/models/User.js';
import { Job } from '../dist/models/Job.js';
import { Application } from '../dist/models/Application.js';
import { Notification } from '../dist/models/Notification.js';
import { LearningResource } from '../dist/models/LearningResource.js';

dotenv.config();

// Comprehensive sample data for testing all features
const sampleUsers = [
  // Admin Account
  {
    name: 'eMirimo Admin',
    email: 'admin@emirimo.com',
    password: 'admin@123',
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
  },
  
  // Job Seekers with different skill levels for AI testing
  {
    name: 'Jean Baptiste',
    email: 'jean.baptiste@example.com',
    password: 'password123',
    role: 'seeker',
    status: 'active',
    phone: '+250788123456',
    bio: 'Recent computer science graduate with basic programming skills, looking for entry-level opportunities in Rwanda\'s growing tech sector.',
    address: 'KG 123 St, Kacyiru',
    city: 'Kigali',
    country: 'Rwanda',
    linkedin: 'https://linkedin.com/in/jeanbaptiste',
    profile_image: '',
    is_verified: true,
    profileComplete: true,
    // Skills for AI matching - has some but missing others
    skills: ['JavaScript', 'HTML', 'CSS', 'Problem Solving'],
    education: [{
      institution: 'University of Rwanda',
      degree: 'Bachelor of Science',
      field_of_study: 'Computer Science',
      graduation_year: 2023,
      gpa: '3.2',
      achievements: ['Dean\'s List', 'Programming Competition Winner']
    }],
    work_experience: [{
      company: 'Kigali Tech Hub',
      position: 'Intern Software Developer',
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-06-30'),
      current: false,
      description: 'Worked on web development projects using JavaScript and HTML',
      achievements: ['Completed 3 web projects', 'Learned React basics'],
      skills_used: ['JavaScript', 'HTML', 'CSS']
    }],
    job_preferences: {
      job_types: ['full-time', 'part-time'],
      locations: ['Kigali', 'Remote'],
      salary_range: { min: 500000, max: 1000000 },
      industries: ['Technology', 'Finance']
    }
  },
  
  {
    name: 'Marie Claire',
    email: 'marie.claire@example.com',
    password: 'password123',
    role: 'seeker',
    status: 'active',
    phone: '+250788234567',
    bio: 'Experienced marketing professional with digital marketing skills, seeking opportunities in Rwanda\'s growing business sector.',
    address: 'KG 456 St, Kimisagara',
    city: 'Kigali',
    country: 'Rwanda',
    linkedin: 'https://linkedin.com/in/marieclaire',
    profile_image: '',
    is_verified: true,
    profileComplete: true,
    skills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Google Analytics', 'Communication'],
    education: [{
      institution: 'Kigali Independent University',
      degree: 'Bachelor of Business Administration',
      field_of_study: 'Marketing',
      graduation_year: 2021,
      gpa: '3.5',
      achievements: ['Marketing Excellence Award']
    }],
    work_experience: [{
      company: 'Rwanda Tourism Board',
      position: 'Marketing Assistant',
      start_date: new Date('2021-07-01'),
      end_date: new Date('2023-12-31'),
      current: false,
      description: 'Managed social media campaigns and created marketing content',
      achievements: ['Increased social media engagement by 40%', 'Launched 5 successful campaigns'],
      skills_used: ['Social Media', 'Content Creation', 'Digital Marketing']
    }],
    job_preferences: {
      job_types: ['full-time'],
      locations: ['Kigali'],
      salary_range: { min: 600000, max: 1200000 },
      industries: ['Marketing', 'Tourism', 'Business']
    }
  },
  
  {
    name: 'Paul Nkurunziza',
    email: 'paul.nkurunziza@example.com',
    password: 'password123',
    role: 'seeker',
    status: 'active',
    phone: '+250788345678',
    bio: 'Data science enthusiast with Python skills, looking to contribute to Rwanda\'s digital transformation through data analysis.',
    address: 'KG 789 St, Remera',
    city: 'Kigali',
    country: 'Rwanda',
    linkedin: 'https://linkedin.com/in/paulnkurunziza',
    profile_image: '',
    is_verified: true,
    profileComplete: true,
    skills: ['Python', 'Data Analysis', 'Excel', 'Statistics', 'Problem Solving'],
    education: [{
      institution: 'University of Kigali',
      degree: 'Master of Science',
      field_of_study: 'Data Science',
      graduation_year: 2022,
      gpa: '3.7',
      achievements: ['Research Excellence Award', 'Best Thesis Award']
    }],
    work_experience: [{
      company: 'Rwanda Development Bank',
      position: 'Junior Data Analyst',
      start_date: new Date('2022-08-01'),
      end_date: new Date('2023-12-31'),
      current: false,
      description: 'Analyzed economic data and created reports for decision makers',
      achievements: ['Improved data processing efficiency by 30%', 'Created 10+ analytical reports'],
      skills_used: ['Python', 'Data Analysis', 'Excel', 'Statistics']
    }],
    job_preferences: {
      job_types: ['full-time'],
      locations: ['Kigali', 'Remote'],
      salary_range: { min: 800000, max: 1500000 },
      industries: ['Finance', 'Technology', 'Government']
    }
  },

  // Employers
  {
    name: 'Rwanda Innovation Hub',
    email: 'jobs@innovationhub.rw',
    password: 'password123',
    role: 'employer',
    status: 'active',
    phone: '+250788456789',
    bio: 'Leading innovation hub in Rwanda fostering tech entrepreneurship and digital transformation.',
    address: 'KG 321 St, Kacyiru',
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
    phone: '+250788567890',
    bio: 'Financial technology company revolutionizing digital payments in East Africa.',
    address: 'KG 654 St, Nyarutarama',
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
    status: 'active',
    phone: '+250788678901',
    bio: 'Digital marketing and web development agency serving Rwanda and East Africa.',
    address: 'KG 987 St, Remera',
    city: 'Kigali',
    country: 'Rwanda',
    website: 'https://kigalidigital.rw',
    company_name: 'Kigali Digital Agency',
    company_size: '1-10 employees',
    industry: 'Marketing',
    profile_image: '',
    is_verified: true,
    profileComplete: true
  }
];

const sampleJobs = [
  {
    title: 'Senior Software Developer - React Specialist',
    description: 'We are looking for an experienced React developer to join our growing tech team. You will be responsible for developing and maintaining our web applications using modern React technologies.\n\nKey Responsibilities:\n• Develop responsive web applications using React.js\n• Collaborate with backend developers and designers\n• Implement modern UI/UX designs\n• Write clean, maintainable code\n• Participate in code reviews and team meetings\n\nWhat We Offer:\n• Competitive salary in RWF\n• Professional development opportunities\n• Modern tech stack and tools\n• Collaborative work environment\n• Career growth opportunities',
    location: 'Kigali, Rwanda',
    type: 'hybrid',
    salary: { min: 1200000, max: 2000000, currency: 'RWF' },
    job_category: 'technology',
    experience_level: 'senior',
    posted_at: new Date(),
    application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '3+ years of experience with React.js',
      'Strong knowledge of JavaScript, HTML, and CSS',
      'Experience with state management (Redux, Context API)',
      'Familiarity with modern development tools (Webpack, Babel)',
      'Experience with RESTful APIs and GraphQL',
      'Strong problem-solving and communication skills'
    ],
    benefits: [
      'Competitive salary (RWF 1.2M - 2M)',
      'Health insurance coverage',
      'Professional development budget',
      'Flexible working hours',
      'Remote work options',
      'Team building activities',
      'Career advancement opportunities'
    ],
    skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Git', 'Problem Solving', 'Teamwork'],
    is_active: true,
    is_featured: true
  },
  
  {
    title: 'Digital Marketing Manager',
    description: 'Join our marketing team to lead digital marketing initiatives and grow our online presence. You will develop and execute comprehensive digital marketing strategies.\n\nKey Responsibilities:\n• Develop and execute digital marketing campaigns\n• Manage social media platforms and content creation\n• Analyze marketing performance and optimize strategies\n• Collaborate with cross-functional teams\n• Stay updated with digital marketing trends\n\nWhat We Offer:\n• Opportunity to shape our digital presence\n• Creative and dynamic work environment\n• Professional development in digital marketing\n• Competitive compensation package',
    location: 'Kigali, Rwanda',
    type: 'onsite',
    salary: { min: 800000, max: 1400000, currency: 'RWF' },
    job_category: 'marketing',
    experience_level: 'mid',
    posted_at: new Date(),
    application_deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    expiry_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    requirements: [
      'Bachelor\'s degree in Marketing, Communications, or related field',
      '3+ years of digital marketing experience',
      'Proficiency in social media marketing and content creation',
      'Experience with Google Analytics and advertising platforms',
      'Strong analytical and creative thinking skills',
      'Excellent communication skills in English and Kinyarwanda',
      'Understanding of Rwanda\'s digital landscape'
    ],
    benefits: [
      'Competitive salary (RWF 800K - 1.4M)',
      'Health insurance coverage',
      'Marketing tools and software access',
      'Professional development support',
      'Flexible work arrangements',
      'Performance bonuses',
      'Career growth opportunities'
    ],
    skills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Google Analytics', 'SEO', 'Communication'],
    is_active: true,
    is_featured: false
  },
  
  {
    title: 'Data Analyst - Financial Services',
    description: 'Join our data team to analyze financial data and support business decisions. You will work with large datasets to provide insights that drive our business forward.\n\nKey Responsibilities:\n• Analyze financial and business data using Python and SQL\n• Create reports and dashboards for stakeholders\n• Identify trends and patterns in data\n• Collaborate with business teams to understand requirements\n• Present findings to management and stakeholders\n\nWhat We Offer:\n• Opportunity to work with cutting-edge data tools\n• Professional development in data analysis\n• Competitive benefits package\n• Work-life balance and flexible arrangements',
    location: 'Kigali, Rwanda',
    type: 'hybrid',
    salary: { min: 1000000, max: 1800000, currency: 'RWF' },
    job_category: 'finance',
    experience_level: 'mid',
    posted_at: new Date(),
    application_deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    expiry_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    requirements: [
      'Bachelor\'s degree in Economics, Statistics, Computer Science, or related field',
      '2+ years of data analysis experience',
      'Proficiency in Python, SQL, and Excel',
      'Experience with data visualization tools (Tableau, Power BI)',
      'Strong analytical and problem-solving skills',
      'Understanding of financial services industry',
      'Excellent communication and presentation skills'
    ],
    benefits: [
      'Competitive salary (RWF 1M - 1.8M)',
      'Comprehensive health insurance',
      'Professional development opportunities',
      'Pension plan and retirement benefits',
      'Flexible working arrangements',
      'Data analysis tools and software access',
      'Career advancement opportunities'
    ],
    skills: ['Python', 'SQL', 'Excel', 'Data Analysis', 'Statistics', 'Tableau', 'Problem Solving'],
    is_active: true,
    is_featured: true
  },
  
  {
    title: 'Frontend Developer - Entry Level',
    description: 'Perfect opportunity for recent graduates or career changers! Join our development team to build beautiful and functional user interfaces.\n\nKey Responsibilities:\n• Develop responsive web applications using modern frontend technologies\n• Collaborate with designers and backend developers\n• Implement user interface designs\n• Write clean, maintainable code\n• Learn and grow with our experienced team\n\nWhat We Offer:\n• Mentorship from senior developers\n• Learning and development opportunities\n• Modern tech stack and tools\n• Collaborative and supportive environment\n• Career growth path',
    location: 'Kigali, Rwanda',
    type: 'hybrid',
    salary: { min: 600000, max: 1000000, currency: 'RWF' },
    job_category: 'technology',
    experience_level: 'entry',
    posted_at: new Date(),
    application_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    expiry_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      'Basic knowledge of HTML, CSS, and JavaScript',
      'Familiarity with React or willingness to learn',
      'Understanding of responsive web design',
      'Strong problem-solving skills',
      'Good communication skills',
      'Passion for learning and growth'
    ],
    benefits: [
      'Competitive entry-level salary (RWF 600K - 1M)',
      'Health insurance coverage',
      'Learning and development budget',
      'Mentorship program',
      'Flexible working hours',
      'Team building activities',
      'Career advancement opportunities'
    ],
    skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git', 'Problem Solving', 'Teamwork'],
    is_active: true,
    is_featured: false
  }
];

const sampleLearningResources = [
  {
    title: "React.js Complete Course - From Beginner to Advanced",
    description: "Master React.js from basics to advanced concepts. Build modern web applications with hooks, state management, and routing. Perfect for developers looking to advance their React skills.",
    type: "course",
    category: "technical",
    skills: ["React", "JavaScript", "Frontend Development", "Hooks", "State Management"],
    difficulty: "intermediate",
    duration: 180,
    language: "en",
    content_url: "https://example.com/react-complete-course",
    thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    author: "Digital Skills Rwanda",
    source: "eMirimo",
    tags: ["react", "frontend", "javascript", "web-development"],
    views: 2100,
    likes: 156,
    bookmarks: 78,
    is_active: true,
    is_featured: true
  },
  
  {
    title: "Advanced JavaScript for Modern Web Development",
    description: "Deep dive into advanced JavaScript concepts including ES6+, async programming, and modern development patterns. Essential for serious web developers.",
    type: "course",
    category: "technical",
    skills: ["JavaScript", "ES6", "Async Programming", "Web Development"],
    difficulty: "intermediate",
    duration: 120,
    language: "en",
    content_url: "https://example.com/advanced-javascript",
    thumbnail_url: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400",
    author: "Tech Academy Rwanda",
    source: "eMirimo",
    tags: ["javascript", "programming", "web-development", "es6"],
    views: 1850,
    likes: 134,
    bookmarks: 67,
    is_active: true,
    is_featured: true
  },
  
  {
    title: "Digital Marketing Fundamentals",
    description: "Learn the fundamentals of digital marketing including social media, content creation, SEO, and analytics. Perfect for marketing professionals and entrepreneurs.",
    type: "course",
    category: "career",
    skills: ["Digital Marketing", "Social Media", "Content Creation", "SEO", "Analytics"],
    difficulty: "beginner",
    duration: 90,
    language: "en",
    content_url: "https://example.com/digital-marketing-fundamentals",
    thumbnail_url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400",
    author: "Marketing Institute Rwanda",
    source: "eMirimo",
    tags: ["digital-marketing", "social-media", "content-creation", "seo"],
    views: 3200,
    likes: 245,
    bookmarks: 123,
    is_active: true,
    is_featured: true
  },
  
  {
    title: "Python for Data Analysis and Visualization",
    description: "Master Python for data analysis using pandas, numpy, matplotlib, and seaborn. Learn to analyze data and create compelling visualizations.",
    type: "course",
    category: "technical",
    skills: ["Python", "Data Analysis", "Pandas", "NumPy", "Matplotlib", "Data Visualization"],
    difficulty: "intermediate",
    duration: 240,
    language: "en",
    content_url: "https://example.com/python-data-analysis",
    thumbnail_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    author: "Data Science Rwanda",
    source: "eMirimo",
    tags: ["python", "data-analysis", "pandas", "visualization"],
    views: 1890,
    likes: 134,
    bookmarks: 67,
    is_active: true,
    is_featured: false
  },
  
  {
    title: "SQL for Data Analysis",
    description: "Learn SQL from basics to advanced queries for data analysis. Essential skills for data analysts, business analysts, and anyone working with databases.",
    type: "course",
    category: "technical",
    skills: ["SQL", "Database", "Data Analysis", "Query Optimization"],
    difficulty: "beginner",
    duration: 60,
    language: "en",
    content_url: "https://example.com/sql-data-analysis",
    thumbnail_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400",
    author: "Database Academy Rwanda",
    source: "eMirimo",
    tags: ["sql", "database", "data-analysis", "queries"],
    views: 1650,
    likes: 98,
    bookmarks: 56,
    is_active: true,
    is_featured: false
  },
  
  {
    title: "Professional Communication Skills",
    description: "Develop your communication skills for professional success. Learn to present ideas clearly, write effective emails, and work effectively in teams.",
    type: "course",
    category: "soft-skills",
    skills: ["Communication", "Presentation", "Teamwork", "Professional Writing"],
    difficulty: "beginner",
    duration: 60,
    language: "en",
    content_url: "https://example.com/professional-communication",
    thumbnail_url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400",
    author: "Professional Development Hub",
    source: "eMirimo",
    tags: ["communication", "soft-skills", "professional", "presentation"],
    views: 2800,
    likes: 187,
    bookmarks: 94,
    is_active: true,
    is_featured: true
  }
];

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/emirimo');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    console.log('🗑️ Clearing all collections...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
    await LearningResource.deleteMany({});
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
}

async function createUsers() {
  const createdUsers = [];
  
  for (const userData of sampleUsers) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: userData.status === 'active' ? new Date() : null
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`✅ Created user: ${savedUser.name} (${savedUser.role}) - ${savedUser.email}`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.name}:`, error);
    }
  }
  
  return createdUsers;
}

async function createJobs(users) {
  const employers = users.filter(user => user.role === 'employer');
  const createdJobs = [];
  
  for (let i = 0; i < sampleJobs.length; i++) {
    try {
      const employer = employers[i % employers.length]; // Cycle through employers
      const jobData = {
        ...sampleJobs[i],
        employer_id: employer._id,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const job = new Job(jobData);
      const savedJob = await job.save();
      createdJobs.push(savedJob);
      console.log(`✅ Created job: ${savedJob.title} by ${employer.name}`);
    } catch (error) {
      console.error(`❌ Error creating job ${sampleJobs[i].title}:`, error);
    }
  }
  
  return createdJobs;
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
      console.log(`✅ Created learning resource: ${savedResource.title}`);
    } catch (error) {
      console.error(`❌ Error creating learning resource ${resourceData.title}:`, error);
    }
  }
  
  return createdResources;
}

async function createApplications(users, jobs) {
  const seekers = users.filter(user => user.role === 'seeker');
  const createdApplications = [];
  
  // Create realistic application scenarios for AI testing
  const applicationScenarios = [
    // Jean Baptiste applies to jobs that match his skills but has skill gaps
    {
      seekerEmail: 'jean.baptiste@example.com',
      jobTitle: 'Senior Software Developer - React Specialist',
      status: 'applied',
      cover_letter: 'I am very interested in this React developer position. While I have strong JavaScript and HTML skills, I am eager to learn React and advance my career in web development.',
      skill_gaps: ['React', 'Node.js', 'MongoDB'] // Skills he's missing
    },
    {
      seekerEmail: 'jean.baptiste@example.com',
      jobTitle: 'Frontend Developer - Entry Level',
      status: 'shortlisted',
      cover_letter: 'This entry-level frontend developer position is perfect for my career goals. I have the basic skills required and I am ready to grow with your team.',
      skill_gaps: ['React'] // Missing React but has other skills
    },
    
    // Marie Claire applies to marketing jobs
    {
      seekerEmail: 'marie.claire@example.com',
      jobTitle: 'Digital Marketing Manager',
      status: 'applied',
      cover_letter: 'I am excited about this digital marketing manager position. My experience in social media marketing and content creation aligns well with your requirements.',
      skill_gaps: ['SEO'] // Missing SEO but has other marketing skills
    },
    
    // Paul Nkurunziza applies to data analysis jobs
    {
      seekerEmail: 'paul.nkurunziza@example.com',
      jobTitle: 'Data Analyst - Financial Services',
      status: 'hired',
      cover_letter: 'This data analyst position is an excellent match for my skills and career aspirations. I have strong Python and data analysis experience.',
      skill_gaps: ['Tableau'] // Missing Tableau but has other data skills
    }
  ];
  
  for (const scenario of applicationScenarios) {
    try {
      const seeker = seekers.find(s => s.email === scenario.seekerEmail);
      const job = jobs.find(j => j.title === scenario.jobTitle);
      
      if (seeker && job) {
        const application = new Application({
          seeker_id: seeker._id,
          job_id: job._id,
          employer_id: job.employer_id,
          status: scenario.status,
          cover_letter: scenario.cover_letter,
          applied_at: new Date(),
          updated_at: new Date()
        });
        
        const savedApplication = await application.save();
        createdApplications.push(savedApplication);
        console.log(`✅ Created application: ${seeker.name} applied to ${job.title} (${scenario.status})`);
      }
    } catch (error) {
      console.error(`❌ Error creating application:`, error);
    }
  }
  
  return createdApplications;
}

async function createNotifications(users) {
  const notifications = [];
  
  const notificationTemplates = [
    {
      message: 'Welcome to eMirimo! Complete your profile to get personalized job recommendations.',
      type: 'system',
      priority: 'medium'
    },
    {
      message: 'New job opportunities matching your skills are available.',
      type: 'job_recommendation',
      priority: 'high'
    },
    {
      message: 'Your application status has been updated.',
      type: 'application_status_change',
      priority: 'medium'
    },
    {
      message: 'Check out our learning resources to upskill for better opportunities.',
      type: 'course_recommendation',
      priority: 'medium'
    },
    {
      message: 'Your profile has been verified successfully.',
      type: 'system',
      priority: 'low'
    },
    {
      message: 'You have new job recommendations based on your profile.',
      type: 'job_recommendation',
      priority: 'high'
    },
    {
      message: 'Don\'t forget to update your skills to get better job matches.',
      type: 'system',
      priority: 'medium'
    },
    {
      message: 'New courses are available to help you bridge skill gaps.',
      type: 'course_recommendation',
      priority: 'medium'
    }
  ];
  
  for (const user of users) {
    // Create 2-4 notifications per user
    const numNotifications = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numNotifications; i++) {
      try {
        const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
        const notification = new Notification({
          user_id: user._id,
          message: template.message,
          type: template.type,
          priority: template.priority,
          read_status: Math.random() > 0.6, // 40% chance of being read
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
        });
        
        const savedNotification = await notification.save();
        notifications.push(savedNotification);
      } catch (error) {
        console.error(`❌ Error creating notification for ${user.name}:`, error);
      }
    }
  }
  
  console.log(`✅ Created ${notifications.length} notifications`);
  return notifications;
}

async function clearAndSeed() {
  try {
    console.log('🚀 Starting comprehensive database clearing and seeding...');
    console.log('📊 This will clear all existing data and create fresh test data.\n');
    
    await connectToDatabase();
    await clearDatabase();
    
    console.log('\n👥 Creating users...');
    const users = await createUsers();
    
    console.log('\n💼 Creating jobs...');
    const jobs = await createJobs(users);
    
    console.log('\n📚 Creating learning resources...');
    const learningResources = await createLearningResources();
    
    console.log('\n📝 Creating applications...');
    const applications = await createApplications(users, jobs);
    
    console.log('\n🔔 Creating notifications...');
    await createNotifications(users);
    
    console.log('\n🎉 === SEEDING COMPLETE ===');
    console.log(`✅ Created ${users.length} users`);
    console.log(`✅ Created ${jobs.length} jobs`);
    console.log(`✅ Created ${learningResources.length} learning resources`);
    console.log(`✅ Created ${applications.length} applications`);
    
    console.log('\n🔑 Test Accounts:');
    console.log('Admin: admin@emirimo.com / admin@123');
    console.log('Job Seekers:');
    users.filter(u => u.role === 'seeker').forEach(user => {
      console.log(`  - ${user.name}: ${user.email} / password123`);
    });
    console.log('Employers:');
    users.filter(u => u.role === 'employer').forEach(user => {
      console.log(`  - ${user.name}: ${user.email} / password123`);
    });
    
    console.log('\n🧪 AI Testing Scenarios:');
    console.log('• Jean Baptiste has JavaScript/HTML skills but missing React - should get React course recommendations');
    console.log('• Marie Claire has marketing skills but missing SEO - should get SEO course recommendations');
    console.log('• Paul Nkurunziza has Python/Data Analysis but missing Tableau - should get Tableau course recommendations');
    
    console.log('\n🎯 Features to Test:');
    console.log('• AI job recommendations with "Recommended" tags');
    console.log('• Skill gap analysis and course suggestions');
    console.log('• Application pipeline and status tracking');
    console.log('• Admin dashboard with analytics');
    console.log('• Employer job management and application review');
    console.log('• Job seeker dashboard with personalized content');
    
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
    console.log('✨ Ready for testing! All features should work with the seeded data.');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run the seeding
clearAndSeed();

export { clearAndSeed };
