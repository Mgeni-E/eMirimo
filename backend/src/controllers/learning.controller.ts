import type { Request, Response } from 'express';
import { LearningResource } from '../models/LearningResource.js';
import { YouTubeService } from '../services/youtube.service.js';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Types } from 'mongoose';

const youtubeService = new YouTubeService();

/**
 * Get all learning resources (includes YouTube if user is authenticated and has skills)
 */
export const getLearningResources = async (req: any, res: Response) => {
  try {
    const { category, difficulty, type, search, includeYouTube = 'true', forceRefresh = 'false' } = req.query;
    const userId = req.user?.uid;
    
    // Smart caching: Check if we have fresh cached results (less than 24 hours old)
    const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const cacheCutoff = new Date(Date.now() - cacheExpiry);
    
    let filter: any = { 
      is_active: true,
      source: 'YouTube' // Only get YouTube courses from database
    };
    
    // If not forcing refresh, only get recently cached results
    if (forceRefresh !== 'true') {
      filter.updated_at = { $gte: cacheCutoff };
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (search) {
      filter.$and = [
        { $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { skills: { $in: [new RegExp(search, 'i')] } }
        ]}
      ];
    }

    // Get cached YouTube courses from database
    let storedResources = await LearningResource.find(filter)
      .sort({ updated_at: -1, created_at: -1 })
      .limit(100)
      .lean();

    // If we have fresh cached courses, return them (no API calls needed)
    if (storedResources.length >= 50 && forceRefresh !== 'true') {
      const allResources = storedResources.slice(0, 100);
      
      res.json({
        success: true,
        resources: allResources,
        total: allResources.length,
        inAppCount: 0,
        youtubeCount: allResources.length,
        source: 'database-cached' // Indicate these are cached from API
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
          if (user && user.job_seeker_profile?.skills) {
            userSkills = user.job_seeker_profile.skills.slice(0, 5);
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
    const userSkills = user.job_seeker_profile?.skills || [];
    
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
        .slice(0, 25);

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
    let resource = await LearningResource.findById(id);
    
    // If not in DB, it might be a YouTube resource - create a minimal record for tracking
    if (!resource) {
      // Create a minimal learning resource record for YouTube resources
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
        created_by: userId,
        user_interactions: [{
          user_id: userId,
          interaction_type: 'complete',
          progress: 100,
          last_accessed: new Date(),
          created_at: new Date()
        }]
      });
    } else {
      // Check if interaction already exists
      const existingInteraction = resource.user_interactions?.find(
        (interaction: any) => 
          interaction.user_id?.toString() === userId && 
          interaction.interaction_type === 'complete'
      );

      if (!existingInteraction) {
        // Add completion interaction
        await LearningResource.findByIdAndUpdate(id, {
          $push: {
            user_interactions: {
              user_id: userId,
              interaction_type: 'complete',
              progress: 100,
              last_accessed: new Date(),
              created_at: new Date()
            }
          }
        });
      }
    }

    // Also track in user's completed courses (if we have a field for this)
    // For now, we'll just return success

    res.json({
      success: true,
      message: 'Course marked as complete',
      completed: true
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

    // Find all resources where user has completed interaction
    const resources = await LearningResource.find({
      'user_interactions': {
        $elemMatch: {
          user_id: userId,
          interaction_type: 'complete'
        }
      }
    }).select('_id title thumbnail_url type category duration');

    res.json({
      success: true,
      completedCourses: resources,
      count: resources.length
    });
  } catch (error: any) {
    console.error('Get completed courses error:', error);
    res.status(500).json({ error: 'Failed to fetch completed courses' });
  }
};