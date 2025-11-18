import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { CVParserService } from '../services/cvParser.service.js';
import { uploadFileToFirebase, isFirebaseConfigured } from '../services/firebase-storage.service.js';

// Helper: sanitize address strings to prevent repeated tokens like "Rwanda, Rwanda"
function sanitizeAddressString(raw: string): string {
  if (!raw) return '';
  const tokens = raw
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);
  const deduped: string[] = [];
  for (const t of tokens) {
    const last = deduped[deduped.length - 1];
    if (!last || last.toLowerCase() !== t.toLowerCase()) deduped.push(t);
  }
  const seen = new Set<string>();
  const finalTokens = deduped.filter(t => {
    const key = t.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return finalTokens.join(', ');
}

// Helper: map User document to a stable Job Seeker DTO expected by frontend
function mapUserToSeekerDTO(doc: any) {
  const skills = Array.isArray(doc.skills)
    ? doc.skills.map((s: any) => (typeof s === 'string' ? s : (s?.name ?? '')).trim()).filter((s: string) => s.length > 0)
    : [];

  const seeker = doc.job_seeker_profile ?? {};

  // Format address: accept either string or structured object
  const addr = doc.address;
  const addressString = typeof addr === 'string'
    ? sanitizeAddressString(addr)
    : addr && typeof addr === 'object'
      ? sanitizeAddressString([addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(', '))
      : '';

  return {
    // top-level basics
    name: doc.name ?? '',
    email: doc.email ?? '',
    bio: doc.bio ?? '',
    phone: doc.phone ?? '',
    address: addressString,
    profile_image: doc.profile_image ?? '',
    cv_url: doc.cv_url ?? doc.job_seeker_profile?.documents?.resume_url ?? '',
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
    profile_completion: computeProfileCompletion({ doc, seeker, skills }),
    is_complete: computeProfileCompletion({ doc, seeker, skills }) === 100,
  };
}

function isNonEmpty(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function computeProfileCompletion({ doc, seeker, skills }: { doc: any; seeker: any; skills: string[] }): number {
  // Use professional_summary if available, otherwise fall back to bio (they serve the same purpose)
  const professionalSummary = seeker?.professional_summary || doc?.bio;
  
  const requiredFields: any[] = [
    doc?.name,
    doc?.email,
    doc?.bio || professionalSummary, // Bio or professional_summary (counted once)
    doc?.phone,
    doc?.profile_image,
    skills,
    seeker?.work_experience,
    seeker?.education,
    seeker?.languages,
    seeker?.job_preferences?.job_types,
    seeker?.job_preferences?.availability,
  ];
  const filled = requiredFields.reduce((acc, v) => acc + (isNonEmpty(v) ? 1 : 0), 0);
  const pct = Math.round((filled / requiredFields.length) * 100);
  return isNaN(pct) ? 0 : Math.max(0, Math.min(100, pct));
}

// Helper: map User document to Employer DTO expected by frontend
function mapUserToEmployerDTO(doc: any) {
  try {
    // Safely extract nested objects with fallbacks
    const employer = (doc && typeof doc === 'object' && doc.employer_profile) 
      ? (typeof doc.employer_profile === 'object' ? doc.employer_profile : {}) 
      : {};
    const social = (doc && typeof doc === 'object' && doc.social_links) 
      ? (typeof doc.social_links === 'object' ? doc.social_links : {}) 
      : {};
    
    // Format address: accept either string or structured object
    const addr = doc?.address;
    let addressString = '';
    let city = '';
    let country = 'Rwanda';
    
    if (typeof addr === 'string') {
      addressString = sanitizeAddressString(addr);
      // Try to extract city/country from string if possible
      if (addr.includes('Rwanda')) {
        country = 'Rwanda';
      }
    } else if (addr && typeof addr === 'object') {
      const parts = [addr.street, addr.city, addr.state, addr.country].filter(Boolean);
      addressString = sanitizeAddressString(parts.join(', '));
      city = addr.city || '';
      country = addr.country || 'Rwanda';
    }

    // Safely extract all fields with proper defaults
    return {
      // Basic fields
      id: (doc?._id?.toString()) || (doc?.id) || '',
      name: (doc?.name && typeof doc.name === 'string') ? doc.name : '',
      email: (doc?.email && typeof doc.email === 'string') ? doc.email : '',
      role: (doc?.role && typeof doc.role === 'string') ? doc.role : '',
      phone: (doc?.phone && typeof doc.phone === 'string') ? doc.phone : '',
      bio: (doc?.bio && typeof doc.bio === 'string') ? doc.bio : '',
      profile_image: (doc?.profile_image && typeof doc.profile_image === 'string') ? doc.profile_image : '',
      is_verified: (doc?.is_verified === true) ? true : false,
      
      // Address fields (flattened for frontend)
      address: addressString,
      city: city,
      country: country,
      
      // Employer profile fields
      company_name: (employer?.company_name && typeof employer.company_name === 'string') ? employer.company_name : '',
      company_description: (employer?.company_description && typeof employer.company_description === 'string') ? employer.company_description : '',
      company_website: (employer?.company_website && typeof employer.company_website === 'string') ? employer.company_website : '',
      website: (employer?.company_website && typeof employer.company_website === 'string') ? employer.company_website : '', // Alias for frontend compatibility
      company_size: (employer?.company_size && typeof employer.company_size === 'string') ? employer.company_size : '',
      industry: (employer?.industry && typeof employer.industry === 'string') ? employer.industry : '',
      position: (employer?.position && typeof employer.position === 'string') ? employer.position : '',
      department: (employer?.department && typeof employer.department === 'string') ? employer.department : '',
      hiring_authority: (employer?.hiring_authority === true) ? true : false,
      can_post_jobs: (employer?.can_post_jobs === false) ? false : true, // Default to true if not explicitly false
      can_view_applications: (employer?.can_view_applications === false) ? false : true,
      can_schedule_interviews: (employer?.can_schedule_interviews === false) ? false : true,
      
      // Social links
      linkedin: (social?.linkedin && typeof social.linkedin === 'string') ? social.linkedin : '',
    };
  } catch (error) {
    console.error('Error in mapUserToEmployerDTO:', error);
    // Return a safe default DTO
    return {
      id: '',
      name: '',
      email: '',
      role: 'employer',
      phone: '',
      bio: '',
      profile_image: '',
      is_verified: false,
      address: '',
      city: '',
      country: 'Rwanda',
      company_name: '',
      company_description: '',
      company_website: '',
      website: '',
      company_size: '',
      industry: '',
      position: '',
      department: '',
      hiring_authority: false,
      can_post_jobs: true,
      can_view_applications: true,
      can_schedule_interviews: true,
      linkedin: '',
    };
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in request' });
    }
    
    const user = await User.findById(userId).select('-password_hash -refreshToken').lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return full user data based on role
    if (user.role === 'employer') {
      try {
        const dto = mapUserToEmployerDTO(user);
        res.json({ user: dto });
      } catch (dtoError) {
        console.error('Error mapping employer DTO:', dtoError);
        res.status(500).json({ 
          error: 'Failed to map employer profile', 
          message: dtoError instanceof Error ? dtoError.message : 'Unknown error',
          details: (dtoError as any)?.stack
        });
      }
    } else if (user.role === 'seeker') {
      try {
        const dto = mapUserToSeekerDTO(user);
        res.json({ user: dto });
      } catch (dtoError) {
        console.error('Error mapping seeker DTO:', dtoError);
        res.status(500).json({ 
          error: 'Failed to map seeker profile', 
          message: dtoError instanceof Error ? dtoError.message : 'Unknown error',
          details: (dtoError as any)?.stack
        });
      }
    } else {
      // For admin or other roles, return basic info
      res.json({ 
        user: { 
          id: user._id?.toString() || (user as any)._id?.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    console.error('Error stack:', (error as Error)?.stack);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: (error as any)?.stack
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const updates = req.body as any;
    
    // Get current user to check role
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password_hash;
    delete updates.email;
    delete updates.role;
    delete updates.refreshToken;
    delete updates.refreshTokenExpiry;
    delete updates.id; // Remove frontend-generated id
    delete updates._id; // Remove MongoDB _id
    
    // Remove cross-role fields to prevent data contamination
    // If user is a seeker, remove employer-specific fields
    if (currentUser.role === 'seeker') {
      delete updates.company_name;
      delete updates.company_description;
      delete updates.company_website;
      delete updates.company_size;
      delete updates.industry;
      delete updates.position;
      delete updates.department;
      delete updates.hiring_authority;
      delete updates.can_post_jobs;
      delete updates.can_view_applications;
      delete updates.can_schedule_interviews;
      delete updates.employer_profile;
    }
    // If user is an employer, remove seeker-specific fields
    else if (currentUser.role === 'employer') {
      delete updates.education;
      delete updates.work_experience;
      delete updates.certifications;
      delete updates.languages;
      delete updates.job_preferences;
      delete updates.cv_url;
      delete updates.skills; // Skills are primarily for seekers
      delete updates.job_seeker_profile;
    }
    
    const normalized: any = { updated_at: new Date() };

    // Basic top-level fields (allowed for all roles)
    if (typeof updates.name === 'string') normalized.name = updates.name;
    if (typeof updates.bio === 'string') normalized.bio = updates.bio;
    if (typeof updates.phone === 'string') normalized.phone = updates.phone;
    // Only update profile_image if it's a valid URL (not a blob URL)
    if (typeof updates.profile_image === 'string') {
      // Reject blob URLs - they're not persistent
      if (updates.profile_image.startsWith('blob:')) {
        // Don't update profile_image if it's a blob URL
        // The user should upload to Cloudinary first
      } else if (updates.profile_image.trim() === '') {
        // Allow empty string to clear the image
        normalized.profile_image = '';
      } else if (/^https?:\/\/.+/.test(updates.profile_image)) {
        // Only accept valid HTTP/HTTPS URLs
        normalized.profile_image = updates.profile_image;
      }
    }
    
    // Address: map plain string or separate city/country to address object
    if (updates.address || updates.city || updates.country) {
      // Build address object from all provided fields
      normalized.address = {
        ...(currentUser.address && typeof currentUser.address === 'object' ? currentUser.address : {}),
        ...(typeof updates.address === 'string' ? { street: sanitizeAddressString(updates.address) } : 
            updates.address && typeof updates.address === 'object' ? updates.address : {}),
        ...(updates.city !== undefined ? { city: updates.city } : {}),
        ...(updates.country !== undefined ? { country: updates.country } : {})
      };
    }

    // Social links
    if (updates.linkedin !== undefined) {
      if (!normalized.social_links) normalized.social_links = {};
      normalized.social_links.linkedin = updates.linkedin;
    }

    // Role-specific profile updates
    if (currentUser.role === 'employer') {
      // Employer profile updates
      const employer: any = {};
      if (typeof updates.company_name === 'string') employer.company_name = updates.company_name;
      if (typeof updates.company_description === 'string') employer.company_description = updates.company_description;
      if (typeof updates.company_website === 'string') employer.company_website = updates.company_website;
      // Also handle 'website' field as alias for company_website
      if (typeof updates.website === 'string') employer.company_website = updates.website;
      if (typeof updates.company_size === 'string') employer.company_size = updates.company_size;
      if (typeof updates.industry === 'string') employer.industry = updates.industry;
      if (typeof updates.position === 'string') employer.position = updates.position;
      if (typeof updates.department === 'string') employer.department = updates.department;
      if (typeof updates.hiring_authority === 'boolean') employer.hiring_authority = updates.hiring_authority;
      if (typeof updates.can_post_jobs === 'boolean') employer.can_post_jobs = updates.can_post_jobs;
      if (typeof updates.can_view_applications === 'boolean') employer.can_view_applications = updates.can_view_applications;
      if (typeof updates.can_schedule_interviews === 'boolean') employer.can_schedule_interviews = updates.can_schedule_interviews;

      if (Object.keys(employer).length > 0) {
        normalized.employer_profile = employer;
      }
    } else if (currentUser.role === 'seeker') {
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
    }

    // Use $set for nested updates to ensure proper MongoDB update
    const updateQuery: any = { $set: {} };
    Object.keys(normalized).forEach(key => {
      if (key === 'employer_profile' || key === 'job_seeker_profile' || key === 'social_links' || key === 'address') {
        // These are nested objects, set them directly
        updateQuery.$set[key] = normalized[key];
      } else if (key !== 'updated_at') {
        // Top-level fields
        updateQuery.$set[key] = normalized[key];
      }
    });
    // Always update updated_at
    updateQuery.$set.updated_at = new Date();
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateQuery,
      { new: true, runValidators: true }
    ).select('-password_hash -refreshToken').lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return appropriate DTO based on role
    if (user.role === 'employer') {
      try {
        const dto = mapUserToEmployerDTO(user);
        res.json({ user: dto });
      } catch (dtoError) {
        console.error('Error mapping employer DTO after update:', dtoError);
        res.status(500).json({ 
          error: 'Profile updated but failed to return data', 
          message: dtoError instanceof Error ? dtoError.message : 'Unknown error',
          details: (dtoError as any)?.stack
        });
      }
    } else if (user.role === 'seeker') {
      try {
        const dto = mapUserToSeekerDTO(user);
        res.json({ user: dto });
      } catch (dtoError) {
        console.error('Error mapping seeker DTO after update:', dtoError);
        res.status(500).json({ 
          error: 'Profile updated but failed to return data', 
          message: dtoError instanceof Error ? dtoError.message : 'Unknown error',
          details: (dtoError as any)?.stack
        });
      }
    } else {
      res.json({ user: { id: user._id?.toString(), name: user.name, email: user.email, role: user.role } });
    }
  } catch (error: any) {
    console.error('Update profile error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    
    // Check if it's a validation error
    if (error?.name === 'ValidationError') {
      const validationErrors: any = {};
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          validationErrors[key] = error.errors[key].message;
        });
      }
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: error.message,
        validationErrors
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update profile', 
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error?.stack
    });
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
      { new: true, runValidators: true }
    ).select('-password_hash -refreshToken').lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return appropriate DTO based on role
    if (user.role === 'employer') {
      const dto = mapUserToEmployerDTO(user);
      res.json({ user: dto });
    } else if (user.role === 'seeker') {
      const dto = mapUserToSeekerDTO(user);
      res.json({ user: dto });
    } else {
      res.json({ user: { id: user._id?.toString(), name: user.name, email: user.email, role: user.role, profile_image: user.profile_image } });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile image' });
  }
};

export const uploadCV = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const file = req.file; // From multer middleware
    const { autoFill = 'true' } = req.body; // Default to true, but can be overridden
    
    // Support both new (file upload) and legacy (URL) methods for backward compatibility
    let cvUrl: string;
    
    if (file) {
      // NEW APPROACH: Direct file upload via multer
      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size exceeds 10MB limit' });
      }

      // Get current user to preserve existing data
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Upload to Firebase Storage (required for documents)
      if (!isFirebaseConfigured()) {
        return res.status(500).json({ 
          error: 'Firebase is not configured. Please configure Firebase for document uploads.' 
        });
      }

      try {
        cvUrl = await uploadFileToFirebase(file, userId, 'emirimo/documents');
      } catch (uploadError: any) {
        console.error('Firebase upload failed:', uploadError);
        throw uploadError;
      }
    } else {
      // LEGACY APPROACH: URL provided in body (for backward compatibility)
      const { cvUrl: providedUrl, fileData, fileName } = req.body;
      if (!providedUrl) {
        return res.status(400).json({ error: 'CV file or URL is required' });
      }
      cvUrl = providedUrl;
    }
    
    // Get current user to preserve existing data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse CV and extract data if autoFill is enabled
    let parsedData: any = null;
    const shouldAutoFill = autoFill === 'true' || autoFill === true;
    
    if (shouldAutoFill) {
      try {
        // Parse from file buffer if available (preferred method)
        if (file) {
          const arrayBuffer = file.buffer.buffer.slice(
            file.buffer.byteOffset,
            file.buffer.byteOffset + file.buffer.byteLength
          );
          
          parsedData = await CVParserService.parseCVFromBuffer(arrayBuffer as ArrayBuffer, file.originalname);
          console.log('✅ Parsed CV data from file buffer:', {
            name: parsedData.name,
            skills: parsedData.skills?.length || 0,
            education: parsedData.education?.length || 0,
            work_experience: parsedData.work_experience?.length || 0,
            certifications: parsedData.certifications?.length || 0,
            languages: parsedData.languages?.length || 0
          });
        } else {
          // Legacy: Try to parse from URL (may fail if Cloudinary requires auth)
          const { fileData: base64Data, fileName: legacyFileName } = req.body;
          if (base64Data && legacyFileName) {
          // Convert base64 back to Buffer, then to ArrayBuffer
            const buffer = Buffer.from(base64Data, 'base64');
          const arrayBuffer = buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength
          );
          
            parsedData = await CVParserService.parseCVFromBuffer(arrayBuffer, legacyFileName);
            console.log('✅ Parsed CV data from base64 buffer:', {
            name: parsedData.name,
            skills: parsedData.skills?.length || 0,
            education: parsedData.education?.length || 0,
            work_experience: parsedData.work_experience?.length || 0,
            certifications: parsedData.certifications?.length || 0,
            languages: parsedData.languages?.length || 0
          });
        } else {
            // Fallback: try to parse from URL
          try {
            parsedData = await CVParserService.parseCVFromURL(cvUrl);
            console.log('Parsed CV data from URL:', parsedData);
          } catch (urlError) {
              console.warn('Failed to parse from URL:', urlError);
            // Continue without auto-fill
            }
          }
        }
      } catch (parseError) {
        console.error('CV parsing error (continuing without auto-fill):', parseError);
        // Continue without auto-fill if parsing fails
      }
    }

    // Prepare update object
    const updateData: any = {
      cv_url: cvUrl,
      updated_at: new Date()
    };

    // Update documents.resume_url in job_seeker_profile
    const seekerProfile = (currentUser.job_seeker_profile as any) || {};
    const documents = seekerProfile.documents || {};
    documents.resume_url = cvUrl;
    updateData['job_seeker_profile.documents'] = documents;

    // Auto-fill profile fields from parsed CV data
    if (parsedData && autoFill) {
      // Update basic info (only if not already set to preserve user's manual entries)
      if (parsedData.name && (!currentUser.name || currentUser.name.trim() === '')) {
        updateData.name = parsedData.name;
      }
      if (parsedData.phone && (!currentUser.phone || currentUser.phone.trim() === '')) {
        updateData.phone = parsedData.phone;
      }
      if (parsedData.address && (!currentUser.address || (typeof currentUser.address === 'object' && !currentUser.address.street))) {
        updateData.address = typeof parsedData.address === 'string' 
          ? { street: parsedData.address, country: 'Rwanda' }
          : parsedData.address;
      }

      // Update bio from professional_summary if bio is empty
      if (parsedData.professional_summary && (!currentUser.bio || currentUser.bio.trim() === '')) {
        updateData.bio = parsedData.professional_summary.substring(0, 1000);
      }

      // Update skills (merge with existing - add new skills that don't exist)
      if (parsedData.skills && parsedData.skills.length > 0) {
        const existingSkills = Array.isArray(currentUser.skills)
          ? currentUser.skills.map((s: any) => {
              const skillName = typeof s === 'string' ? s.toLowerCase() : (s?.name || '').toLowerCase();
              return skillName;
            }).filter(Boolean)
          : [];
        const newSkills = parsedData.skills.filter((s: string) => {
          const skillLower = s.toLowerCase().trim();
          return !existingSkills.some((existing: string) => existing === skillLower);
        });
        if (newSkills.length > 0) {
          const skillsToAdd = newSkills.map((name: string) => ({
            name: name.trim(),
            level: 'intermediate',
            years_experience: 0,
            verified: false
          }));
          if (!updateData.$push) updateData.$push = {};
          updateData.$push.skills = { $each: skillsToAdd };
        }
      }

      // Update job_seeker_profile fields - merge with existing
      if (parsedData.professional_summary && (!seekerProfile.professional_summary || seekerProfile.professional_summary.trim() === '')) {
        updateData['job_seeker_profile.professional_summary'] = parsedData.professional_summary.substring(0, 2000);
      }

      // Merge education (only add new entries that don't already exist)
      if (parsedData.education && parsedData.education.length > 0) {
        const existingEdu = Array.isArray(seekerProfile.education) ? seekerProfile.education : [];
        const newEdu = parsedData.education.filter((edu: any) => {
          // Check if this education entry already exists
          return !existingEdu.some((e: any) => {
            const sameInstitution = e.institution && edu.institution && 
              e.institution.toLowerCase().trim() === edu.institution.toLowerCase().trim();
            const sameDegree = e.degree && edu.degree && 
              e.degree.toLowerCase().trim() === edu.degree.toLowerCase().trim();
            return sameInstitution && sameDegree;
          });
        });
        if (newEdu.length > 0) {
          // Normalize and validate education entries before adding
          const normalizedEdu = newEdu
            .map((edu: any) => {
              // Clean and validate each field
              const institution = edu.institution ? edu.institution.trim().replace(/[^\w\s\.,;:!?\-'()\[\]{}\/\\@#&*+=<>|~`"–—•]/g, ' ').substring(0, 200) : '';
              const degree = edu.degree ? edu.degree.trim().replace(/[^\w\s\.,;:!?\-'()\[\]{}\/\\@#&*+=<>|~`"–—•]/g, ' ').substring(0, 100) : '';
              const fieldOfStudy = edu.field_of_study ? edu.field_of_study.trim().replace(/[^\w\s\.,;:!?\-'()\[\]{}\/\\@#&*+=<>|~`"–—•]/g, ' ').substring(0, 100) : '';
              
              // Validate graduation year
              let graduationYear = edu.graduation_year;
              if (graduationYear) {
                const currentYear = new Date().getFullYear();
                if (graduationYear < 1950 || graduationYear > currentYear + 5) {
                  graduationYear = undefined;
                }
              }
              
              // Only include if we have valid data
              if (!institution && !degree && !graduationYear) {
                return null;
              }
              
              return {
                institution: institution || undefined,
                degree: degree || undefined,
                field_of_study: fieldOfStudy || undefined,
                graduation_year: graduationYear,
                gpa: edu.gpa ? edu.gpa.toString().replace(/[^\d.]/g, '').substring(0, 20) : undefined,
            achievements: Array.isArray(edu.achievements) ? edu.achievements : []
              };
            })
            .filter((edu: any) => edu !== null); // Remove invalid entries
          
          if (normalizedEdu.length > 0) {
          const updatedEdu = [...existingEdu, ...normalizedEdu];
          updateData['job_seeker_profile.education'] = updatedEdu;
          }
        }
      }

      // Merge work experience (only add new entries that don't already exist)
      if (parsedData.work_experience && parsedData.work_experience.length > 0) {
        const existingExp = Array.isArray(seekerProfile.work_experience) ? seekerProfile.work_experience : [];
        const newExp = parsedData.work_experience.filter((exp: any) => {
          // Check if this work experience already exists
          return !existingExp.some((e: any) => {
            const sameCompany = e.company && exp.company && 
              e.company.toLowerCase().trim() === exp.company.toLowerCase().trim();
            const samePosition = e.position && exp.position && 
              e.position.toLowerCase().trim() === exp.position.toLowerCase().trim();
            return sameCompany && samePosition;
          });
        });
        if (newExp.length > 0) {
          // Normalize work experience entries before adding
          const normalizedExp = newExp.map((exp: any) => {
            // Parse dates if they're strings
            let startDate = exp.start_date;
            let endDate = exp.end_date;
            
            if (typeof startDate === 'string' && startDate.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)) {
              try {
                startDate = new Date(startDate).toISOString();
              } catch {
                startDate = undefined;
              }
            }
            
            if (typeof endDate === 'string' && endDate.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)) {
              try {
                endDate = new Date(endDate).toISOString();
              } catch {
                endDate = undefined;
              }
            }
            
            return {
              company: (exp.company || 'Company').trim().substring(0, 200),
              position: (exp.position || 'Position').trim().substring(0, 200),
              start_date: startDate ? new Date(startDate) : undefined,
              end_date: exp.current ? undefined : (endDate ? new Date(endDate) : undefined),
              current: exp.current || false,
              description: (exp.description || '').trim().substring(0, 2000),
              achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
              skills_used: Array.isArray(exp.skills_used) ? exp.skills_used : []
            };
          });
          const updatedExp = [...existingExp, ...normalizedExp];
          updateData['job_seeker_profile.work_experience'] = updatedExp;
        }
      }

      // Merge certifications (only add new entries)
      if (parsedData.certifications && parsedData.certifications.length > 0) {
        const existingCerts = Array.isArray(seekerProfile.certifications) ? seekerProfile.certifications : [];
        const newCerts = parsedData.certifications.filter((cert: any) => {
          return !existingCerts.some((c: any) => {
            const sameName = c.name && cert.name && 
              c.name.toLowerCase().trim() === cert.name.toLowerCase().trim();
            const sameIssuer = c.issuer && cert.issuer && 
              c.issuer.toLowerCase().trim() === cert.issuer.toLowerCase().trim();
            return sameName && sameIssuer;
          });
        });
        if (newCerts.length > 0) {
          // Normalize certification entries
          const normalizedCerts = newCerts.map((cert: any) => {
            let issueDate = cert.issue_date;
            if (typeof issueDate === 'string') {
              try {
                issueDate = new Date(issueDate).toISOString();
              } catch {
                issueDate = undefined;
              }
            }
            
            return {
              name: (cert.name || '').trim().substring(0, 200),
              issuer: (cert.issuer || '').trim().substring(0, 200),
              issue_date: issueDate ? new Date(issueDate) : new Date(),
              expiry_date: cert.expiry_date ? new Date(cert.expiry_date) : undefined,
              credential_id: (cert.credential_id || '').trim().substring(0, 100),
              credential_url: (cert.credential_url || '').trim().substring(0, 500)
            };
          });
          const updatedCerts = [...existingCerts, ...normalizedCerts];
          updateData['job_seeker_profile.certifications'] = updatedCerts;
        }
      }

      // Merge languages (only add new entries)
      if (parsedData.languages && parsedData.languages.length > 0) {
        const existingLangs = Array.isArray(seekerProfile.languages) ? seekerProfile.languages : [];
        const newLangs = parsedData.languages.filter((lang: any) => {
          return !existingLangs.some((l: any) => {
            const langName = (l.language || '').toLowerCase().trim();
            const parsedLangName = (lang.language || '').toLowerCase().trim();
            return langName === parsedLangName && langName.length > 0;
          });
        });
        if (newLangs.length > 0) {
          // Normalize language entries
          const normalizedLangs = newLangs.map((lang: any) => ({
            language: (lang.language || '').trim().substring(0, 100),
            proficiency: ['beginner', 'intermediate', 'advanced', 'native'].includes(lang.proficiency) 
              ? lang.proficiency 
              : 'intermediate'
          }));
          const updatedLangs = [...existingLangs, ...normalizedLangs];
          updateData['job_seeker_profile.languages'] = updatedLangs;
        }
      }
    }

    // Update user with CV URL and parsed data
    // Structure the update operation properly for MongoDB
    const setData: any = { $set: {} };
    const pushData: any = {};
    
    // Handle $set operations
    Object.keys(updateData).forEach(key => {
      if (key === '$push') {
        // Handle $push operations separately
        if (updateData.$push) {
          Object.keys(updateData.$push).forEach(pushKey => {
            pushData[pushKey] = updateData.$push[pushKey];
          });
        }
      } else if (key !== 'updated_at') {
        // All other fields go to $set
        setData.$set[key] = updateData[key];
      }
    });
    
    setData.$set.updated_at = new Date();
    
    // Combine $set and $push operations
    const updateOperation: any = { ...setData };
    if (Object.keys(pushData).length > 0) {
      updateOperation.$push = pushData;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateOperation,
      { new: true, runValidators: true }
    ).select('-password_hash -refreshToken');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const dto = mapUserToSeekerDTO(user);
    res.json({ 
      user: dto,
      parsed: parsedData ? {
        fieldsExtracted: {
          name: !!parsedData.name,
          phone: !!parsedData.phone,
          skills: parsedData.skills?.length || 0,
          education: parsedData.education?.length || 0,
          work_experience: parsedData.work_experience?.length || 0,
          certifications: parsedData.certifications?.length || 0,
          languages: parsedData.languages?.length || 0
        }
      } : null
    });
  } catch (error) {
    console.error('Error uploading CV:', error);
    res.status(500).json({ error: 'Failed to update CV', message: error instanceof Error ? error.message : 'Unknown error' });
  }
};
