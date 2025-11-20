import type { Request, Response } from 'express';
import { LearningResource } from '../models/LearningResource.js';
import { YouTubeService } from '../services/youtube.service.js';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Types } from 'mongoose';
import { CertificateService } from '../services/certificate.service.js';
import { 
  uploadCertificateToFirebase, 
  downloadCertificateFromFirebase,
  isFirebaseConfigured 
} from '../services/firebase-storage.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const youtubeService = new YouTubeService();
const certificateService = new CertificateService();

/**
 * Get all learning resources (includes YouTube if user is authenticated and has skills)
 */
export const getLearningResources = async (req: any, res: Response) => {
  try {
    const { category, difficulty, type, search, includeYouTube = 'true', forceRefresh = 'false' } = req.query;
    const userId = req.user?.uid;
    
    // Build filter for YouTube courses
    let filter: any = { 
      is_active: true,
      source: 'YouTube' // Only get YouTube courses from database
    };
    
    // Apply category filter if specified
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Apply difficulty filter if specified
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    
    // Apply type filter if specified
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    // Apply search filter if specified
    if (search) {
      filter.$and = [
        { $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { skills: { $in: [new RegExp(search, 'i')] } }
        ]}
      ];
    }

    // Get all YouTube courses from database (no date restriction for Learning page)
    let storedResources = await LearningResource.find(filter)
      .sort({ updated_at: -1, created_at: -1 })
      .limit(100)
      .lean();

    // If we have courses in database, return them (no API calls needed)
    if (storedResources.length > 0) {
      const allResources = storedResources.slice(0, 100);
      
      res.json({
        success: true,
        resources: allResources,
        total: allResources.length,
        inAppCount: 0,
        youtubeCount: allResources.length,
        source: 'database' // Indicate these are from database
      });
      return;
    }

    // Fetch fresh content from YouTube API and cache it
    console.log('🔄 Fetching fresh content from YouTube API and caching...');
    
    let youtubeResources: any[] = [];
    
    if (includeYouTube === 'true') {
      try {
        let userSkills: string[] = [];
        
        if (userId) {
          const user = await User.findById(userId);
          if (user && user.skills) {
            userSkills = (user.skills.map((s: any) => typeof s === 'string' ? s : s?.name || '') as string[]).slice(0, 5);
          }
        }
        
        if (userSkills.length === 0) {
          userSkills = ['programming', 'communication', 'career development', 'interview skills', 'resume writing'];
        }
        
        let playlists: any[] = [];
        let videos: any[] = [];
        
        try {
          playlists = await youtubeService.searchEducationalPlaylists(userSkills, difficulty || 'beginner', 20);
        } catch (playlistError: any) {
          if (playlistError?.response?.data?.error?.code === 403) {
            console.warn('⚠️  YouTube quota exceeded. Please run seeding script to store courses in database.');
          } else {
            console.error('Error fetching YouTube playlists:', playlistError.message);
          }
        }
        
        try {
          videos = await youtubeService.searchEducationalVideos(userSkills, difficulty || 'beginner', 20);
        } catch (videoError: any) {
          if (videoError?.response?.data?.error?.code === 403) {
            console.warn('⚠️  YouTube quota exceeded. Please run seeding script to store courses in database.');
          } else {
            console.error('Error fetching YouTube videos:', videoError.message);
          }
        }
        
        youtubeResources = [
          ...playlists.map(p => youtubeService.convertPlaylistToLearningResource(p, userSkills, category || 'technical', difficulty || 'beginner')),
          ...videos.map(v => youtubeService.convertToLearningResource(v, userSkills, category || 'technical', difficulty || 'beginner'))
        ];
      } catch (youtubeError: any) {
        console.error('Error fetching YouTube resources:', youtubeError.message);
        youtubeResources = [];
      }
    }

    // If we already have stored resources, skip API calls
    if (storedResources.length > 0) {
      // Resources already fetched from database above, skip to return
    } else {
      // Only fetch from API if no stored resources (fallback)
      // Organize resources by category: 100 upskilling courses total (25 rows × 4 cards)
      // Focus on career-wise, upskilling, modern skills, digital skills, communication, marketing, and technical skills
      // Maximum 25 minutes per video
      const categorySkills: { [key: string]: string[] } = {
      'digital-literacy-productivity': [
        'Google Digital Garage Digital Skills for Beginners',
        'Microsoft Digital Literacy Course Full Playlist',
        'Basic Computer Skills GCFLearnFree',
        'Introduction to ICT Skills Alison',
        'How to Use Google Workspace Docs Sheets Drive',
        'Microsoft Word Full Tutorial for Beginners Learnit Training',
        'Microsoft Excel Full Course Beginner to Advanced Kevin Stratvert',
        'PowerPoint Full Tutorial for Beginners Leila Gharani',
        'Internet Basics for Beginners GCFLearnFree',
        'Typing Tutorial Touch Typing for Beginners',
        'Email Etiquette Training Linda Raynier',
        'Computer Networking Basics PowerCert',
        'Cybersecurity for Beginners Simplilearn',
        'How to Use ChatGPT AI Tools Jeff Su',
        'Digital Communication Skills Harvard Online'
      ],
      'soft-skills-professional': [
        'Soft Skills Training Full Course Simplilearn',
        'Communication Skills Full Course Skillopedia',
        'Public Speaking Masterclass TED-Ed',
        'How to Speak So People Want to Listen Julian Treasure',
        'Critical Thinking Full Course Sprouts',
        'Problem Solving Skills Training HBR',
        'Teamwork Essentials Project Better Self',
        'Emotional Intelligence Full Course Evelyn Learning',
        'Leadership Skills for Beginners Brian Tracy',
        'Negotiation Skills for Life Chris Voss',
        'Time Management Skills Productivity Game',
        'Professional Etiquette and Work Ethics',
        'Creativity Innovation Skills CrashCourse',
        'Decision-Making Skills Sprouts',
        'Assertiveness Training Psych2Go',
        'Conflict Management Skills MindTools',
        'Adaptability Resilience Skills Improvement Pill',
        'How to Work Under Pressure Amy Morin',
        'Listening Skills Training Communication Coach',
        'Body Language for Job Success Vanessa Van Edwards'
      ],
      'entrepreneurship-business': [
        'Entrepreneurship Full Course Simplilearn',
        'How to Start a Business Beginner Guide HubSpot',
        'Business Model Canvas Explained Strategyzer',
        'Financial Literacy for Beginners The Plain Bagel',
        'Personal Finance Basics Two Cents',
        'Sales Skills Training Grant Cardone',
        'Marketing for Beginners HubSpot Academy',
        'Social Media Marketing Full Course Simplilearn',
        'Graphic Design for Beginners Canva',
        'Intro to E-Commerce Shopify Tutorials',
        'Startup Basics for Young Entrepreneurs Y Combinator',
        'How to Write a Business Plan BOSS Academy',
        'Accounting Basics for Beginners Accounting Stuff',
        'Entrepreneur Mindset Playlist GaryVee',
        'Customer Service Skills Training Dani Johnson'
      ],
      'job-search-career': [
        'Career Readiness Competencies Explained NACE',
        'How to Write a CV Resume Linda Raynier',
        'How to Write a Cover Letter Harvard Career Services',
        'How to Pass Any Job Interview Dan Lok',
        'STAR Interview Method Training Jeff Su',
        'Common Interview Questions How to Answer Andrew LaCivita',
        'How to Choose a Career Path CrashCourse Career',
        'Personal Branding for Beginners HubSpot',
        'Portfolio Building for Beginners Envato',
        'LinkedIn Profile Optimization Jeff Su',
        'Communication for Job Interviews HBR',
        'How to Negotiate Salary Chris Voss',
        'How to Network Professionally Vanessa Van Edwards',
        'Freelancing Skills for Beginners FreeCodeCamp',
        'Workplace Professionalism Work Ethics GCFLearnFree'
      ],
      'technology-digital-careers': [
        'Introduction to Coding for Beginners FreeCodeCamp',
        'HTML CSS Full Course FreeCodeCamp',
        'JavaScript Full Tutorial Programming with Mosh',
        'Python for Beginners 4-hour Course Programming with Mosh',
        'Data Analysis for Beginners Alex The Analyst',
        'SQL Full Course FreeCodeCamp',
        'Power BI Full Tutorial Simplilearn',
        'Excel for Data Analysis Chandoo',
        'AI for Beginners Google AI Basics',
        'Machine Learning Crash Course StatQuest',
        'UI UX Design Beginners Course Figma Tutorials',
        'Graphic Design Basics Envato Tuts',
        'Web Development for Beginners Traversy Media',
        'Mobile App Development Flutter Basics The Net Ninja',
        'Cloud Computing Basics AWS Cloud',
        'Blockchain Basics 101 Blockchains',
        'Cybersecurity Essentials Simplilearn',
        'IT Support Essential Training Google IT Support',
        'Digital Marketing Analytics Google Analytics Academy',
        'Creative Coding with Scratch Beginners MIT Scratch'
      ],
      'personal-development-workplace': [
        'Goal Setting Masterclass Improvement Pill',
        'How to Build Confidence TedX Compilation',
        'Growth Mindset Training Carol Dweck',
        'How to Learn Faster Thomas Frank',
        'Personal Productivity Ali Abdaal',
        'Stress Management Techniques Therapy in a Nutshell',
        'Habits That Improve Your Career James Clear',
        'Focus Concentration Training Better Than Yesterday',
        'How to Become More Disciplined Brandon Carter',
        'Work-Life Balance Essentials HBR',
        'Emotional Control Self-Management Psych2Go',
        'How to Build Relationships at Work Harvard Business',
        'Decision-Making Under Uncertainty Sprouts',
        'Confidence in Communication Charisma on Command',
        'How to Learn Any Skill Fast Veritasium'
      ]
    };

    // Fetch courses for each category
    const categorizedResources: { [key: string]: any[] } = {
      'digital-literacy-productivity': [],
      'soft-skills-professional': [],
      'entrepreneurship-business': [],
      'job-search-career': [],
      'technology-digital-careers': [],
      'personal-development-workplace': []
    };

    // Fetch courses per category - search with all skills together to reduce API calls
    for (const [category, skills] of Object.entries(categorySkills)) {
      try {
        // Search with all skills in one query to reduce API calls (avoids quota issues)
        // Use first 5 skills from the list to create a focused search query
        const searchSkills = skills.slice(0, 5);
        
        // Initialize category array if not exists
        if (!categorizedResources[category]) {
          categorizedResources[category] = [];
        }
        
        // Get more results per search to ensure we have enough
        // Catch individual API errors to prevent one failure from breaking everything
        let categoryPlaylists: any[] = [];
        let categoryVideos: any[] = [];
        
        try {
          categoryPlaylists = await youtubeService.searchEducationalPlaylists(searchSkills, difficulty || 'beginner', 20);
        } catch (playlistError: any) {
          // If quota exceeded, log and continue with empty array
          if (playlistError?.response?.data?.error?.code === 403) {
            console.warn(`YouTube quota exceeded for ${category} playlists, skipping...`);
          } else {
            console.error(`Error fetching ${category} playlists:`, playlistError.message);
          }
        }
        
        try {
          categoryVideos = await youtubeService.searchEducationalVideos(searchSkills, difficulty || 'beginner', 20);
        } catch (videoError: any) {
          // If quota exceeded, log and continue with empty array
          if (videoError?.response?.data?.error?.code === 403) {
            console.warn(`YouTube quota exceeded for ${category} videos, skipping...`);
          } else {
            console.error(`Error fetching ${category} videos:`, videoError.message);
          }
        }
        
        // Remove duplicates by video/playlist ID
        const uniquePlaylists = Array.from(new Map(categoryPlaylists.map(p => [p.playlistId, p])).values());
        const uniqueVideos = Array.from(new Map(categoryVideos.map(v => [v.videoId, v])).values());
        
        categorizedResources[category] = [
          ...uniquePlaylists.map(p => youtubeService.convertPlaylistToLearningResource(p, skills, category, difficulty || 'beginner')),
          ...uniqueVideos.map(v => youtubeService.convertToLearningResource(v, skills, category, difficulty || 'beginner'))
        ].slice(0, 30); // Get 30 per category to ensure enough
      } catch (error: any) {
        console.error(`Error fetching ${category} resources:`, error.message);
        // Ensure category array exists even on error
        if (!categorizedResources[category]) {
          categorizedResources[category] = [];
        }
        // Continue with next category even if this one fails
      }
    }

      // Combine and organize: 100 upskilling courses total (25 rows × 4 cards)
      // Safely handle undefined categories
      const allResources = [
        ...(categorizedResources['digital-literacy-productivity'] || []).slice(0, 15),
        ...(categorizedResources['soft-skills-professional'] || []).slice(0, 20),
        ...(categorizedResources['entrepreneurship-business'] || []).slice(0, 15),
        ...(categorizedResources['job-search-career'] || []).slice(0, 15),
        ...(categorizedResources['technology-digital-careers'] || []).slice(0, 20),
        ...(categorizedResources['personal-development-workplace'] || []).slice(0, 15)
      ];

      // Cache API results in database for future requests (smart caching)
      if (allResources.length > 0) {
        console.log(`💾 Caching ${allResources.length} courses in database...`);
        const cachePromises = allResources.map(async (resource: any) => {
          try {
            const videoId = resource.video_id || resource._id;
            if (!videoId) return;

            const resourceData = {
              ...resource,
              _id: videoId,
              source: 'YouTube',
              isYouTube: true,
              is_active: true,
              status: 'published',
              updated_at: new Date(), // Mark as freshly cached
              created_by: resource.created_by || new Types.ObjectId()
            };

            await LearningResource.findOneAndUpdate(
              { _id: videoId },
              resourceData,
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          } catch (cacheError: any) {
            console.error('Error caching resource:', cacheError.message);
            // Continue with other resources even if one fails
          }
        });

        // Cache in background (don't block response)
        Promise.all(cachePromises).catch(err => {
          console.error('Error caching resources:', err);
        });
      }

      res.json({
        success: true,
        resources: allResources,
        total: allResources.length,
        inAppCount: 0, // No in-app resources, only YouTube
        youtubeCount: allResources.length,
        source: 'api-fresh' // Indicate these are fresh from API and being cached
      });
    }
  } catch (error: any) {
    console.error('Get learning resources error:', error);
    // Return empty array instead of 500 error
    res.json({
      success: true,
      resources: [],
      total: 0,
      inAppCount: 0,
      youtubeCount: 0,
      error: error.message || 'Failed to fetch learning resources'
    });
  }
};

