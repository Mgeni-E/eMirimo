import type { Request, Response } from 'express';
import { RecommendationService } from '../services/recommendation.service.js';

/**
 * Get job recommendations for the authenticated user
 */
export const getJobRecommendations = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit as string) || 10;
    
    console.log(`Getting job recommendations for user: ${userId}`);
    
    const recommendations = await RecommendationService.getJobRecommendations(userId, limit);
    
    res.json({
      success: true,
      recommendations,
      count: recommendations.length,
      message: `Found ${recommendations.length} job recommendations`
    });
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get job recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get course recommendations for the authenticated user
 */
export const getCourseRecommendations = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit as string) || 10;
    
    console.log(`Getting course recommendations for user: ${userId}`);
    
    const recommendations = await RecommendationService.getCourseRecommendations(userId, limit);
    
    res.json({
      success: true,
      recommendations,
      count: recommendations.length,
      message: `Found ${recommendations.length} course recommendations`
    });
  } catch (error) {
    console.error('Error getting course recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get course recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get both job and course recommendations for the authenticated user
 */
export const getAllRecommendations = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid;
    const jobLimit = parseInt(req.query.jobLimit as string) || 5;
    const courseLimit = parseInt(req.query.courseLimit as string) || 5;
    
    console.log(`Getting all recommendations for user: ${userId}`);
    
    const [jobRecommendations, courseRecommendations] = await Promise.all([
      RecommendationService.getJobRecommendations(userId, jobLimit),
      RecommendationService.getCourseRecommendations(userId, courseLimit)
    ]);
    
    res.json({
      success: true,
      data: {
        jobs: {
          recommendations: jobRecommendations,
          count: jobRecommendations.length
        },
        courses: {
          recommendations: courseRecommendations,
          count: courseRecommendations.length
        }
      },
      message: `Found ${jobRecommendations.length} job and ${courseRecommendations.length} course recommendations`
    });
  } catch (error) {
    console.error('Error getting all recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get personalized dashboard data with recommendations
 */
export const getPersonalizedDashboard = async (req: any, res: Response) => {
  try {
    const userId = req.user.uid;
    
    console.log(`Getting personalized dashboard for user: ${userId}`);
    
    const [jobRecommendations, courseRecommendations] = await Promise.all([
      RecommendationService.getJobRecommendations(userId, 3),
      RecommendationService.getCourseRecommendations(userId, 3)
    ]);
    
    // Calculate skills gap summary
    const allSkillsGap = courseRecommendations.flatMap(rec => rec.skillsGap);
    const uniqueSkillsGap = [...new Set(allSkillsGap)];
    
    res.json({
      success: true,
      data: {
        jobRecommendations: jobRecommendations.slice(0, 3),
        courseRecommendations: courseRecommendations.slice(0, 3),
        skillsGap: uniqueSkillsGap.slice(0, 5), // Top 5 skills to learn
        summary: {
          totalJobMatches: jobRecommendations.length,
          totalCourseMatches: courseRecommendations.length,
          skillsToLearn: uniqueSkillsGap.length
        }
      },
      message: 'Personalized dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting personalized dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personalized dashboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
