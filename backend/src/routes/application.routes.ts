import { Router } from 'express';
import { 
  apply, 
  myApplications, 
  getEmployerApplications, 
  updateApplicationStatus, 
  getApplicationDetails 
} from '../controllers/application.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

// Job seeker routes
router.get('/me', requireAuth, requireRole('seeker','admin'), myApplications);
router.post('/', requireAuth, requireRole('seeker','admin'), apply);

// Employer routes
router.get('/employer', requireAuth, requireRole('employer','admin'), getEmployerApplications);
router.patch('/:application_id/status', requireAuth, requireRole('employer','admin'), updateApplicationStatus);

// Shared routes
router.get('/:application_id', requireAuth, getApplicationDetails);
