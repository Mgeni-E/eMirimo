import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { LearningResource } from '../dist/models/LearningResource.js';

dotenv.config();

// Sample learning content - LinkedIn style
const sampleLearningContent = [
  // Technical Skills
  {
    title: "JavaScript Fundamentals for Beginners",
    description: "Learn the basics of JavaScript programming including variables, functions, and DOM manipulation. Perfect for beginners starting their coding journey.",
    type: "video",
    category: "technical",
    skills: ["JavaScript", "Programming", "Web Development"],
    difficulty: "beginner",
    duration: 45,
    language: "en",
    content_url: "https://example.com/js-fundamentals",
    thumbnail_url: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400",
    author: "Tech Academy Rwanda",
    source: "eMirimo",
    tags: ["programming", "javascript", "beginner"],
    views: 1250,
    likes: 89,
    bookmarks: 45,
    is_active: true,
    is_featured: true
  },
  {
    title: "React.js Complete Course",
    description: "Master React.js from basics to advanced concepts. Build modern web applications with hooks, state management, and routing.",
    type: "course",
    category: "technical",
    skills: ["React", "JavaScript", "Frontend Development"],
    difficulty: "intermediate",
    duration: 180,
    language: "en",
    content_url: "https://example.com/react-course",
    thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    author: "Digital Skills Rwanda",
    source: "eMirimo",
    tags: ["react", "frontend", "javascript"],
    views: 2100,
    likes: 156,
    bookmarks: 78,
    is_active: true,
    is_featured: true
  },
  {
    title: "Python for Data Analysis",
    description: "Learn Python programming for data analysis using pandas, numpy, and matplotlib. Essential skills for data-driven careers.",
    type: "course",
    category: "technical",
    skills: ["Python", "Data Analysis", "Pandas", "NumPy"],
    difficulty: "intermediate",
    duration: 240,
    language: "en",
    content_url: "https://example.com/python-data",
    thumbnail_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    author: "Data Science Rwanda",
    source: "eMirimo",
    tags: ["python", "data-analysis", "programming"],
    views: 1890,
    likes: 134,
    bookmarks: 67,
    is_active: true,
    is_featured: false
  },

  // Soft Skills
  {
    title: "Effective Communication in the Workplace",
    description: "Develop your communication skills for professional success. Learn to present ideas clearly and work effectively in teams.",
    type: "video",
    category: "soft-skills",
    skills: ["Communication", "Presentation", "Teamwork"],
    difficulty: "beginner",
    duration: 60,
    language: "en",
    content_url: "https://example.com/communication",
    thumbnail_url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400",
    author: "Professional Development Hub",
    source: "eMirimo",
    tags: ["communication", "soft-skills", "professional"],
    views: 3200,
    likes: 245,
    bookmarks: 123,
    is_active: true,
    is_featured: true
  },
  {
    title: "Leadership Skills for Young Professionals",
    description: "Build essential leadership skills including decision-making, team management, and strategic thinking for career advancement.",
    type: "course",
    category: "soft-skills",
    skills: ["Leadership", "Management", "Decision Making"],
    difficulty: "intermediate",
    duration: 120,
    language: "en",
    content_url: "https://example.com/leadership",
    thumbnail_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    author: "Leadership Institute Rwanda",
    source: "eMirimo",
    tags: ["leadership", "management", "career"],
    views: 1650,
    likes: 98,
    bookmarks: 56,
    is_active: true,
    is_featured: false
  },

  // Career Development
  {
    title: "Building Your Professional Network",
    description: "Learn how to network effectively, build meaningful professional relationships, and advance your career through connections.",
    type: "article",
    category: "networking",
    skills: ["Networking", "Professional Relationships", "Career Development"],
    difficulty: "beginner",
    duration: 30,
    language: "en",
    content_url: "https://example.com/networking-guide",
    thumbnail_url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400",
    author: "Career Success Rwanda",
    source: "eMirimo",
    tags: ["networking", "career", "professional"],
    views: 2800,
    likes: 187,
    bookmarks: 94,
    is_active: true,
    is_featured: true
  },
  {
    title: "Resume Writing for Rwandan Job Market",
    description: "Create compelling resumes that stand out in Rwanda's competitive job market. Learn local hiring practices and expectations.",
    type: "guide",
    category: "resume",
    skills: ["Resume Writing", "Job Applications", "Career Development"],
    difficulty: "beginner",
    duration: 40,
    language: "en",
    content_url: "https://example.com/resume-guide",
    thumbnail_url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400",
    author: "Career Services Rwanda",
    source: "eMirimo",
    tags: ["resume", "job-application", "career"],
    views: 4200,
    likes: 312,
    bookmarks: 156,
    is_active: true,
    is_featured: true
  },

  // Interview Preparation
  {
    title: "Ace Your Job Interview",
    description: "Master interview techniques, common questions, and how to present yourself professionally. Boost your chances of landing the job.",
    type: "course",
    category: "interview",
    skills: ["Interview Skills", "Presentation", "Confidence"],
    difficulty: "beginner",
    duration: 90,
    language: "en",
    content_url: "https://example.com/interview-prep",
    thumbnail_url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400",
    author: "Interview Success Rwanda",
    source: "eMirimo",
    tags: ["interview", "job-search", "career"],
    views: 3500,
    likes: 267,
    bookmarks: 134,
    is_active: true,
    is_featured: true
  },

  // Rwanda-Specific Content
  {
    title: "Digital Skills for Rwanda's Economy",
    description: "Essential digital skills for Rwanda's growing tech economy. Learn about local opportunities and required competencies.",
    type: "video",
    category: "career",
    skills: ["Digital Skills", "Technology", "Rwanda Economy"],
    difficulty: "beginner",
    duration: 50,
    language: "en",
    content_url: "https://example.com/rwanda-digital-skills",
    thumbnail_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
    author: "Rwanda Digital Academy",
    source: "eMirimo",
    tags: ["digital-skills", "rwanda", "economy"],
    views: 2800,
    likes: 198,
    bookmarks: 89,
    is_active: true,
    is_featured: true
  },
  {
    title: "French for Business in Rwanda",
    description: "Learn essential French business vocabulary and communication skills for Rwanda's bilingual business environment.",
    type: "course",
    category: "soft-skills",
    skills: ["French", "Business Communication", "Language"],
    difficulty: "beginner",
    duration: 150,
    language: "fr",
    content_url: "https://example.com/french-business",
    thumbnail_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
    author: "Language Institute Rwanda",
    source: "eMirimo",
    tags: ["french", "business", "language"],
    views: 1200,
    likes: 87,
    bookmarks: 43,
    is_active: true,
    is_featured: false
  }
];

async function seedLearningContent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing learning resources
    await LearningResource.deleteMany({});
    console.log('🗑️ Cleared existing learning resources');

    // Insert sample learning content
    const createdResources = await LearningResource.insertMany(sampleLearningContent);
    console.log(`✅ Created ${createdResources.length} learning resources`);

    // Display summary
    const categories = await LearningResource.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Learning Resources by Category:');
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} resources`);
    });

    const difficulties = await LearningResource.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📈 Learning Resources by Difficulty:');
    difficulties.forEach(diff => {
      console.log(`  ${diff._id}: ${diff.count} resources`);
    });

    console.log('\n🎉 Learning content seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding learning content:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
seedLearningContent();