/**
 * Get learning resources with YouTube integration (courses and videos)
 */
export const getLearningResourcesWithYouTube = async (req: any, res: Response) => {
  try {
    const { skills, difficulty = 'beginner', includeCourses = 'true' } = req.query;
    
    // ONLY use YouTube resources - no database resources
    let youtubeResources: any[] = [];
    
    // Get YouTube resources if skills are provided
    if (skills) {
      const skillArray = skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      
      // Get YouTube playlists (courses) - prioritize these
      if (includeCourses === 'true') {
        const youtubePlaylists = await youtubeService.searchEducationalPlaylists(skillArray, difficulty, 10);
        const playlistResources = youtubePlaylists.map(playlist => 
          youtubeService.convertPlaylistToLearningResource(playlist, skillArray, 'technical', difficulty)
        );
        youtubeResources.push(...playlistResources);
      }
      
      // Get individual YouTube videos
      const youtubeVideos = await youtubeService.searchEducationalVideos(skillArray, difficulty, 15);
      const videoResources = youtubeVideos.map(video => 
        youtubeService.convertToLearningResource(video, skillArray, 'technical', difficulty)
      );
      youtubeResources.push(...videoResources);
    }

    // Sort YouTube resources only
    const allResources = youtubeResources
      .sort((a, b) => {
        // Prioritize courses first
        if (a.type === 'course' && b.type !== 'course') return -1;
        if (a.type !== 'course' && b.type === 'course') return 1;
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });

    res.json({
      success: true,
      resources: allResources,
      total: allResources.length,
      inAppCount: 0, // No in-app resources, only YouTube
      youtubeCount: youtubeResources.length
    });
  } catch (error) {
    console.error('Get learning resources with YouTube error:', error);
    res.status(500).json({ error: 'Failed to fetch learning resources' });
  }
};

