import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getJobRecommendations, getJobMatchScore } from '../controllers/jobRecommendation.controller.js';

const router = Router();

// Get job recommendations for authenticated user
router.get('/recommendations', requireAuth, getJobRecommendations);

// Get match score for a specific job
router.get('/match/:jobId', requireAuth, getJobMatchScore);

export default router;
