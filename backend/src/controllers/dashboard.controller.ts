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
      app.status === 'interview' || app.status === 'shortlisted'
    ).length;
    const hired = applications.filter(app => app.status === 'hired').length;
    
    // Calculate profile completion
    const user = await User.findById(userId);
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
          newOpportunities: Math.floor(Math.random() * 10) + 1
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

    // Calculate stats
    const activeJobs = jobs.filter(job => job.is_active).length;
    const totalApplications = applications.length;
    const interviewsScheduled = applications.filter(app => 
      app.status === 'interview' || app.status === 'shortlisted'
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

function calculateProfileCompletion(user: any): number {
  let completion = 0;
  const fields = [
    'name', 'email', 'phone', 'bio', 'address', 'city', 'country',
    'skills', 'education', 'work_experience', 'job_preferences'
  ];
  
  fields.forEach(field => {
    if (user[field] && (Array.isArray(user[field]) ? user[field].length > 0 : user[field])) {
      completion += 100 / fields.length;
    }
  });
  
  return Math.round(completion);
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
    .sort({ createdAt: -1 })
    .limit(5);

  const applications = await Application.find({ 
    job_id: { $in: jobs.map(job => job._id) } 
  })
    .populate('seeker_id', 'name')
    .populate('job_id', 'title')
    .sort({ applied_at: -1 })
    .limit(5);

  return [
    ...jobs.map(job => ({
      id: job._id,
      type: 'job',
      title: `Posted job: ${job.title}`,
      description: 'Job is now live and accepting applications',
      timestamp: job.createdAt,
      status: 'success'
    })),
    ...applications.map(app => ({
      id: app._id,
      type: 'application',
      title: `New application for ${(app.job_id as any)?.title || 'Unknown Job'}`,
      description: `Application from ${(app.seeker_id as any)?.name || 'Unknown User'}`,
      timestamp: app.applied_at,
      status: 'pending'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
}

async function getJobRecommendations(userId: string, limit: number) {
  // This would integrate with the existing recommendation service
  // For now, return mock data
  return [];
}

async function getLearningRecommendations(userId: string, limit: number) {
  // This would integrate with the existing recommendation service
  // For now, return mock data
  return [];
}

async function getTopPerformingJobs(employerId: string) {
  const jobs = await Job.find({ employer_id: employerId })
    .populate('employer_id', 'name')
    .sort({ createdAt: -1 })
    .limit(3);

  return jobs.map(job => ({
    ...job.toObject(),
    applicationCount: 0 // This would be calculated from applications
  }));
}
