import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  getLearningRecommendations,
  getJobLearningRecommendations,
  getLearningResources,
  getLearningResource,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource
} from '../controllers/learning.controller.js';

const router = Router();

// Public routes
router.get('/resources', getLearningResources);
router.get('/resources/:id', getLearningResource);

// Protected routes for job seekers
router.get('/recommendations', requireAuth, getLearningRecommendations);
router.get('/job/:jobId/recommendations', requireAuth, getJobLearningRecommendations);

// Admin routes
router.post('/resources', requireAuth, requireRole('admin'), createLearningResource);
router.put('/resources/:id', requireAuth, requireRole('admin'), updateLearningResource);
router.delete('/resources/:id', requireAuth, requireRole('admin'), deleteLearningResource);

export default router;
