import { Router } from 'express';
import { 
  getUsers, 
  getJobs, 
  getAnalytics,
  getChartAnalytics,
  updateUserStatus,
  updateJobStatus,
  getUserStats,
  getJobStats,
  getApplicationStats,
  getDashboardData,
  getActivityFeed,
  getAdminProfile,
  updateAdminProfile,
  uploadAdminProfilePicture,
  getAdminNotifications,
  getUserDetail,
  deleteUser,
  getUserApplications,
  getUserJobs,
  deleteJob,
  getAllApplications,
  cleanupMockLearningResources
} from '../controllers/admin.controller.js';
import { markAsRead, markAllAsRead, deleteNotification } from '../controllers/notification.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Admin routes are working',
    timestamp: new Date().toISOString()
  });
});

// Profile management routes
router.get('/profile', getAdminProfile);
router.patch('/profile', updateAdminProfile);
router.post('/profile/picture', uploadAdminProfilePicture);

router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.get('/users/:id/applications', getUserApplications);
router.get('/users/:id/jobs', getUserJobs);
router.get('/applications', getAllApplications);
router.patch('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/jobs', getJobs);
router.get('/analytics', getAnalytics);
router.get('/analytics/charts', getChartAnalytics);
router.get('/users/stats', getUserStats);
router.get('/jobs/stats', getJobStats);
router.get('/applications/stats', getApplicationStats);
router.get('/dashboard', getDashboardData);
router.get('/activity', getActivityFeed);
router.get('/notifications', getAdminNotifications);
router.patch('/notifications/:id/read', markAsRead);
router.patch('/notifications/read-all', markAllAsRead);
router.delete('/notifications/:id', deleteNotification);
router.patch('/jobs/:id', updateJobStatus);
router.delete('/jobs/:id', deleteJob);

// Learning resources cleanup
router.post('/learning/cleanup', cleanupMockLearningResources);