/**
 * Get personalized course recommendations based on user profile and job market
 */
export const getCourseRecommendations = async (req: any, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'seeker') {
      return res.status(403).json({ error: 'Only job seekers can get course recommendations' });
    }

    // Get user skills
      const userSkills = (user.skills?.map((s: any) => typeof s === 'string' ? s : s?.name || '') || []) as string[];
    
    // FIRST: Try to get personalized recommendations from stored database courses
    // This avoids API calls and quota issues
    let storedRecommendations = await LearningResource.find({
      is_active: true,
      $or: [
        { source: 'YouTube' },
        { isYouTube: true }
      ]
    })
      .sort({ created_at: -1 })
      .limit(100)
      .lean();

    // If we have stored courses, personalize them based on user skills
    if (storedRecommendations.length > 0) {
      // Get active jobs to identify market demands for skill gap analysis
      const activeJobs = await Job.find({ is_active: true })
        .select('skills requirements experience_level')
        .limit(100);

      const marketSkills = new Set<string>();
      activeJobs.forEach((job: any) => {
        if (job.skills && Array.isArray(job.skills)) {
          job.skills.forEach((skill: string) => marketSkills.add(skill.toLowerCase()));
        }
        if (job.requirements && typeof job.requirements === 'string') {
          const reqText = job.requirements.toLowerCase();
          ['javascript', 'python', 'react', 'node', 'sql', 'communication', 'leadership', 'project management', 'marketing', 'design', 'business', 'entrepreneurship'].forEach(skill => {
            if (reqText.includes(skill)) marketSkills.add(skill);
          });
        }
      });

      const userSkillsLower = userSkills.map((s: string) => s.toLowerCase());
      const skillGaps = Array.from(marketSkills).filter(skill => 
        !userSkillsLower.some((userSkill: string) => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );

      // Score courses based on user skills match
      const scoredRecommendations = storedRecommendations.map((resource: any) => {
        const resourceSkills = (resource.skills || []).map((s: string) => s.toLowerCase());
        const matchingSkills = userSkillsLower.filter((userSkill: string) =>
          resourceSkills.some((rs: string) => rs.includes(userSkill) || userSkill.includes(rs))
        );
        const matchScore = userSkills.length > 0 
          ? matchingSkills.length / Math.max(userSkills.length, resourceSkills.length)
          : 0.7;

        return {
          ...resource,
          matchScore: Math.max(0.5, Math.min(1.0, matchScore)),
          relevanceScore: matchScore
        };
      });

      // Get completed courses to exclude
      const completedResources = await LearningResource.find({
        'user_interactions': {
          $elemMatch: {
            user_id: userId,
            interaction_type: 'complete'
          }
        },
        source: 'YouTube'
      }).select('_id video_id').lean();
      
      const completedIds = new Set(
        completedResources.map((r: any) => r._id?.toString() || r.video_id)
      );

      // Sort by match score, exclude completed, and return top recommendations
      const topRecommendations = scoredRecommendations
        .filter((r: any) => {
          const resourceId = r._id?.toString() || r.video_id;
          return !completedIds.has(resourceId);
        })
        .sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 100); // Return up to 100 courses for Learning page

      res.json({
        success: true,
        resources: topRecommendations,
        skillGaps: skillGaps.slice(0, 10),
        total: topRecommendations.length,
        coursesCount: topRecommendations.length,
        videosCount: 0,
        inAppCount: 0,
        source: 'database'
      });
      return;
    }

    // FALLBACK: Only use API if no stored courses (should rarely happen)
    console.warn('⚠️  No stored courses found. Using YouTube API (may hit quota limits)...');
    
    // Get active jobs to identify market demands
    const activeJobs = await Job.find({ is_active: true })
      .select('skills requirements experience_level')
      .limit(100);

    // Extract skills from job market
    const marketSkills = new Set<string>();
    activeJobs.forEach((job: any) => {
      if (job.skills && Array.isArray(job.skills)) {
        job.skills.forEach((skill: string) => marketSkills.add(skill.toLowerCase()));
      }
      if (job.requirements && typeof job.requirements === 'string') {
        const reqText = job.requirements.toLowerCase();
        ['javascript', 'python', 'react', 'node', 'sql', 'communication', 'leadership', 'project management', 'marketing', 'design', 'business', 'entrepreneurship'].forEach(skill => {
          if (reqText.includes(skill)) marketSkills.add(skill);
        });
      }
    });

    // Identify skill gaps
    const userSkillsLower = userSkills.map((s: string) => s.toLowerCase());
    const skillGaps = Array.from(marketSkills).filter(skill => 
      !userSkillsLower.some((userSkill: string) => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );

    // Combine user skills and skill gaps for recommendations
    const allSkills = [...userSkills, ...skillGaps.slice(0, 5)].slice(0, 10);
    
    if (allSkills.length === 0) {
      allSkills.push('programming', 'communication', 'career development');
    }

    // Organize resources by category: 25 courses per category = 100 total (25 rows × 4 cards)
    // Focus on Rwanda youth career skills gap
    const categorySkills: { [key: string]: string[] } = {
      'digital-ict': [
        'digital literacy Rwanda', 'computer basics Rwanda', 'Microsoft Office tutorial', 'Excel skills Rwanda',
        'Word processing skills', 'PowerPoint presentation', 'internet skills Rwanda', 'email communication',
        'social media for business', 'digital marketing basics', 'web development beginner', 'coding for beginners',
        'programming fundamentals', 'mobile app development', 'data entry skills', 'online safety Rwanda',
        'cybersecurity basics', 'cloud computing basics', 'IT support skills', 'database basics',
        'graphic design basics', 'video editing basics', 'digital photography', 'e-commerce basics',
        'online business skills'
      ],
      'technical-vocational': [
        'vocational training Rwanda', 'technical skills Rwanda', 'construction skills', 'carpentry basics',
        'plumbing skills', 'electrical work basics', 'welding training', 'masonry skills',
        'automotive repair', 'mechanical skills', 'agriculture skills Rwanda', 'farming techniques',
        'livestock management', 'crop production', 'irrigation systems', 'food processing',
        'tailoring and fashion', 'sewing skills', 'textile design', 'hairdressing skills',
        'beauty therapy', 'cooking skills', 'baking techniques', 'hospitality skills',
        'tourism Rwanda'
      ],
      'soft-skills': [
        'communication skills Rwanda', 'public speaking', 'presentation skills', 'teamwork skills',
        'leadership development', 'time management', 'problem solving', 'critical thinking',
        'emotional intelligence', 'conflict resolution', 'negotiation skills', 'customer service',
        'interpersonal skills', 'active listening', 'assertiveness training', 'stress management',
        'work ethic', 'professionalism', 'adaptability', 'creativity skills',
        'decision making', 'goal setting', 'self confidence', 'motivation skills',
        'networking skills'
      ],
      'quality-occupational': [
        'job readiness Rwanda', 'resume writing Rwanda', 'CV writing skills', 'cover letter writing',
        'job interview skills', 'job application process', 'career planning', 'professional development',
        'workplace etiquette', 'quality standards', 'occupational safety', 'workplace health',
        'productivity skills', 'efficiency training', 'quality control', 'process improvement',
        'workplace communication', 'professional networking', 'career advancement', 'skill certification',
        'industry standards', 'best practices', 'workplace ethics', 'professional growth',
        'employment skills Rwanda'
      ]
    };

    // Fetch courses for each category
    const categorizedResources: { [key: string]: any[] } = {
      'digital-ict': [],
      'technical-vocational': [],
      'soft-skills': [],
      'quality-occupational': []
    };

    // Fetch courses per category - search with all skills together to reduce API calls
    for (const [category, skills] of Object.entries(categorySkills)) {
      try {
        // Search with all skills in one query to reduce API calls (avoids quota issues)
        // Use first 5 skills from the list to create a focused search query
        const searchSkills = skills.slice(0, 5);
        
        // Initialize category array if not exists
        if (!categorizedResources[category]) {
          categorizedResources[category] = [];
        }
        
        // Get more results per search to ensure we have enough
        // Catch individual API errors to prevent one failure from breaking everything
        let categoryPlaylists: any[] = [];
        let categoryVideos: any[] = [];
        
        try {
          categoryPlaylists = await youtubeService.searchEducationalPlaylists(searchSkills, 'beginner', 20);
        } catch (playlistError: any) {
          // If quota exceeded, log and continue with empty array
          if (playlistError?.response?.data?.error?.code === 403) {
            console.warn(`YouTube quota exceeded for ${category} playlists, skipping...`);
          } else {
            console.error(`Error fetching ${category} playlists:`, playlistError.message);
          }
        }
        
        try {
          categoryVideos = await youtubeService.searchEducationalVideos(searchSkills, 'beginner', 20);
        } catch (videoError: any) {
          // If quota exceeded, log and continue with empty array
          if (videoError?.response?.data?.error?.code === 403) {
            console.warn(`YouTube quota exceeded for ${category} videos, skipping...`);
          } else {
            console.error(`Error fetching ${category} videos:`, videoError.message);
          }
        }
        
        // Remove duplicates by video/playlist ID
        const uniquePlaylists = Array.from(new Map(categoryPlaylists.map(p => [p.playlistId, p])).values());
        const uniqueVideos = Array.from(new Map(categoryVideos.map(v => [v.videoId, v])).values());
        
        categorizedResources[category] = [
          ...uniquePlaylists.map(p => youtubeService.convertPlaylistToLearningResource(p, skills, category, 'beginner')),
          ...uniqueVideos.map(v => youtubeService.convertToLearningResource(v, skills, category, 'beginner'))
        ].slice(0, 30); // Get 30 per category to ensure enough
      } catch (error: any) {
        console.error(`Error fetching ${category} resources:`, error.message);
        // Ensure category array exists even on error
        if (!categorizedResources[category]) {
          categorizedResources[category] = [];
        }
        // Continue with next category even if this one fails
      }
    }

    // Combine and organize: 100 upskilling courses total (25 rows × 4 cards)
    // Safely handle undefined categories
    const courseResources = [
      ...(categorizedResources['digital-literacy-productivity'] || []).slice(0, 15),
      ...(categorizedResources['soft-skills-professional'] || []).slice(0, 20),
      ...(categorizedResources['entrepreneurship-business'] || []).slice(0, 15),
      ...(categorizedResources['job-search-career'] || []).slice(0, 15),
      ...(categorizedResources['technology-digital-careers'] || []).slice(0, 20),
      ...(categorizedResources['personal-development-workplace'] || []).slice(0, 15)
    ];
    
    const videoResources: any[] = []; // Not needed for recommendations, using courses only

    // Get user's completed courses to exclude them (only YouTube resources)
    const completedResources = await LearningResource.find({
      'user_interactions': {
        $elemMatch: {
          user_id: userId,
          interaction_type: 'complete'
        }
      },
      $or: [
        { source: 'YouTube' },
        { video_id: { $exists: true } },
        { video_url: { $exists: true } }
      ]
    }).select('_id video_id').lean();
    
    const completedIds = new Set(
      completedResources.map((r: any) => r._id?.toString() || r.video_id)
    );

    // ONLY use YouTube resources - no database resources
    const allResources = courseResources
      .filter(resource => {
        // Exclude completed courses
        const resourceId = resource._id?.toString() || resource.video_id;
        return !completedIds.has(resourceId);
      })
      .slice(0, 100); // Return 100 courses (25 rows x 4 cards)

    // Always return success even if no resources found
    res.json({
      success: true,
      resources: allResources,
      skillGaps: skillGaps.slice(0, 10),
      total: allResources.length,
      coursesCount: allResources.length, // All are courses/playlists
      videosCount: 0, // Using courses only
      inAppCount: 0 // No in-app resources, only YouTube
    });
  } catch (error: any) {
    console.error('Get course recommendations error:', error);
    // Return empty array instead of 500 error to prevent frontend crashes
    res.json({
      success: true,
      resources: [],
      skillGaps: [],
      total: 0,
      coursesCount: 0,
      videosCount: 0,
      inAppCount: 0,
      error: error.message || 'Failed to fetch course recommendations'
    });
  }
};

