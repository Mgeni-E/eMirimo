import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getAssessments,
  getAssessment,
  submitAssessment,
  getUserResults,
  createAssessment,
  getLeaderboard
} from '../controllers/skills.controller';

const router = Router();

// Public routes
router.get('/assessments', getAssessments);
router.get('/assessments/:id', getAssessment);
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.use(requireAuth);
router.post('/assessments/submit', submitAssessment);
router.get('/results', getUserResults);
router.post('/assessments', createAssessment);

export default router;
