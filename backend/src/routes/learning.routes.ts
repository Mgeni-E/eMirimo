import { Router } from 'express';
import {
  getLearningResources,
  getLearningResourcesWithYouTube,
  getLearningResource,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource
} from '../controllers/learning.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

// Public routes
router.get('/', getLearningResources);
router.get('/with-youtube', getLearningResourcesWithYouTube);
router.get('/:id', getLearningResource);

// Admin routes
router.post('/', requireAuth, requireRole('admin'), createLearningResource);
router.put('/:id', requireAuth, requireRole('admin'), updateLearningResource);
router.delete('/:id', requireAuth, requireRole('admin'), deleteLearningResource);