/**
 * Get learning resource by ID (supports both database IDs and YouTube video/playlist IDs)
 */
export const getLearningResource = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if it's a YouTube ID first (before trying MongoDB lookup)
    // YouTube video IDs are 11 chars, playlist IDs start with "PL" and are 34+ chars
    const isYouTubeVideoId = id.length === 11 && !id.includes('-');
    const isYouTubePlaylistId = id.startsWith('PL') || (id.length > 20 && !/^[0-9a-fA-F]{24}$/.test(id));
    
    let resource: any = null;
    
    // If it's a YouTube ID, fetch directly from YouTube
    if (isYouTubeVideoId || isYouTubePlaylistId) {
      try {
        if (isYouTubeVideoId) {
          // Single video - fetch directly by ID
          const video = await youtubeService.getVideoById(id);
          if (video) {
            resource = youtubeService.convertToLearningResource(video, ['tutorial'], 'technical', 'beginner');
            resource._id = id;
            resource.video_id = id;
            resource.video_url = `https://www.youtube.com/watch?v=${id}`;
            resource.isYouTube = true;
          }
        } else if (isYouTubePlaylistId) {
          // Playlist - fetch directly by ID
          const playlist = await youtubeService.getPlaylistById(id);
          if (playlist) {
            // Get playlist videos
            const playlistVideos = await youtubeService.getPlaylistVideos(id, 50);
            resource = youtubeService.convertPlaylistToLearningResource(playlist, ['course'], 'technical', 'beginner');
            resource._id = id;
            resource.video_id = id;
            resource.playlist_id = id;
            resource.video_url = `https://www.youtube.com/playlist?list=${id}`;
            resource.isYouTube = true;
            resource.playlistVideos = playlistVideos; // Include all videos in playlist
          }
        }
      } catch (youtubeError: any) {
        console.error('Error fetching from YouTube:', youtubeError.message);
      }
    } else {
      // Try to find in database (MongoDB ObjectId)
      try {
        resource = await LearningResource.findById(id);
      } catch (dbError: any) {
        // If it's not a valid ObjectId, it might still be a YouTube ID
        console.log('Not a valid MongoDB ObjectId, trying YouTube...');
      }
    }
    
    if (!resource) {
      return res.status(404).json({ error: 'Learning resource not found' });
    }

    // Increment view count if it's in database
    if (resource._id && !resource.isYouTube) {
      await LearningResource.findByIdAndUpdate(resource._id, { 
        $inc: { 'metrics.views': 1, views: 1 } 
    });
    }

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Get learning resource error:', error);
    res.status(500).json({ error: 'Failed to fetch learning resource' });
  }
};

