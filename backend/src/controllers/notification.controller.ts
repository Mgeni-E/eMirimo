import type { Request, Response } from 'express';
import { Notification } from '../models/Notification.js';

export const getNotifications = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid;
    const { read_status, limit = 20, offset = 0 } = req.query;
    
    const filter: any = { user_id: userId };
    if (read_status !== undefined) {
      filter.read_status = read_status === 'true';
    }
    
    const notifications = await Notification.find(filter)
      .sort({ created_at: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .lean();
    
    const unreadCount = await Notification.countDocuments({ 
      user_id: userId, 
      read_status: false 
    });
    
    res.json({ 
      notifications, 
      unreadCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: userId },
      { read_status: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid;
    
    await Notification.updateMany(
      { user_id: userId, read_status: false },
      { read_status: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

export const deleteNotification = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      user_id: userId
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Helper function to create notifications (used by other controllers)
export const createNotification = async (
  userId: string, 
  message: string, 
  type: string, 
  data?: any,
  title?: string,
  priority: 'low' | 'medium' | 'high' = 'medium',
  action_url?: string,
  category?: 'job' | 'application' | 'message' | 'system' | 'marketing' | 'security'
) => {
  try {
    // Determine category from type if not provided
    let notificationCategory = category;
    if (!notificationCategory) {
      if (type.includes('job')) notificationCategory = 'job';
      else if (type.includes('application')) notificationCategory = 'application';
      else if (type.includes('message')) notificationCategory = 'message';
      else if (type === 'system' || type === 'security') notificationCategory = type;
      else notificationCategory = 'system';
    }

    const notification = await Notification.create({
      user_id: userId,
      title: title || 'Notification',
      message,
      type,
      category: notificationCategory,
      priority,
      data,
      action_url
    });

    // Emit real-time notification via WebSocket
    const socketService = (global as any).socketService;
    if (socketService) {
      socketService.sendNotification(userId, notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

// Create job recommendation notifications
export const createJobRecommendationNotification = async (
  userId: string,
  jobTitle: string,
  jobId: string,
  matchScore: number
) => {
  const message = `New job recommendation: ${jobTitle} (${Math.round(matchScore * 100)}% match)`;
  return await createNotification(
    userId,
    message,
    'job_recommendation',
    { job_id: jobId, match_score: matchScore },
    'Job Recommendation',
    'medium',
    `/jobs/${jobId}`
  );
};

// Create course recommendation notifications
export const createCourseRecommendationNotification = async (
  userId: string,
  courseTitle: string,
  courseId: string,
  skillsGap: string[]
) => {
  const message = `New course recommendation: ${courseTitle} to improve your ${skillsGap.slice(0, 3).join(', ')} skills`;
  return await createNotification(
    userId,
    message,
    'course_recommendation',
    { course_id: courseId, skills_gap: skillsGap },
    'Course Recommendation',
    'low',
    `/courses/${courseId}`
  );
};
