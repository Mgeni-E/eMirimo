import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Notification } from '../models/Notification.js';
import { Application } from '../models/Application.js';
import { Log } from '../models/Log.js';
import { SocketService } from '../services/socket.service.js';

export const getUsers = async (req: any, res: Response) => {
  try {
    console.log('Admin getUsers called by user:', req.user?.uid);
    const { role, limit = 50, offset = 0 } = req.query;
    
    const filter: any = {};
    if (role) filter.role = role;
    
    console.log('User filter:', filter);
    
    // First, let's check if we can connect to the database
    const totalUsers = await User.countDocuments();
    console.log('Total users in database:', totalUsers);
    
    const users = await User.find(filter)
      .select('-password_hash -refreshToken')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .lean();
    
    console.log('Found users:', users.length);
    console.log('Users data:', users);
    
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    console.log('Total users:', totalUsers);
    console.log('Users by role:', usersByRole);
    
    res.json({ 
      users, 
      totalUsers, 
      usersByRole 
    });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getJobs = async (req: any, res: Response) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    const filter: any = {};
    if (status === 'active') filter.is_active = true;
    if (status === 'inactive') filter.is_active = false;
    
    const jobs = await Job.find(filter)
      .populate('employer_id', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .lean();
    
    const totalJobs = await Job.countDocuments(filter);
    const jobsByCategory = await Job.aggregate([
      { $group: { _id: '$job_category', count: { $sum: 1 } } }
    ]);
    
    res.json({ 
      jobs, 
      totalJobs, 
      jobsByCategory 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};


export const getAnalytics = async (req: any, res: Response) => {
  try {
    // User analytics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Job analytics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ is_active: true });
    const jobsByCategory = await Job.aggregate([
      { $group: { _id: '$job_category', count: { $sum: 1 } } }
    ]);
    
    
    
    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt')
      .lean();
    
    const recentJobs = await Job.find()
      .populate('employer_id', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title employer_id createdAt')
      .lean();
    
    res.json({
      users: {
        total: totalUsers,
        byRole: usersByRole
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        byCategory: jobsByCategory
      },
      recentActivity: {
        users: recentUsers,
        jobs: recentJobs
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Chart analytics endpoint with time-series data
export const getChartAnalytics = async (req: any, res: Response) => {
  try {
    const now = new Date();
    const days = 30; // Last 30 days
    const chartData: any[] = [];

    // Generate data for last 30 days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [users, jobs, applications] = await Promise.all([
        User.countDocuments({
          created_at: { $gte: date, $lt: nextDate }
        }),
        Job.countDocuments({
          created_at: { $gte: date, $lt: nextDate }
        }),
        Application.countDocuments({
          created_at: { $gte: date, $lt: nextDate }
        })
      ]);

      chartData.push({
        date: date.toISOString().split('T')[0],
        users,
        jobs,
        applications
      });
    }

    // Get role distribution
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get job status distribution
    const jobsByStatus = await Job.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get application status distribution
    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        timeSeries: chartData,
        roleDistribution: usersByRole.map(r => ({ role: r._id || 'unknown', count: r.count })),
        jobStatusDistribution: jobsByStatus.map(s => ({ status: s._id || 'unknown', count: s.count })),
        applicationStatusDistribution: applicationsByStatus.map(s => ({ status: s._id || 'unknown', count: s.count }))
      }
    });
  } catch (error) {
    console.error('Chart analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch chart analytics' });
  }
};

export const updateUserStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { is_verified, is_active, status, reason } = req.body;
    
    const updateData: any = { updated_at: new Date() };
    if (is_verified !== undefined) updateData.is_verified = is_verified;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (status) updateData.status = status;
    if (reason) updateData.status_reason = reason;
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password_hash -refreshToken');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log the action
    await Log.create({
      level: 'info',
      message: `User status updated by admin`,
      userId: req.user.uid,
      action: 'user_status_update',
      metadata: {
        target_user_id: id,
        updateData,
        reason
      },
      timestamp: new Date()
    });

    // Create notification for the user
    await Notification.create({
      user_id: id,
      title: 'Account Status Updated',
      message: `Your account status has been updated. ${reason ? `Reason: ${reason}` : ''}`,
      type: 'system',
      category: 'system',
      read_status: false,
      context: {
        user_id: id
      },
      created_at: new Date()
    });

    // Broadcast real-time update to admin dashboard
    try {
      const socketService = (global as any).socketService;
      if (socketService) {
        socketService.broadcastUserStatusChange(id, status || 'updated', reason);
      }
    } catch (socketError) {
      console.error('Socket broadcast error:', socketError);
    }
    
    res.json({
      success: true,
      user,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

export const getUserDetail = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password_hash -refreshToken');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

export const deleteUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Log the action before deletion
    await Log.create({
      level: 'info',
      message: `User deleted by admin`,
      userId: req.user.uid,
      action: 'user_delete',
      metadata: {
        target_user_id: id,
        target_user_name: user.name,
        target_user_email: user.email
      },
      timestamp: new Date()
    });

    // Delete user and related data
    await User.findByIdAndDelete(id);
    await Job.deleteMany({ employer_id: id });
    await Application.deleteMany({ user_id: id });
    await Notification.deleteMany({ user_id: id });
    await Log.deleteMany({ userId: id });

    // Broadcast real-time update to admin dashboard
    try {
      const socketService = (global as any).socketService;
      if (socketService) {
        socketService.broadcastUserDeleted(id);
      }
    } catch (socketError) {
      console.error('Socket broadcast error:', socketError);
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const getUserApplications = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const applications = await Application.find({ seeker_id: id })
      .populate('job_id', 'title company_name location')
      .populate('employer_id', 'name email')
      .sort({ applied_at: -1 })
      .lean();
    
    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ error: 'Failed to fetch user applications' });
  }
};

// Get all applications (for admin)
export const getAllApplications = async (req: any, res: Response) => {
  try {
    const { status, job_id, seeker_id, employer_id, limit = 50, offset = 0 } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (job_id) filter.job_id = job_id;
    if (seeker_id) filter.seeker_id = seeker_id;
    if (employer_id) filter.employer_id = employer_id;

    const applications = await Application.find(filter)
      .populate('job_id', 'title company_name location salary')
      .populate({
        path: 'seeker_id',
        select: 'name email profile_image skills work_experience education',
        // Explicitly include profile_image even if empty
        options: { lean: true }
      })
      .populate('employer_id', 'name email')
      .sort({ applied_at: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .lean();

    // Debug: Log first application to verify profile_image is populated
    if (applications.length > 0) {
      const firstApp = applications[0] as any;
      console.log('First application seeker_id:', firstApp.seeker_id);
      console.log('First application profile_image:', firstApp.seeker_id?.profile_image);
      console.log('First application seeker_id keys:', firstApp.seeker_id ? Object.keys(firstApp.seeker_id) : 'null');
    }

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      applications,
      total,
      count: applications.length
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

export const getUserJobs = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const jobs = await Job.find({ employer_id: id })
      .select('title status createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    // Get application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ job_id: job._id });
        return {
          ...job,
          applications_count: count
        };
      })
    );
    
    res.json({
      success: true,
      jobs: jobsWithCounts
    });
  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch user jobs' });
  }
};

export const updateJobStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status, is_active, is_featured, reason } = req.body;
    
    const updateData: any = { updated_at: new Date() };
    
    // Handle both status string and is_active boolean
    if (status !== undefined) {
      // Map status string to is_active boolean
      if (status === 'active' || status === 'published') {
        updateData.is_active = true;
        updateData.status = 'active';
      } else if (status === 'inactive' || status === 'paused' || status === 'draft') {
        updateData.is_active = false;
        updateData.status = status === 'paused' ? 'paused' : status === 'draft' ? 'draft' : 'inactive';
      } else {
        updateData.status = status;
      }
    }
    
    if (is_active !== undefined) {
      updateData.is_active = is_active;
      if (!updateData.status) {
        updateData.status = is_active ? 'active' : 'paused';
      }
    }
    
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (reason) updateData.status_reason = reason;
    
    const job = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employer_id', 'name email');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Log the action
    await Log.create({
      level: 'info',
      message: `Job status updated by admin`,
      userId: req.user.uid,
      action: 'job_status_update',
      metadata: {
        job_id: id,
        updateData,
        reason
      },
      timestamp: new Date()
    });

    // Create notification for the employer
    const employerId = typeof job.employer_id === 'object' ? (job.employer_id as any)._id : job.employer_id;
    await Notification.create({
      user_id: employerId,
      title: 'Job Status Updated',
      message: `Your job "${job.title}" has been updated. ${reason ? `Reason: ${reason}` : ''}`,
      type: 'system',
      category: 'job',
      read_status: false,
      context: {
        job_id: job._id
      },
      created_at: new Date()
    });

    // Broadcast real-time update to admin dashboard
    try {
      const socketService = (global as any).socketService;
      if (socketService) {
        socketService.broadcastJobStatusChange(id, is_active, reason);
      }
    } catch (socketError) {
      console.error('Socket broadcast error:', socketError);
    }
    
    res.json({
      success: true,
      job,
      message: 'Job status updated successfully'
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ error: 'Failed to update job status', message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteJob = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Delete the job
    await Job.findByIdAndDelete(id);

    // Log the action
    await Log.create({
      level: 'info',
      message: `Job deleted by admin`,
      userId: req.user.uid,
      action: 'job_delete',
      metadata: {
        job_id: id,
        job_title: job.title
      },
      timestamp: new Date()
    });

    // Create notification for the employer
    const employerId = typeof job.employer_id === 'object' ? (job.employer_id as any)._id : job.employer_id;
    if (employerId) {
      await Notification.create({
        user_id: employerId,
        title: 'Job Deleted',
        message: `Your job "${job.title}" has been deleted by an administrator.`,
        type: 'system',
        category: 'job',
        read_status: false,
        context: {
          job_id: job._id
        },
        created_at: new Date()
      });
    }

    // Broadcast real-time update to admin dashboard
    try {
      const socketService = (global as any).socketService;
      if (socketService) {
        socketService.broadcastJobStatusChange(id, false, 'Job deleted');
      }
    } catch (socketError) {
      console.error('Socket broadcast error:', socketError);
    }
    
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job', message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Stats endpoints for admin dashboard
export const getUserStats = async (req: any, res: Response) => {
  try {
    const total = await User.countDocuments();
    const active = await User.countDocuments({ status: 'active' });
    const inactive = await User.countDocuments({ status: 'inactive' });
    const pending = await User.countDocuments({ status: 'pending' });
    
    const byRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const roleStats = {
      seekers: byRole.find(r => r._id === 'seeker')?.count || 0,
      employers: byRole.find(r => r._id === 'employer')?.count || 0
    };
    
    res.json({
      total,
      active,
      inactive,
      pending,
      byRole: roleStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};

export const getJobStats = async (req: any, res: Response) => {
  try {
    const total = await Job.countDocuments();
    const active = await Job.countDocuments({ is_active: true });
    const inactive = await Job.countDocuments({ is_active: false });
    const pending = await Job.countDocuments({ status: 'pending' });
    
    const byType = await Job.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    const typeStats = {
      remote: byType.find(t => t._id === 'remote')?.count || 0,
      hybrid: byType.find(t => t._id === 'hybrid')?.count || 0,
      onsite: byType.find(t => t._id === 'onsite')?.count || 0
    };
    
    res.json({
      total,
      active,
      inactive,
      pending,
      byType: typeStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job stats' });
  }
};

export const getApplicationStats = async (req: any, res: Response) => {
  try {
    const total = await Application.countDocuments();
    const pending = await Application.countDocuments({ status: 'pending' });
    const approved = await Application.countDocuments({ status: 'approved' });
    const rejected = await Application.countDocuments({ status: 'rejected' });
    
    res.json({
      total,
      pending,
      approved,
      rejected
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application stats' });
  }
};

// Real-time dashboard data endpoint
export const getDashboardData = async (req: any, res: Response) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all stats in parallel
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalNotifications,
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
      User.countDocuments({ created_at: { $gte: last24Hours } }),
      Job.countDocuments({ created_at: { $gte: last24Hours } }),
      Application.countDocuments({ created_at: { $gte: last24Hours } }),
      User.countDocuments({ created_at: { $gte: last7Days } }),
      Job.countDocuments({ created_at: { $gte: last7Days } }),
      Application.countDocuments({ created_at: { $gte: last7Days } }),
      User.find().sort({ created_at: -1 }).limit(5).select('name email role created_at').lean(),
      Job.find().populate('employer_id', 'name').sort({ created_at: -1 }).limit(5).select('title employer_id created_at').lean(),
      Application.find().populate('seeker_id', 'name').populate('job_id', 'title').sort({ created_at: -1 }).limit(5).select('seeker_id job_id status created_at').lean(),
      Notification.find().sort({ created_at: -1 }).limit(10).select('title message type created_at').lean()
    ]);

    // Calculate growth percentages
    const userGrowth = usersLast7d > 0 ? ((usersLast24h / usersLast7d) * 100 - 100) : 0;
    const jobGrowth = jobsLast7d > 0 ? ((jobsLast24h / jobsLast7d) * 100 - 100) : 0;
    const applicationGrowth = applicationsLast7d > 0 ? ((applicationsLast24h / applicationsLast7d) * 100 - 100) : 0;

    res.json({
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalNotifications,
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
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// Real-time activity feed
export const getActivityFeed = async (req: any, res: Response) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    // Get recent activities from multiple sources
    const [userActivities, jobActivities, applicationActivities] = await Promise.all([
      User.find()
        .sort({ created_at: -1 })
        .limit(parseInt(limit as string))
        .select('name email role created_at')
        .lean(),
      Job.find()
        .populate('employer_id', 'name')
        .sort({ created_at: -1 })
        .limit(parseInt(limit as string))
        .select('title employer_id created_at is_active')
        .lean(),
      Application.find()
        .populate('seeker_id', 'name')
        .populate('job_id', 'title')
        .sort({ applied_at: -1 })
        .limit(parseInt(limit as string))
        .select('seeker_id job_id status applied_at')
        .lean()
    ]);

    // Combine and format activities
    const activities = [
      ...userActivities.map(user => ({
        id: user._id.toString(),
        type: 'user',
        title: 'New User Registration',
        description: `${user.name} registered as ${user.role}`,
        timestamp: user.created_at || user.createdAt,
        user: user.name,
        data: user
      })),
      ...jobActivities.map((job: any) => ({
        id: job._id.toString(),
        type: 'job',
        title: job.is_active ? 'New Job Posted' : 'Job Updated',
        description: `${job.title} by ${job.employer_id?.name || 'Unknown'}`,
        timestamp: job.created_at || job.createdAt,
        user: job.employer_id?.name || 'Unknown',
        data: job
      })),
      ...applicationActivities.map((app: any) => ({
        id: app._id.toString(),
        type: 'application',
        title: 'New Application',
        description: `${app.seeker_id?.name || 'Unknown'} applied for ${app.job_id?.title || 'Unknown'}`,
        timestamp: app.applied_at,
        user: app.seeker_id?.name || 'Unknown',
        data: app
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));

    res.json({
      activities,
      total: activities.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
};

// Profile management functions
export const getAdminProfile = async (req: any, res: Response) => {
  try {
    console.log('Fetching admin profile...');
    
    const adminId = req.user?.uid;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin ID not found'
      });
    }

    const admin = await User.findById(adminId).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }

    const profile = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      createdAt: admin.createdAt,
      lastLogin: admin.last_login,
      profilePicture: admin.profile_image,
      phone: admin.phone,
      bio: admin.bio,
      location: admin.address,
      permissions: [
        'user_management',
        'job_moderation',
        'system_settings',
        'analytics_access',
        'notification_management'
      ]
    };

    console.log('Admin profile fetched successfully');
    res.json(profile);
  } catch (error: any) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin profile',
      error: error.message
    });
  }
};

export const updateAdminProfile = async (req: any, res: Response) => {
  try {
    console.log('Updating admin profile...');
    
    const adminId = req.user?.uid;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin ID not found'
      });
    }

    const { name, email, phone, bio, location } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;

    const admin = await User.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }

    // Log the profile update
    await Log.create({
      level: 'info',
      message: `Admin profile updated: ${Object.keys(updateData).join(', ')}`,
      userId: adminId,
      action: 'profile_update',
      metadata: {
        updatedFields: Object.keys(updateData)
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    });

    console.log('Admin profile updated successfully');
    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin
    });
  } catch (error: any) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin profile',
      error: error.message
    });
  }
};