/**
 * Create a new learning resource (for admins)
 */
export const createLearningResource = async (req: any, res: Response) => {
  try {
    const resourceData = req.body;
    
    const resource = await LearningResource.create(resourceData);
    
    res.status(201).json({
      success: true,
      resource,
      message: 'Learning resource created successfully'
    });
  } catch (error) {
    console.error('Create learning resource error:', error);
    res.status(500).json({ error: 'Failed to create learning resource' });
  }
};

/**
 * Update learning resource (for admins)
 */
export const updateLearningResource = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const resource = await LearningResource.findByIdAndUpdate(
      id, 
      { ...updateData, updated_at: new Date() }, 
      { new: true }
    );
    
    if (!resource) {
      return res.status(404).json({ error: 'Learning resource not found' });
    }

    res.json({
      success: true,
      resource,
      message: 'Learning resource updated successfully'
    });
  } catch (error) {
    console.error('Update learning resource error:', error);
    res.status(500).json({ error: 'Failed to update learning resource' });
  }
};

/**
 * Delete learning resource (for admins)
 */
export const deleteLearningResource = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const resource = await LearningResource.findByIdAndDelete(id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Learning resource not found' });
    }

    res.json({
      success: true,
      message: 'Learning resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete learning resource error:', error);
    res.status(500).json({ error: 'Failed to delete learning resource' });
  }
};

