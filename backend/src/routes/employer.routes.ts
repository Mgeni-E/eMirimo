import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  getJobStats,
  getApplicationStats,
  getApplications,
  updateApplicationStatus,
  getInterviews,
  getHiringPipeline,
  updateCandidateStage,
  updateInterviewStatus
} from '../controllers/employer.controller.js';

export const router = Router();

// All employer routes require authentication and employer role
router.use(requireAuth);
router.use(requireRole('employer'));

// Job statistics
router.get('/jobs/stats', getJobStats);

// Application statistics
router.get('/applications/stats', getApplicationStats);

// Applications management
router.get('/applications', getApplications);
router.put('/applications/:id/status', updateApplicationStatus);

// Interviews management
router.get('/interviews', getInterviews);
router.put('/interviews/:id/status', updateInterviewStatus);

// Hiring pipeline
router.get('/pipeline', getHiringPipeline);
router.put('/pipeline/:id/stage', updateCandidateStage);
