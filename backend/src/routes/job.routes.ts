import { Router } from 'express';
import { 
  list, 
  create, 
  getById, 
  update, 
  deleteJob, 
  getMyJobs, 
  getRecommendations 
} from '../controllers/job.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

// Public routes
router.get('/', list);

// Protected routes - specific routes must come before parameterized routes
router.get('/my/jobs', requireAuth, requireRole('employer', 'admin'), getMyJobs);
router.get('/recommendations', requireAuth, getRecommendations);
router.post('/', requireAuth, requireRole('employer', 'admin'), create);

// Parameterized routes must come last
router.get('/:id', getById);
router.put('/:id', requireAuth, requireRole('employer', 'admin'), update);
router.delete('/:id', requireAuth, requireRole('employer', 'admin'), deleteJob);
