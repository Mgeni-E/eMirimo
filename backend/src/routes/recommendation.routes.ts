import { Router } from 'express';
import { 
  getJobRecommendations,
  getCourseRecommendations,
  getAllRecommendations,
  getPersonalizedDashboard
} from '../controllers/recommendation.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const router = Router();

// All recommendation routes require authentication
router.use(requireAuth);

// Get job recommendations for the authenticated user
router.get('/jobs', getJobRecommendations);

// Get course recommendations for the authenticated user
router.get('/courses', getCourseRecommendations);

// Get both job and course recommendations
router.get('/all', getAllRecommendations);

// Get personalized dashboard with recommendations
router.get('/dashboard', getPersonalizedDashboard);
