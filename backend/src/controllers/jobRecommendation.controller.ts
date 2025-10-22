import type { Request, Response } from 'express';
import { JobMatchingService } from '../services/jobMatching.service.js';

/**
 * Get job recommendations for a job seeker
 */
export const getJobRecommendations = async (req: any, res: Response) => {
  try {
    const userId = req.user?.uid;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const recommendations = await JobMatchingService.findMatchingJobs(userId, limit);

    res.json({
      success: true,
      recommendations,
      total: recommendations.length
    });
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get job recommendations',
      message: 'An error occurred while finding matching jobs'
    });
  }
};

/**
 * Get job match score for a specific job
 */
export const getJobMatchScore = async (req: any, res: Response) => {
  try {
    const userId = req.user?.uid;
    const jobId = req.params.jobId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { Job } = await import('../models/Job.js');
    const job = await Job.findById(jobId).populate('employer_id', 'name email');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const { User } = await import('../models/User.js');
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'seeker') {
      return res.status(400).json({ error: 'User is not a job seeker' });
    }

    const score = JobMatchingService.calculateMatchScore(user, job);
    const reasons = JobMatchingService.getMatchReasons(user, job);

    res.json({
      success: true,
      jobId,
      score,
      reasons,
      matchLevel: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor'
    });
  } catch (error) {
    console.error('Error getting job match score:', error);
    res.status(500).json({ 
      error: 'Failed to get job match score',
      message: 'An error occurred while calculating match score'
    });
  }
};
