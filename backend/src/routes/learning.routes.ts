import { Router } from 'express';
import {
  getLearningResources,
  getLearningResourcesWithYouTube,
  getCourseRecommendations,
  getLearningResource,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
  markCourseComplete,
  getCompletedCourses
} from '../controllers/learning.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

// Public routes
router.get('/', getLearningResources);
router.get('/with-youtube', getLearningResourcesWithYouTube);
router.get('/recommendations', requireAuth, getCourseRecommendations);
router.get('/completed', requireAuth, getCompletedCourses);
router.get('/:id', getLearningResource);

// User routes
router.post('/:id/complete', requireAuth, markCourseComplete);

// Admin routes
router.post('/', requireAuth, requireRole('admin'), createLearningResource);
router.put('/:id', requireAuth, requireRole('admin'), updateLearningResource);
router.delete('/:id', requireAuth, requireRole('admin'), deleteLearningResource);