export const uploadAdminProfilePicture = async (req: any, res: Response) => {
  try {
    console.log('Uploading admin profile picture...');
    
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin ID not found'
      });
    }

    // In a real implementation, you would handle file upload here
    // For now, we'll just return a mock response
    const profilePicture = '/uploads/profile-pictures/default-admin.jpg';

    const admin = await User.findByIdAndUpdate(
      adminId,
      { profilePicture },
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }

    console.log('Admin profile picture uploaded successfully');
    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture
    });
  } catch (error: any) {
    console.error('Error uploading admin profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
};

// Admin notifications function
export const getAdminNotifications = async (req: any, res: Response) => {
  try {
    console.log('Fetching admin notifications...');
    
    const adminId = req.user?.uid;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin ID not found'
      });
    }

    const { read_status, limit = 20, offset = 0 } = req.query;
    
    // For admin, get notifications for the admin user
    const filter: any = { user_id: adminId };
    if (read_status !== undefined) {
      filter.read_status = read_status === 'true';
    }
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .lean();
    
    const unreadCount = await Notification.countDocuments({ 
      user_id: adminId, 
      read_status: false 
    });
    
    console.log(`Found ${notifications.length} notifications for admin`);
    
    res.json({ 
      notifications, 
      unreadCount 
    });
  } catch (error: any) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message 
    });
  }
};
