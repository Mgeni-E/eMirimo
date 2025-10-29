import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { 
  getSeekerDashboard, 
  getEmployerDashboard, 
  getAdminDashboard 
} from '../controllers/dashboard.controller.js';

export const router = Router();

// All dashboard routes require authentication
router.use(requireAuth);

// Get job seeker dashboard data
router.get('/seeker', getSeekerDashboard);

// Get employer dashboard data
router.get('/employer', getEmployerDashboard);

// Get admin dashboard data
router.get('/admin', getAdminDashboard);
