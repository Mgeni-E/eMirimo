import type { Request, Response } from 'express';
import { LearningResource } from '../models/LearningResource.js';
import { YouTubeService } from '../services/youtube.service.js';

const youtubeService = new YouTubeService();

/**
 * Get all learning resources
 */
export const getLearningResources = async (req: any, res: Response) => {
  try {
    const { category, difficulty, type, search } = req.query;
    
    let filter: any = { is_active: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const resources = await LearningResource.find(filter)
      .sort({ is_featured: -1, created_at: -1 })
      .limit(50);

    res.json({
      success: true,
      resources,
      total: resources.length
    });
  } catch (error) {
    console.error('Get learning resources error:', error);
    res.status(500).json({ error: 'Failed to fetch learning resources' });
  }
};

/**
 * Get learning resources with YouTube integration
 */
export const getLearningResourcesWithYouTube = async (req: any, res: Response) => {
  try {
    const { skills, difficulty = 'beginner' } = req.query;
    
    // Get in-app resources first
    const inAppResources = await LearningResource.find({ 
      is_active: true,
      skills: { $in: skills ? skills.split(',') : [] }
    }).sort({ is_featured: -1, created_at: -1 }).limit(20);

    let youtubeResources: any[] = [];
    
    // Get YouTube resources if skills are provided
    if (skills) {
      const skillArray = skills.split(',');
      const youtubeVideos = await youtubeService.searchEducationalVideos(skillArray, difficulty);
      
      youtubeResources = youtubeVideos.map(video => 
        youtubeService.convertToLearningResource(video, skillArray, 'technical')
      );
    }

    // Combine and sort resources
    const allResources = [...inAppResources, ...youtubeResources]
      .sort((a, b) => {
        // Prioritize in-app resources, then by featured status
        if (a.source !== 'YouTube' && b.source === 'YouTube') return -1;
        if (a.source === 'YouTube' && b.source !== 'YouTube') return 1;
        return b.is_featured - a.is_featured;
      });

    res.json({
      success: true,
      resources: allResources,
      total: allResources.length,
      inAppCount: inAppResources.length,
      youtubeCount: youtubeResources.length
    });
  } catch (error) {
    console.error('Get learning resources with YouTube error:', error);
    res.status(500).json({ error: 'Failed to fetch learning resources' });
  }
};

/**
 * Get learning resource by ID
 */
export const getLearningResource = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const resource = await LearningResource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Learning resource not found' });
    }

    // Increment view count
    await LearningResource.findByIdAndUpdate(id, { 
      $inc: { views: 1 } 
    });

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Get learning resource error:', error);
    res.status(500).json({ error: 'Failed to fetch learning resource' });
  }
};

/**
 * Create a new learning resource (for admins)
 */
export const createLearningResource = async (req: any, res: Response) => {
  try {
    const resourceData = req.body;
    
    const resource = await LearningResource.create(resourceData);
    
    res.status(201).json({
      success: true,
      resource,
      message: 'Learning resource created successfully'
    });
  } catch (error) {
    console.error('Create learning resource error:', error);
    res.status(500).json({ error: 'Failed to create learning resource' });
  }
};

/**
 * Update learning resource (for admins)
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
      resource,
      message: 'Learning resource updated successfully'
    });
  } catch (error) {
    console.error('Update learning resource error:', error);
    res.status(500).json({ error: 'Failed to update learning resource' });
  }
};

/**
 * Delete learning resource (for admins)
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
    console.error('Delete learning resource error:', error);
    res.status(500).json({ error: 'Failed to delete learning resource' });
  }
};