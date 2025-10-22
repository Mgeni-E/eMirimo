import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const user = await User.findById(userId).select('-password_hash -refreshToken');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password_hash;
    delete updates.email;
    delete updates.role;
    delete updates.refreshToken;
    delete updates.refreshTokenExpiry;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { ...updates, updated_at: new Date() },
      { new: true, runValidators: true }
    ).select('-password_hash -refreshToken');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { profile_image: imageUrl, updated_at: new Date() },
      { new: true }
    ).select('-password_hash -refreshToken');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile image' });
  }
};

export const uploadCV = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const { cvUrl } = req.body;
    
    if (!cvUrl) {
      return res.status(400).json({ error: 'CV URL is required' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { cv_url: cvUrl, updated_at: new Date() },
      { new: true }
    ).select('-password_hash -refreshToken');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update CV' });
  }
};
