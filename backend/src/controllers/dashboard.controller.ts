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
    
    // Get learning recommendations
    const learningRecommendations = await getLearningRecommendations(userId, 3);

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
    const activeJobs = jobs.filter(job => job.is_active !== false && (job.status === 'active' || job.status === 'published')).length;
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

  const requiredFields: any[] = [
    user?.name,
    user?.email,
    user?.bio,
    user?.phone,
    user?.profile_image,
    skills,
    seeker?.professional_summary,
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
      description: job.is_active !== false ? 'Job is now live and accepting applications' : 'Job is inactive',
      timestamp: job.created_at || job.posted_at || new Date(),
      status: job.is_active !== false ? 'success' : 'pending'
    })),
    ...applications.map(app => ({
      id: app._id.toString(),
      type: 'application',
      title: `New application for ${(app.job_id as any)?.title || 'Unknown Job'}`,
      description: `Application from ${(app.seeker_id as any)?.name || 'Unknown User'}`,
      timestamp: app.applied_at || app.created_at || new Date(),
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
    // Prefer the dedicated recommendations service if available
    const { RecommendationService } = await import('../services/recommendation.service.js');
    if (RecommendationService?.getCourseRecommendations) {
      const recs = await RecommendationService.getCourseRecommendations(userId, limit);
      if (Array.isArray(recs) && recs.length > 0) {
        return recs.map((r: any) => r.course || r).slice(0, limit);
      }
    }
  } catch {}

  // Return real learning resources from database
  const resources = await LearningResource.find({ is_active: true })
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();

  return resources || [];
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