/**
 * Mark course as complete for user
 */
export const markCourseComplete = async (req: any, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if resource exists (in DB or YouTube)
    let resource = await LearningResource.findById(id).lean();
    
    // If not in DB, try to find by video_id
    if (!resource) {
      resource = await LearningResource.findOne({ video_id: id }).lean();
    }
    
    // If still not found, it might be a YouTube resource - fetch from YouTube or create minimal record
    if (!resource) {
      // Try to fetch from YouTube API
      try {
        const video = await youtubeService.getVideoById(id);
        if (video) {
          const converted = youtubeService.convertToLearningResource(video, ['tutorial'], 'technical', 'beginner');
          resource = await LearningResource.create({
            ...converted,
            _id: id,
            video_id: id
          });
        }
      } catch (youtubeError) {
        // Create a minimal learning resource record for tracking
        resource = await LearningResource.create({
          _id: id,
          title: `YouTube Resource ${id}`,
          description: 'YouTube learning resource',
          type: 'video',
          category: 'technical',
          skills: [],
          difficulty: 'beginner',
          duration: 0,
          language: 'en',
          is_active: true,
          created_by: userId
        });
      }
    }

    // Check if course is already completed
    // completed_courses is nested under job_seeker_profile
    const completedCourses = user.job_seeker_profile?.completed_courses || [];
    const existingCompletion = completedCourses.find(
      (c: any) => c.course_id?.toString() === (resource?._id?.toString() || id)
    );

    if (existingCompletion) {
      return res.json({
        success: true,
        message: 'Course already completed',
        completed: true,
        certificate_id: existingCompletion.certificate_id,
        certificate_url: existingCompletion.certificate_url
      });
    }

    // Generate certificate
    const certificateId = certificateService.generateCertificateId(userId, resource?._id?.toString() || id);
    const completionDate = new Date();
    
    const certificateData = {
      userName: user.name,
      courseTitle: resource?.title || 'Course',
      courseCategory: resource?.category || 'general',
      completionDate,
      certificateId,
      skills: resource?.skills || [],
      duration: resource?.duration
    };

    // Generate PDF certificate
    const certificateBuffer = await certificateService.generateCertificate(certificateData);
    
    let certificateUrl: string;
    
    // Use Firebase Storage if configured (works in both development and production)
    if (isFirebaseConfigured()) {
      try {
        // Upload to Firebase Storage
        certificateUrl = await uploadCertificateToFirebase(certificateBuffer, certificateId, userId);
        console.log('✅ Certificate uploaded to Firebase Storage:', certificateUrl);
      } catch (firebaseError: any) {
        console.error('⚠️  Firebase upload failed, falling back to local storage:', firebaseError.message);
        // Fallback to local filesystem if Firebase fails
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const certificatesDir = path.join(__dirname, '../../certificates');
        
        if (!fs.existsSync(certificatesDir)) {
          fs.mkdirSync(certificatesDir, { recursive: true });
        }
        
        const certificatePath = path.join(certificatesDir, `${certificateId}.pdf`);
        fs.writeFileSync(certificatePath, certificateBuffer);
        certificateUrl = `/api/learning/certificates/${certificateId}/download`;
        console.log('✅ Certificate saved to local filesystem (fallback):', certificatePath);
      }
    } else {
      // Local filesystem fallback when Firebase is not configured
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const certificatesDir = path.join(__dirname, '../../certificates');
      
      if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir, { recursive: true });
      }
      
      const certificatePath = path.join(certificatesDir, `${certificateId}.pdf`);
      fs.writeFileSync(certificatePath, certificateBuffer);
      certificateUrl = `/api/learning/certificates/${certificateId}/download`;
      console.log('✅ Certificate saved to local filesystem (Firebase not configured):', certificatePath);
    }

    // Update LearningResource with completion interaction
    const existingInteraction = resource?.user_interactions?.find(
      (interaction: any) => 
        interaction.user_id?.toString() === userId && 
        interaction.interaction_type === 'complete'
    );

    if (!existingInteraction && resource?._id) {
      await LearningResource.findByIdAndUpdate(resource._id, {
        $push: {
          user_interactions: {
            user_id: userId,
            interaction_type: 'complete',
            progress: 100,
            last_accessed: completionDate,
            created_at: completionDate
          }
        }
      });
    }

    // Add to user's completed courses with certificate
    // Ensure we use the correct course_id - prefer resource._id, but handle string IDs
    let courseId: any;
    if (resource?._id) {
      courseId = resource._id;
    } else if (id && Types.ObjectId.isValid(id)) {
      courseId = new Types.ObjectId(id);
    } else {
      // If id is not a valid ObjectId, try to find the resource by other means
      courseId = new Types.ObjectId(); // Create new ObjectId as fallback
      console.warn('Using fallback ObjectId for course completion:', { id, resourceId: resource?._id });
    }
    
    const courseCompletion = {
      course_id: courseId,
      course_title: resource?.title || 'Course',
      course_category: resource?.category || 'general',
      completed_at: completionDate,
      certificate_id: certificateId,
      certificate_url: certificateUrl,
      skills_earned: resource?.skills || [],
      progress: 100
    };
    
    console.log('Saving course completion:', {
      courseId: courseId.toString(),
      resourceId: resource?._id?.toString(),
      providedId: id,
      certificateId,
      courseTitle: courseCompletion.course_title
    });

    // Save completion to user's completed_courses
    // IMPORTANT: completed_courses is nested under job_seeker_profile
    try {
      const updateResult = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            'job_seeker_profile.completed_courses': courseCompletion
          },
          $addToSet: {
            'job_seeker_profile.certifications': {
              name: resource?.title || 'Course Completion',
              issuer: 'eMirimo',
              issue_date: completionDate,
              credential_id: certificateId,
              credential_url: certificateUrl,
              skills: resource?.skills || []
            }
          }
        },
        { new: true } // Return updated document
      );
      
      // Verify the completion was saved
      if (!updateResult) {
        console.error('Failed to save completion to user profile');
        throw new Error('Failed to save course completion');
      }
      
      // Immediately verify the saved completion by re-fetching
      const savedUser = await User.findById(userId).lean();
      const completedCourses = savedUser?.job_seeker_profile?.completed_courses || [];
      const savedCompletion = completedCourses.find(
        (c: any) => c.certificate_id === certificateId
      );
      
      if (!savedCompletion) {
        console.error('❌ CRITICAL: Completion was not found after save!', {
          certificateId,
          courseId: courseCompletion.course_id?.toString(),
          hasJobSeekerProfile: !!savedUser?.job_seeker_profile,
          completedCoursesCount: completedCourses.length,
          allCompletions: completedCourses.map((c: any) => ({
            course_id: c.course_id?.toString(),
            certificate_id: c.certificate_id,
            course_title: c.course_title
          }))
        });
        // Try to save again as a fallback with explicit path
        await User.findByIdAndUpdate(
          userId,
          { 
            $push: { 
              'job_seeker_profile.completed_courses': courseCompletion 
            } 
          },
          { new: true, upsert: false }
        );
        console.log('Retried saving completion to job_seeker_profile.completed_courses');
      } else {
        console.log('✅ Completion verified in database:', {
          courseId: savedCompletion.course_id?.toString(),
          certificateId: savedCompletion.certificate_id,
          courseTitle: savedCompletion.course_title,
          totalCompleted: completedCourses.length
        });
      }
    } catch (saveError: any) {
      console.error('Error saving completion:', saveError);
      throw new Error(`Failed to save course completion: ${saveError.message}`);
    }

    // Update user skills based on course skills
    if (resource?.skills && resource.skills.length > 0) {
      const currentSkills = (user.skills || []).map((s: any) => typeof s === 'string' ? s : s?.name || '');
      const newSkills = resource.skills.filter((skill: string) => !currentSkills.includes(skill));
      
      if (newSkills.length > 0) {
        const skillsToAdd = newSkills.map((skill: string) => ({
          name: skill,
          level: 'beginner' as const
        }));
        
        await User.findByIdAndUpdate(userId, {
          $addToSet: {
            skills: { $each: skillsToAdd }
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Course marked as complete. Certificate generated!',
      completed: true,
      certificate_id: certificateId,
      certificate_url: certificateUrl,
      skills_earned: resource?.skills || []
    });
  } catch (error: any) {
    console.error('Mark course complete error:', error);
    res.status(500).json({ error: 'Failed to mark course as complete' });
  }
};

/**
 * Get user's completed courses
 */
export const getCompletedCourses = async (req: any, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get completed courses from user's job_seeker_profile.completed_courses array
    const completedCourses = user.job_seeker_profile?.completed_courses || [];
    
    console.log('Fetching completed courses for user:', {
      userId,
      completedCount: completedCourses.length,
      courseIds: completedCourses.map((c: any) => ({
        course_id: c.course_id?.toString(),
        certificate_id: c.certificate_id
      }))
    });

    // Also get resources for additional details
    const courseIds = completedCourses
      .map((c: any) => c.course_id)
      .filter((id: any) => id && Types.ObjectId.isValid(id));
    
    console.log('Fetching resources for completed courses:', {
      courseIdsCount: courseIds.length,
      courseIds: courseIds.map((id: any) => id?.toString())
    });
    
    const resources = await LearningResource.find({
      _id: { $in: courseIds }
    }).select('_id title thumbnail_url type category duration skills').lean();
    
    console.log('Found resources:', {
      resourcesCount: resources.length,
      resourceIds: resources.map((r: any) => r._id?.toString())
    });

    // Merge completion data with resource details
    const enrichedCourses = completedCourses.map((completion: any) => {
      const resource = resources.find((r: any) => {
        const resourceId = r._id?.toString();
        const completionCourseId = completion.course_id?.toString();
        return resourceId === completionCourseId;
      });
      
      // Return enriched course with both _id (from resource) and course_id (from completion)
      // This ensures frontend can match by either field
      return {
        _id: resource?._id || completion.course_id, // Resource ID for matching
        course_id: completion.course_id, // Original completion course_id
        ...completion, // All completion fields (certificate_id, certificate_url, etc.)
        ...resource, // All resource fields (title, thumbnail_url, etc.)
        certificate_id: completion.certificate_id,
        certificate_url: completion.certificate_url,
        completed_at: completion.completed_at,
        skills_earned: completion.skills_earned || resource?.skills || []
      };
    });
    
    console.log('Enriched completed courses:', {
      count: enrichedCourses.length,
      courses: enrichedCourses.map((c: any) => ({
        _id: c._id?.toString(),
        course_id: c.course_id?.toString(),
        title: c.title || c.course_title,
        certificate_id: c.certificate_id
      }))
    });

    res.json({
      success: true,
      completedCourses: enrichedCourses,
      count: enrichedCourses.length
    });
  } catch (error: any) {
    console.error('Get completed courses error:', error);
    res.status(500).json({ error: 'Failed to fetch completed courses' });
  }
};

