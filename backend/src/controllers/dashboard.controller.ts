import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Notification } from '../models/Notification.js';
import { LearningResource } from '../models/LearningResource.js';

/**
 * Get job seeker dashboard data
 */
export const getSeekerDashboard = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid;
    
    // Get user applications
    const applications = await Application.find({ seeker_id: userId })
      .populate('job_id', 'title employer_id location type')
      .populate('job_id.employer_id', 'name')
      .sort({ applied_at: -1 });

    // Calculate stats
    const totalApplications = applications.length;
    const interviewsScheduled = applications.filter(app => 
      app.status === 'interview_scheduled' || app.status === 'interview_completed' || app.status === 'shortlisted' || app.status === 'under_review'
    ).length;
    const hired = applications.filter(app => app.status === 'hired').length;
    
    // Calculate profile completion
    const user = await User.findById(userId).lean();
    const profileCompletion = calculateProfileCompletion(user);
    
    // Get recent activity
    const recentActivity = await getRecentActivity(userId);
    
    // Get job recommendations
    const jobRecommendations = await getJobRecommendations(userId, 3);
    
    // Get learning recommendations (4-6 courses)
    const learningRecommendations = await getLearningRecommendations(userId, 6);

    res.json({
      success: true,
      data: {
        stats: {
          totalApplications,
          interviewsScheduled,
          hired,
          profileCompletion,
          newOpportunities: await Job.countDocuments({ is_active: true, created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
        },
        applications: applications.slice(0, 5),
        recentActivity,
        jobRecommendations,
        learningRecommendations
      }
    });
  } catch (error) {
    console.error('Error fetching seeker dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

/**
 * Get employer dashboard data
 */
export const getEmployerDashboard = async (req: any, res: Response) => {
  try {
    const employerId = req.user.uid;
    
    // Get employer jobs
    const jobs = await Job.find({ employer_id: employerId })
      .populate('employer_id', 'name')
      .sort({ created_at: -1 });

    // Get applications for employer's jobs
    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ job_id: { $in: jobIds } })
      .populate('seeker_id', 'name email')
      .populate('job_id', 'title')
      .sort({ applied_at: -1 });

    // Calculate stats from real database data
    const activeJobs = jobs.filter(job => (job.status === 'active' || job.status === 'published')).length;
    const totalApplications = applications.length;
    const interviewsScheduled = applications.filter(app => 
      app.status === 'interview_scheduled' || app.status === 'shortlisted' || app.status === 'under_review'
    ).length;
    const hiredCandidates = applications.filter(app => app.status === 'hired').length;
    
    // Get recent activity
    const recentActivity = await getEmployerRecentActivity(employerId);
    
    // Get top performing jobs
    const topJobs = await getTopPerformingJobs(employerId);

    res.json({
      success: true,
      data: {
        stats: {
          activeJobs,
          totalApplications,
          interviewsScheduled,
          hiredCandidates
        },
        jobs: jobs.slice(0, 5),
        applications: applications.slice(0, 10),
        recentActivity,
        topJobs
      }
    });
  } catch (error) {
    console.error('Error fetching employer dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

/**
 * Get employer analytics data for charts
 */
export const getEmployerAnalytics = async (req: any, res: Response) => {
  try {
    const employerId = req.user.uid;
    const now = new Date();
    const days = 30; // Last 30 days
    const chartData: any[] = [];

    // Get employer's jobs
    const jobs = await Job.find({ employer_id: employerId });
    const jobIds = jobs.map(job => job._id);

    // Generate time-series data for last 30 days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [jobsCount, applicationsCount] = await Promise.all([
        Job.countDocuments({
          employer_id: employerId,
          created_at: { $gte: date, $lt: nextDate }
        }),
        Application.countDocuments({
          job_id: { $in: jobIds },
          applied_at: { $gte: date, $lt: nextDate }
        })
      ]);

      chartData.push({
        date: date.toISOString().split('T')[0],
        jobs: jobsCount,
        applications: applicationsCount
      });
    }

    // Get application status distribution
    const applicationsByStatus = await Application.aggregate([
      { $match: { job_id: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get job status distribution
    const jobsByStatus = await Job.aggregate([
      { $match: { employer_id: employerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        timeSeries: chartData,
        jobStatusDistribution: jobsByStatus.map(s => ({ status: s._id || 'unknown', count: s.count })),
        applicationStatusDistribution: applicationsByStatus.map(s => ({ status: s._id || 'unknown', count: s.count }))
      }
    });
  } catch (error) {
    console.error('Error fetching employer analytics:', error);
    res.status(500).json({ error: 'Failed to fetch employer analytics' });
  }
};

/**
 * Get admin dashboard data
 */
export const getAdminDashboard = async (req: any, res: Response) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get comprehensive stats
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalNotifications,
      totalLearningResources,
      usersLast24h,
      jobsLast24h,
      applicationsLast24h,
      usersLast7d,
      jobsLast7d,
      applicationsLast7d,
      recentUsers,
      recentJobs,
      recentApplications,
      recentNotifications
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Notification.countDocuments(),
      LearningResource.countDocuments(),
      User.countDocuments({ created_at: { $gte: last24Hours } }),
      Job.countDocuments({ created_at: { $gte: last24Hours } }),
      Application.countDocuments({ created_at: { $gte: last24Hours } }),
      User.countDocuments({ created_at: { $gte: last7Days } }),
      Job.countDocuments({ created_at: { $gte: last7Days } }),
      Application.countDocuments({ created_at: { $gte: last7Days } }),
      User.find().sort({ created_at: -1 }).limit(5).select('name email role created_at').lean(),
      Job.find().populate('employer_id', 'name').sort({ created_at: -1 }).limit(5).select('title employer_id created_at').lean(),
      Application.find().populate('seeker_id', 'name').populate('job_id', 'title').sort({ created_at: -1 }).limit(5).select('seeker_id job_id status created_at').lean(),
      Notification.find().sort({ created_at: -1 }).limit(10).select('message type created_at').lean()
    ]);

    // Calculate growth percentages
    const userGrowth = usersLast7d > 0 ? ((usersLast24h / usersLast7d) * 100 - 100) : 0;
    const jobGrowth = jobsLast7d > 0 ? ((jobsLast24h / jobsLast7d) * 100 - 100) : 0;
    const applicationGrowth = applicationsLast7d > 0 ? ((applicationsLast24h / applicationsLast7d) * 100 - 100) : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalJobs,
          totalApplications,
          totalNotifications,
          totalLearningResources,
          userGrowth: Math.round(userGrowth * 100) / 100,
          jobGrowth: Math.round(jobGrowth * 100) / 100,
          applicationGrowth: Math.round(applicationGrowth * 100) / 100
        },
        recentActivity: {
          users: recentUsers,
          jobs: recentJobs,
          applications: recentApplications,
          notifications: recentNotifications
        },
        timestamp: now.toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// Helper functions

function isNonEmpty(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

function calculateProfileCompletion(user: any): number {
  const seeker = user?.job_seeker_profile || {};
  const skills = Array.isArray(user?.skills) ? user.skills : [];
  
  // Use professional_summary if available, otherwise fall back to bio (they serve the same purpose)
  const professionalSummary = seeker?.professional_summary || user?.bio;

  const requiredFields: any[] = [
    user?.name,
    user?.email,
    user?.bio || professionalSummary, // Bio or professional_summary (counted once)
    user?.phone,
    user?.profile_image,
    skills,
    seeker?.work_experience,
    seeker?.education,
    seeker?.languages,
    seeker?.job_preferences?.job_types,
    seeker?.job_preferences?.availability,
  ];

  const filled = requiredFields.reduce((acc, v) => acc + (isNonEmpty(v) ? 1 : 0), 0);
  const pct = Math.round((filled / requiredFields.length) * 100);
  return isNaN(pct) ? 0 : Math.max(0, Math.min(100, pct));
}

async function getRecentActivity(userId: string) {
  const applications = await Application.find({ seeker_id: userId })
    .populate('job_id', 'title')
    .sort({ applied_at: -1 })
    .limit(5);

  return applications.map(app => ({
    id: app._id,
    type: 'application',
    title: `Applied to ${(app.job_id as any)?.title || 'Unknown Job'}`,
    description: `Application status: ${app.status}`,
    timestamp: app.applied_at,
    status: app.status === 'hired' ? 'success' : app.status === 'rejected' ? 'warning' : 'pending'
  }));
}

async function getEmployerRecentActivity(employerId: string) {
  const jobs = await Job.find({ employer_id: employerId })
    .sort({ created_at: -1 })
    .limit(5)
    .lean();

  const jobIds = jobs.map(job => job._id);
  const applications = await Application.find({ 
    job_id: { $in: jobIds } 
  })
    .populate('seeker_id', 'name')
    .populate('job_id', 'title')
    .sort({ applied_at: -1 })
    .limit(5)
    .lean();

  return [
    ...jobs.map(job => ({
      id: job._id.toString(),
      type: 'job',
      title: `Posted job: ${job.title}`,
      description: job.status === 'active' ? 'Job is now live and accepting applications' : 'Job is inactive',
      timestamp: (job as any).createdAt || job.posted_at || new Date(),
      status: job.status === 'active' ? 'success' : 'pending'
    })),
    ...applications.map(app => ({
      id: app._id.toString(),
      type: 'application',
      title: `New application for ${(app.job_id as any)?.title || 'Unknown Job'}`,
      description: `Application from ${(app.seeker_id as any)?.name || 'Unknown User'}`,
      timestamp: app.applied_at || (app as any).createdAt || new Date(),
      status: app.status === 'hired' ? 'success' : app.status === 'rejected' ? 'warning' : 'pending'
    }))
  ].sort((a, b) => {
    const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
    const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
    return bTime - aTime;
  }).slice(0, 5);
}

async function getJobRecommendations(userId: string, limit: number) {
  try {
    // Use the dedicated recommendations service
    const { RecommendationService } = await import('../services/recommendation.service.js');
    if (RecommendationService?.getJobRecommendations) {
      const recs = await RecommendationService.getJobRecommendations(userId, limit);
      if (Array.isArray(recs) && recs.length > 0) {
        return recs.map((r: any) => ({
          job: r.job,
          matchScore: Math.round((r.matchScore || 0) * 100),
          reasons: r.reasons || []
        })).slice(0, limit);
      }
    }
  } catch (error) {
    console.error('Error getting job recommendations:', error);
  }

  // Fallback: return latest active jobs from database (real data, no mock scores)
  const latestJobs = await Job.find({ is_active: true })
    .populate('employer_id', 'name email')
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();

  return latestJobs.map((job: any) => ({
    job,
    matchScore: 0, // No mock score, just return real jobs
    reasons: []
  }));
}

async function getLearningRecommendations(userId: string, limit: number) {
  try {
    // Get user profile to personalize recommendations
    const user = await User.findById(userId).lean();
    if (!user) {
      return [];
    }

    // FIRST: Try to get personalized recommendations from stored database courses
    // This avoids API calls and quota issues
    let storedRecommendations = await LearningResource.find({
      is_active: true,
      source: 'YouTube'
    })
      .sort({ created_at: -1 })
      .limit(100)
      .lean();

    // If we have stored courses, personalize them based on user skills
    if (storedRecommendations.length > 0) {
      const userSkills = (user.skills?.map((s: any) => typeof s === 'string' ? s : s?.name || '') || []) as string[];
      
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
          course: resource,
          resource: resource,
          matchScore: Math.max(0.5, Math.min(1.0, matchScore)),
          reasons: matchingSkills.length > 0 
            ? [`Matches ${matchingSkills.length} of your skills`]
            : ['Recommended based on job market trends'],
          skillsGap: skillGaps.slice(0, 3)
        };
      });

      // Sort by match score and return top recommendations
      return scoredRecommendations
        .sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, limit);
    }

    // FALLBACK: Only use API if no stored courses (should rarely happen)
    console.warn('⚠️  No stored courses found. Using YouTube API (may hit quota limits)...');
    
    // Use the learning controller's recommendation logic
    // Import YouTube service to fetch personalized courses
    const { YouTubeService } = await import('../services/youtube.service.js');
    const youtubeService = new YouTubeService();
    
    // Get user skills for personalized recommendations
    const userSkills = (user.skills?.map((s: any) => typeof s === 'string' ? s : s?.name || '') || []) as string[];
    
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
    
    // Default skills if user has none
    const searchSkills = allSkills.length > 0 ? allSkills : ['programming', 'communication', 'career development', 'digital skills', 'soft skills'];

    // Fetch YouTube courses based on user profile
    // Search across multiple categories to get diverse recommendations
    const categoryMap: { [key: string]: string[] } = {
      'digital-literacy-productivity': ['digital skills', 'computer basics', 'Microsoft Office', 'Google Workspace', 'ICT'],
      'soft-skills-professional': ['communication', 'leadership', 'teamwork', 'time management', 'professional skills'],
      'entrepreneurship-business': ['entrepreneurship', 'business', 'marketing', 'finance', 'startup'],
      'job-search-career': ['resume', 'interview', 'career', 'job search', 'CV'],
      'technology-digital-careers': ['programming', 'coding', 'web development', 'data analysis', 'AI'],
      'personal-development-workplace': ['productivity', 'confidence', 'growth mindset', 'work-life balance', 'personal development']
    };

    // Determine relevant categories based on user skills
    const relevantCategories: string[] = [];
    const userSkillsLowerStr = userSkillsLower.join(' ');
    
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => userSkillsLowerStr.includes(keyword))) {
        relevantCategories.push(category);
      }
    }

    // If no relevant categories found, use default categories
    const categoriesToSearch = relevantCategories.length > 0 
      ? relevantCategories.slice(0, 3) 
      : ['soft-skills-professional', 'job-search-career', 'technology-digital-careers'];

    // Fetch courses from relevant categories
    const allRecommendations: any[] = [];
    
    for (const category of categoriesToSearch) {
      try {
        const categoryKeywords = categoryMap[category] || searchSkills;
        
        // Catch individual API errors to prevent quota errors from breaking everything
        let playlists: any[] = [];
        let videos: any[] = [];
        
        try {
          playlists = await youtubeService.searchEducationalPlaylists(categoryKeywords, 'beginner', 5);
        } catch (playlistError: any) {
          if (playlistError?.response?.data?.error?.code === 403) {
            console.warn(`YouTube quota exceeded for ${category} playlists, skipping...`);
          } else {
            console.error(`Error fetching ${category} playlists:`, playlistError.message);
          }
        }
        
        try {
          videos = await youtubeService.searchEducationalVideos(categoryKeywords, 'beginner', 5);
        } catch (videoError: any) {
          if (videoError?.response?.data?.error?.code === 403) {
            console.warn(`YouTube quota exceeded for ${category} videos, skipping...`);
          } else {
            console.error(`Error fetching ${category} videos:`, videoError.message);
          }
        }
        
        // Convert to learning resources
        const resources = [
          ...playlists.map((p: any) => youtubeService.convertPlaylistToLearningResource(p, searchSkills, category, 'beginner')),
          ...videos.map((v: any) => youtubeService.convertToLearningResource(v, searchSkills, category, 'beginner'))
        ];

        // Calculate match scores based on user skills
        const scoredResources = resources.map((resource: any) => {
          const resourceSkills = (resource.skills || []).map((s: string) => s.toLowerCase());
          const matchingSkills = userSkillsLower.filter((userSkill: string) =>
            resourceSkills.some((rs: string) => rs.includes(userSkill) || userSkill.includes(rs))
          );
          const matchScore = userSkills.length > 0 
            ? matchingSkills.length / Math.max(userSkills.length, resourceSkills.length)
            : 0.7; // Default score if no user skills

          return {
            course: resource,
            resource: resource,
            matchScore: Math.max(0.5, Math.min(1.0, matchScore)),
            reasons: matchingSkills.length > 0 
              ? [`Matches ${matchingSkills.length} of your skills`]
              : ['Recommended based on job market trends'],
            skillsGap: skillGaps.slice(0, 3)
          };
        });

        allRecommendations.push(...scoredResources);
      } catch (error: any) {
        console.error(`Error fetching ${category} recommendations:`, error.message);
        // Continue with next category
      }
    }

    // Remove duplicates and sort by match score
    const uniqueRecommendations = Array.from(
      new Map(allRecommendations.map((r: any) => [r.course?._id || r.course?.id || r.resource?._id || r.resource?.id, r])).values()
    );

    // Sort by match score (highest first) and return top recommendations
    return uniqueRecommendations
      .sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting course recommendations:', error);
    // Fallback: Return empty array if YouTube API fails
    return [];
  }
}

async function getTopPerformingJobs(employerId: string) {
  const jobs = await Job.find({ employer_id: employerId })
    .populate('employer_id', 'name')
    .sort({ created_at: -1 })
    .limit(3);

  // Calculate actual application counts from database
  const jobIds = jobs.map(job => job._id);
  const applicationCounts = await Application.aggregate([
    { $match: { job_id: { $in: jobIds } } },
    { $group: { _id: '$job_id', count: { $sum: 1 } } }
  ]);

  const countMap = new Map(applicationCounts.map((item: any) => [item._id.toString(), item.count]));

  return jobs.map(job => ({
    ...job.toObject(),
    applicationCount: countMap.get(job._id.toString()) || 0
  }));
}
