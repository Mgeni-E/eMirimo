import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

// Helper: map User document to a stable Job Seeker DTO expected by frontend
function mapUserToSeekerDTO(doc: any) {
  const skills = Array.isArray(doc.skills)
    ? doc.skills.map((s: any) => (typeof s === 'string' ? s : (s?.name ?? '')).trim()).filter((s: string) => s.length > 0)
    : [];

  const seeker = doc.job_seeker_profile ?? {};

  // Format address: accept either string or structured object
  const addr = doc.address;
  const addressString = typeof addr === 'string'
    ? addr
    : addr && typeof addr === 'object'
      ? [addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(', ')
      : '';

  return {
    // top-level basics
    name: doc.name ?? '',
    email: doc.email ?? '',
    bio: doc.bio ?? '',
    phone: doc.phone ?? '',
    address: addressString,
    profile_image: doc.profile_image ?? '',
    cv_url: doc.cv_url ?? '',
    skills,
    // seeker nested fields flattened for frontend
    education: Array.isArray(seeker.education) ? seeker.education : [],
    work_experience: Array.isArray(seeker.work_experience) ? seeker.work_experience : [],
    certifications: Array.isArray(seeker.certifications) ? seeker.certifications : [],
    languages: Array.isArray(seeker.languages) ? seeker.languages : [],
    job_preferences: {
      job_types: Array.isArray(seeker.job_preferences?.job_types) ? seeker.job_preferences.job_types : [],
      work_locations: Array.isArray(seeker.job_preferences?.work_locations) ? seeker.job_preferences.work_locations : [],
      salary_expectation: {
        min: seeker.job_preferences?.salary_expectation?.min ?? 0,
        max: seeker.job_preferences?.salary_expectation?.max ?? 0,
        currency: seeker.job_preferences?.salary_expectation?.currency ?? 'RWF',
      },
      availability: seeker.job_preferences?.availability ?? 'immediate',
      remote_preference: seeker.job_preferences?.remote_preference ?? 'flexible',
    },
  };
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const user = await User.findById(userId).select('-password_hash -refreshToken').lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Serve a stable DTO for the frontend
    res.json({ user: mapUserToSeekerDTO(user) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const updates = req.body as any;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password_hash;
    delete updates.email;
    delete updates.role;
    delete updates.refreshToken;
    delete updates.refreshTokenExpiry;
    // Normalize/seeker-specific transformation
    const normalized: any = { updated_at: new Date() };

    // Basic top-level fields (allowed)
    if (typeof updates.name === 'string') normalized.name = updates.name;
    if (typeof updates.bio === 'string') normalized.bio = updates.bio;
    if (typeof updates.phone === 'string') normalized.phone = updates.phone;
    if (typeof updates.profile_image === 'string') normalized.profile_image = updates.profile_image;
    // Address: map plain string to address.street; accept object as-is
    if (typeof updates.address === 'string') {
      normalized.address = { street: updates.address };
    } else if (updates.address && typeof updates.address === 'object') {
      normalized.address = updates.address;
    }

    // Skills: accept string[] and map to schema objects if needed
    if (Array.isArray(updates.skills)) {
      if (updates.skills.length > 0 && typeof updates.skills[0] === 'string') {
        normalized.skills = updates.skills
          .filter((s: unknown) => typeof s === 'string' && s.trim().length > 0)
          .map((name: string) => ({ name: name.trim(), level: 'intermediate', years_experience: 0, verified: false }));
      } else {
        normalized.skills = updates.skills;
      }
    }

    // Seeker profile nesting
    const seeker: any = {};
    if (Array.isArray(updates.education)) seeker.education = updates.education;
    if (Array.isArray(updates.work_experience)) seeker.work_experience = updates.work_experience;
    if (Array.isArray(updates.certifications)) seeker.certifications = updates.certifications;
    if (Array.isArray(updates.languages)) seeker.languages = updates.languages;
    if (updates.job_preferences) seeker.job_preferences = updates.job_preferences;

    if (Object.keys(seeker).length > 0) {
      normalized.job_seeker_profile = seeker;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      normalized,
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