/**
 * Download certificate PDF
 */
export const downloadCertificate = async (req: any, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { certificateId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify certificate belongs to user
    // completed_courses is nested under job_seeker_profile
    const completedCourses = user.job_seeker_profile?.completed_courses || [];
    const completion = completedCourses.find(
      (c: any) => c.certificate_id === certificateId
    );

    if (!completion) {
      console.error('Certificate not found in user completed courses:', {
        userId,
        certificateId,
        completedCoursesCount: completedCourses.length,
        certificateIds: completedCourses.map((c: any) => c.certificate_id)
      });
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    console.log('Certificate found:', {
      userId,
      certificateId,
      courseId: completion.course_id,
      courseTitle: completion.course_title,
      certificateUrl: completion.certificate_url
    });

    let certificateBuffer: Buffer | null = null;
    const certificateUrl = completion.certificate_url || '';

    // Check if certificate is stored in Firebase Storage (production)
    if (certificateUrl.startsWith('https://storage.googleapis.com/')) {
      console.log('Certificate URL is Firebase Storage, downloading...');
      certificateBuffer = await downloadCertificateFromFirebase(certificateId, userId);
      
      if (certificateBuffer) {
        console.log('✅ Certificate downloaded from Firebase Storage');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Certificate-${certificateId}.pdf"`);
        res.setHeader('Content-Length', certificateBuffer.length);
        res.setHeader('Cache-Control', 'no-cache');
        return res.send(certificateBuffer);
      } else {
        console.log('⚠️  Certificate not found in Firebase Storage, regenerating...');
      }
    }

    // Try local filesystem (development or fallback)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const certificatesDir = path.join(__dirname, '../../certificates');
    const certificatePath = path.join(certificatesDir, `${certificateId}.pdf`);
    const absolutePath = path.resolve(certificatePath);
    
    if (fs.existsSync(absolutePath)) {
      console.log('✅ Certificate found in local filesystem');
      const fileStats = fs.statSync(absolutePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Certificate-${certificateId}.pdf"`);
      res.setHeader('Content-Length', fileStats.size);
      res.setHeader('Cache-Control', 'no-cache');
      return res.sendFile(absolutePath, (err) => {
        if (err) {
          console.error('Error sending certificate file:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to send certificate file' });
          }
        }
      });
    }

    // Certificate not found - regenerate it
    console.log('Certificate file not found, regenerating...');
    
    const resource = await LearningResource.findById(completion.course_id).lean();
    if (!resource) {
      console.error('Course resource not found for certificate regeneration:', completion.course_id);
      return res.status(404).json({ error: 'Course not found' });
    }

    const certificateData = {
      userName: user.name,
      courseTitle: completion.course_title || resource.title,
      courseCategory: completion.course_category || resource.category,
      completionDate: completion.completed_at || new Date(),
      certificateId: certificateId,
      skills: completion.skills_earned || resource.skills || [],
      duration: resource.duration
    };

    certificateBuffer = await certificateService.generateCertificate(certificateData);
    
    // Try to upload to Firebase Storage if configured (works in both dev and production)
    if (isFirebaseConfigured()) {
      try {
        const firebaseUrl = await uploadCertificateToFirebase(certificateBuffer, certificateId, userId);
        console.log('✅ Certificate regenerated and uploaded to Firebase Storage');
        
        // Update user's certificate URL in database
        await User.updateOne(
          { 
            _id: userId,
            'job_seeker_profile.completed_courses.certificate_id': certificateId
          },
          {
            $set: {
              'job_seeker_profile.completed_courses.$.certificate_url': firebaseUrl
            }
          }
        );
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Certificate-${certificateId}.pdf"`);
        res.setHeader('Content-Length', certificateBuffer.length);
        res.setHeader('Cache-Control', 'no-cache');
        return res.send(certificateBuffer);
      } catch (firebaseError: any) {
        console.error('⚠️  Firebase upload failed during regeneration, using local storage:', firebaseError.message);
      }
    }
    
    // Fallback to local filesystem
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
      console.log('Created certificates directory:', certificatesDir);
    }
    
    fs.writeFileSync(absolutePath, certificateBuffer);
    console.log('✅ Certificate regenerated and saved to local filesystem');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Certificate-${certificateId}.pdf"`);
    res.setHeader('Content-Length', certificateBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    return res.send(certificateBuffer);
  } catch (error: any) {
    console.error('Download certificate error:', error);
    res.status(500).json({ error: 'Failed to download certificate' });
  }
};