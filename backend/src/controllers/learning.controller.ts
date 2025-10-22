import type { Request, Response } from 'express';
import { LearningRecommendationService } from '../services/learningRecommendation.service.js';
import { LearningResource } from '../models/LearningResource.js';

/**
 * Get learning recommendations for a user
 */
export const getLearningRecommendations = async (req: any, res: Response) => {
  try {
    const userId = req.user?.uid;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const recommendations = await LearningRecommendationService.getLearningRecommendations(userId, limit);

    res.json({
      success: true,
      recommendations,
      total: recommendations.length
    });
  } catch (error) {
    console.error('Error getting learning recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get learning recommendations',
      message: 'An error occurred while finding learning resources'
    });
  }
};

/**
 * Get learning recommendations for a specific job
 */
export const getJobLearningRecommendations = async (req: any, res: Response) => {
  try {
    const userId = req.user?.uid;
    const jobId = req.params.jobId;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const recommendations = await LearningRecommendationService.getJobSpecificRecommendations(jobId, userId, limit);

    res.json({
      success: true,
      recommendations,
      total: recommendations.length
    });
  } catch (error) {
    console.error('Error getting job learning recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get job learning recommendations',
      message: 'An error occurred while finding learning resources for this job'
    });
  }
};

/**
 * Get all learning resources with filtering
 */
export const getLearningResources = async (req: Request, res: Response) => {
  try {
    const { category, type, difficulty, skills, limit = 20, page = 1 } = req.query;
    
    const filter: any = { is_active: true };
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      filter.skills = { $in: skillsArray };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const resources = await LearningResource.find(filter)
      .sort({ is_featured: -1, views: -1, created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await LearningResource.countDocuments(filter);

    res.json({
      success: true,
      resources,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
  } catch (error) {
    console.error('Error getting learning resources:', error);
    res.status(500).json({ 
      error: 'Failed to get learning resources',
      message: 'An error occurred while fetching learning resources'
    });
  }
};

/**
 * Get a specific learning resource
 */
export const getLearningResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const resource = await LearningResource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Learning resource not found' });
    }

    // Increment view count
    await LearningResource.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Error getting learning resource:', error);
    res.status(500).json({ 
      error: 'Failed to get learning resource',
      message: 'An error occurred while fetching the learning resource'
    });
  }
};

/**
 * Create a new learning resource (admin only)
 */
export const createLearningResource = async (req: any, res: Response) => {
  try {
    const {
      title,
      description,
      type,
      category,
      skills,
      difficulty,
      duration,
      language,
      content_url,
      video_url,
      video_id,
      thumbnail_url,
      author,
      source,
      tags
    } = req.body;

    const resource = new LearningResource({
      title,
      description,
      type,
      category,
      skills: skills || [],
      difficulty: difficulty || 'beginner',
      duration,
      language: language || 'en',
      content_url,
      video_url,
      video_id,
      thumbnail_url,
      author,
      source,
      tags: tags || []
    });

    await resource.save();

    res.status(201).json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Error creating learning resource:', error);
    res.status(500).json({ 
      error: 'Failed to create learning resource',
      message: 'An error occurred while creating the learning resource'
    });
  }
};

/**
 * Update a learning resource (admin only)
 */
export const updateLearningResource = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const resource = await LearningResource.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ error: 'Learning resource not found' });
    }

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Error updating learning resource:', error);
    res.status(500).json({ 
      error: 'Failed to update learning resource',
      message: 'An error occurred while updating the learning resource'
    });
  }
};

/**
 * Delete a learning resource (admin only)
 */
export const deleteLearningResource = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const resource = await LearningResource.findByIdAndDelete(id);

    if (!resource) {
      return res.status(404).json({ error: 'Learning resource not found' });
    }

    res.json({
      success: true,
      message: 'Learning resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting learning resource:', error);
    res.status(500).json({ 
      error: 'Failed to delete learning resource',
      message: 'An error occurred while deleting the learning resource'
    });
  }
};
