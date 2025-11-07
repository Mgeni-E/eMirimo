import type { Request, Response } from 'express';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const list = async (req:Request,res:Response)=>{
  const { q, skills, category, type, experience, company_size } = req.query as any;
  const filter:any = {};
  
  // Show all jobs where is_active is not explicitly false
  // This includes jobs with is_active: true, undefined, or null
  // Only excludes jobs where is_active is explicitly set to false
  filter.is_active = { $ne: false };
  
  if(q) filter.$text = { $search: q };
  if(skills) filter.skills = { $in: (''+skills).split(',') };
  if(category) filter.job_category = category;
  if(type) filter.type = type;
  if(experience) filter.experience_level = experience;
  
  // Get all jobs matching filters, then filter by deadline in JavaScript
  // This is more reliable than complex MongoDB queries
  const allJobs = await Job.find(filter)
    .populate('employer_id', 'name email')
    .sort({ created_at: -1 })
    .limit(50)
    .lean();
  
  // Filter out jobs with passed deadlines
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const validJobs = allJobs.filter(job => {
    // If job has no deadline, show it
    if (!job.application_deadline && !job.expiry_date) {
      return true;
    }
    
    // Check application_deadline first, then expiry_date as fallback
    const deadline = job.application_deadline || job.expiry_date;
    if (!deadline) return true;
    
    // Handle both Date objects and ISO strings
    let deadlineDate: Date;
    if (deadline instanceof Date) {
      deadlineDate = new Date(deadline);
    } else if (typeof deadline === 'string') {
      deadlineDate = new Date(deadline);
    } else {
      // If it's some other format, try to convert
      deadlineDate = new Date(deadline as any);
    }
    
    // Check if date is valid
    if (isNaN(deadlineDate.getTime())) {
      console.warn(`Invalid deadline date for job ${job._id}:`, deadline);
      return true; // Show job if deadline is invalid (safer to show than hide)
    }
    
    deadlineDate.setHours(0, 0, 0, 0);
    
    // Show job if deadline is today or in the future
    return deadlineDate >= today;
  });
  
  // Ensure company_name is included in response
  const jobsWithCompany = validJobs.map(job => ({
    ...job,
    company_name: job.company_name || (job.employer_id as any)?.employer_profile?.company_name || (job.employer_id as any)?.name || 'Company'
  }));
  
  res.json(jobsWithCompany);
};

export const getById = async (req:Request,res:Response)=>{
  const { id } = req.params;
  
  // Validate ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid job ID format' });
  }
  
  const job = await Job.findById(id)
    .populate('employer_id', 'name email')
    .lean();
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  // Ensure company_name is included in response
  const jobWithCompany = {
    ...job,
    company_name: job.company_name || (job.employer_id as any)?.employer_profile?.company_name || (job.employer_id as any)?.name || 'Company'
  };
  
  res.json(jobWithCompany);
};

export const create = async (req:any,res:Response)=>{
  try {
    const { 
      title, 
      description, 
      type,
      job_type,
      skills, 
      required_skills,
      preferred_skills,
      location, 
      salary, 
      category,
      job_category, 
      experience_level, 
      expiry_date,
      application_deadline,
      requirements, 
      benefits,
      work_location,
      status
    } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const employer_id = (req as any).user.uid;
    
    // Fetch employer to get company_name
    const employer = await User.findById(employer_id).select('employer_profile name').lean();
    if (!employer) {
      return res.status(404).json({ error: 'Employer not found' });
    }
    
    const company_name = employer.employer_profile?.company_name || employer.name || 'Company';
    
    // Parse application deadline
    let deadlineDate: Date;
    if (application_deadline) {
      deadlineDate = new Date(application_deadline);
    } else if (expiry_date) {
      deadlineDate = new Date(expiry_date);
    } else {
      deadlineDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default: 30 days from now
    }
    
    // Validate deadline is valid and not in the past
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ error: 'Application deadline must be a valid date' });
    }
    
    // Compare dates only (ignore time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDateOnly = new Date(deadlineDate);
    deadlineDateOnly.setHours(0, 0, 0, 0);
    
    if (deadlineDateOnly < today) {
      return res.status(400).json({ error: 'Application deadline cannot be in the past' });
    }
    
    // Map fields to schema
    const jobData: any = {
      employer_id, 
      company_name, // Required field from employer profile
      title, 
      description,
      job_type: job_type || type || 'full-time',
      work_location: work_location || 'onsite', // Default to onsite if not specified
      experience_level: experience_level || 'entry',
      category: category || job_category || 'General',
      status: status || 'active',
      is_active: status !== 'draft' && status !== 'paused',
      posted_at: new Date(),
      application_deadline: deadlineDate,
      expiry_date: deadlineDate // Also set expiry_date
    };
    
    // Handle skills
    if (required_skills && Array.isArray(required_skills)) {
      jobData.required_skills = required_skills.map((s: any) => 
        typeof s === 'string' ? { name: s, level: 'intermediate', is_mandatory: true } : s
      );
    } else if (skills && Array.isArray(skills)) {
      jobData.required_skills = skills.map((s: any) => 
        typeof s === 'string' ? { name: s, level: 'intermediate', is_mandatory: true } : s
      );
    }
    
    if (preferred_skills && Array.isArray(preferred_skills)) {
      jobData.preferred_skills = preferred_skills.map((s: any) => 
        typeof s === 'string' ? { name: s, level: 'intermediate' } : s
      );
    }
    
    // Handle location
    if (location) {
      if (typeof location === 'string') {
        // Parse string like "Kigali, Rwanda" or just "Kigali"
        const parts = location.split(',').map(p => p.trim());
        jobData.location = {
          city: parts[0] || location,
          country: parts[1] || 'Rwanda',
          address: location
        };
      } else if (typeof location === 'object') {
        jobData.location = location;
      }
    } else {
      // Default location if not provided
      jobData.location = { country: 'Rwanda' };
    }
    
    // Handle salary - parse string format like "600,000 - 800,000 RWF"
    if (salary) {
      if (typeof salary === 'object') {
        jobData.salary = salary;
      } else if (typeof salary === 'number') {
        jobData.salary = { min: salary, max: salary, currency: 'RWF', period: 'monthly' };
      } else if (typeof salary === 'string' && salary.trim()) {
        // Parse string format: "600,000 - 800,000 RWF" or "600,000 RWF"
        const salaryStr = salary.replace(/,/g, ''); // Remove commas
        const rangeMatch = salaryStr.match(/(\d+)\s*-\s*(\d+)\s*(RWF|USD|EUR)?/i);
        const singleMatch = salaryStr.match(/(\d+)\s*(RWF|USD|EUR)?/i);
        
        if (rangeMatch) {
          jobData.salary = {
            min: parseInt(rangeMatch[1], 10),
            max: parseInt(rangeMatch[2], 10),
            currency: (rangeMatch[3] || 'RWF').toUpperCase(),
            period: 'monthly'
          };
        } else if (singleMatch) {
          const amount = parseInt(singleMatch[1], 10);
          jobData.salary = {
            min: amount,
            max: amount,
            currency: (singleMatch[2] || 'RWF').toUpperCase(),
            period: 'monthly'
          };
        }
      }
    }
    
    // Handle requirements
    if (requirements) {
      if (Array.isArray(requirements)) {
        jobData.requirements = requirements.map((r: any) => 
          typeof r === 'string' ? { type: 'other', description: r, is_mandatory: true } : r
        );
      }
    }
    
    // Handle benefits
    if (benefits) {
      if (Array.isArray(benefits)) {
        jobData.benefits = benefits.map((b: any) => 
          typeof b === 'string' ? { category: 'other', name: b } : b
        );
      }
    }
    
    const job = await Job.create(jobData);
    
    // Populate employer info for response
    await job.populate('employer_id', 'name email');
    
    res.status(201).json(job);
  } catch (error: any) {
    console.error('Error creating job:', error);
    res.status(500).json({ 
      error: 'Failed to create job', 
      message: error.message || 'Unknown error',
      details: error.errors || {}
    });
  }
};

export const update = async (req:any,res:Response)=>{
  try {
    const { id } = req.params;
    const employer_id = (req as any).user.uid;
    
    const job = await Job.findOne({ _id: id, employer_id });
    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }
    
    const {
      title,
      description,
      type,
      job_type,
      location,
      salary,
      category,
      job_category,
      experience_level,
      expiry_date,
      application_deadline,
      work_location,
      status,
      ...otherUpdates
    } = req.body;
    
    // Build update object
    const updateData: any = {
      updated_at: new Date(),
      ...otherUpdates
    };
    
    // Prevent changing protected fields
    delete updateData.employer_id;
    delete updateData.company_name; // Company name should come from employer profile
    delete updateData.application_count;
    delete updateData.views_count;
    delete updateData._id;
    
    // Handle title
    if (title !== undefined) updateData.title = title;
    
    // Handle description
    if (description !== undefined) updateData.description = description;
    
    // Handle job type
    if (job_type !== undefined) {
      updateData.job_type = job_type;
    } else if (type !== undefined) {
      updateData.job_type = type;
    }
    
    // Handle work location
    if (work_location !== undefined) {
      updateData.work_location = work_location;
    }
    
    // Handle experience level
    if (experience_level !== undefined) {
      updateData.experience_level = experience_level;
    }
    
    // Handle category
    if (category !== undefined) {
      updateData.category = category;
    } else if (job_category !== undefined) {
      updateData.category = job_category;
    }
    
    // Handle status
    if (status !== undefined) {
      updateData.status = status;
      // Also update is_active based on status
      if (status === 'active' || status === 'published') {
        updateData.is_active = true;
        updateData.status = 'active';
      } else if (status === 'inactive' || status === 'paused' || status === 'draft') {
        updateData.is_active = false;
        updateData.status = status === 'paused' ? 'paused' : status === 'draft' ? 'draft' : 'inactive';
      }
    }
    
    // Handle application deadline
    if (application_deadline || expiry_date) {
      let deadlineDate: Date;
      if (application_deadline) {
        deadlineDate = new Date(application_deadline);
      } else {
        deadlineDate = new Date(expiry_date);
      }
      
      // Validate deadline is valid and not in the past
      if (!isNaN(deadlineDate.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDateOnly = new Date(deadlineDate);
        deadlineDateOnly.setHours(0, 0, 0, 0);
        
        if (deadlineDateOnly >= today) {
          updateData.application_deadline = deadlineDate;
          updateData.expiry_date = deadlineDate;
        }
      }
    }
    
    // Handle location - parse string format like "Kigali, Rwanda"
    if (location !== undefined) {
      if (typeof location === 'string' && location.trim()) {
        // Parse string like "Kigali, Rwanda" or just "Kigali"
        const parts = location.split(',').map(p => p.trim());
        updateData.location = {
          city: parts[0] || location,
          country: parts[1] || 'Rwanda',
          address: location
        };
      } else if (typeof location === 'object' && location !== null) {
        updateData.location = location;
      }
    }
    
    // Handle salary - parse string format like "600,000 - 800,000 RWF"
    if (salary !== undefined) {
      if (typeof salary === 'object' && salary !== null) {
        updateData.salary = salary;
      } else if (typeof salary === 'number') {
        updateData.salary = { min: salary, max: salary, currency: 'RWF', period: 'monthly' };
      } else if (typeof salary === 'string' && salary.trim()) {
        // Parse string format: "600,000 - 800,000 RWF" or "600,000 RWF"
        const salaryStr = salary.replace(/,/g, ''); // Remove commas
        const rangeMatch = salaryStr.match(/(\d+)\s*-\s*(\d+)\s*(RWF|USD|EUR)?/i);
        const singleMatch = salaryStr.match(/(\d+)\s*(RWF|USD|EUR)?/i);
        
        if (rangeMatch) {
          updateData.salary = {
            min: parseInt(rangeMatch[1], 10),
            max: parseInt(rangeMatch[2], 10),
            currency: (rangeMatch[3] || 'RWF').toUpperCase(),
            period: 'monthly'
          };
        } else if (singleMatch) {
          const amount = parseInt(singleMatch[1], 10);
          updateData.salary = {
            min: amount,
            max: amount,
            currency: (singleMatch[2] || 'RWF').toUpperCase(),
            period: 'monthly'
          };
        }
      }
    }
    
    // Update the job in database
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employer_id', 'name email');
    
    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(updatedJob);
  } catch (error: any) {
    console.error('Error updating job:', error);
    res.status(500).json({ 
      error: 'Failed to update job', 
      message: error.message || 'Unknown error',
      details: error.errors || {}
    });
  }
};

export const deleteJob = async (req:any,res:Response)=>{
  const { id } = req.params;
  const userId = (req as any).user.uid;
  const userRole = (req as any).user.role;
  
  const job = await Job.findById(id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  // Admin can delete any job, employer can only delete their own
  if (userRole !== 'admin' && job.employer_id.toString() !== userId) {
    return res.status(403).json({ error: 'Unauthorized: You can only delete your own jobs' });
  }
  
  await Job.findByIdAndDelete(id);
  res.json({ message: 'Job deleted successfully' });
};

export const getMyJobs = async (req:any,res:Response)=>{
  const employer_id = (req as any).user.uid;
  const { status } = req.query;
  
  const filter: any = { employer_id };
  if (status === 'active') filter.is_active = true;
  if (status === 'inactive') filter.is_active = false;
  
  const jobs = await Job.find(filter)
    .sort({ created_at: -1 })
    .lean();
  
  res.json(jobs);
};

export const getRecommendations = async (req:any,res:Response)=>{
  const userId = (req as any).user.uid;
  
  // Get user profile to match skills
  const { User } = await import('../models/User.js');
  const user = await User.findById(userId);
  
  if (!user || !user.skills || user.skills.length === 0) {
    return res.json([]);
  }
  
  // Find jobs that match user skills
  // Get user skills as array of skill names
  const userSkillNames = user.skills?.map((s: any) => typeof s === 'string' ? s : s?.name).filter(Boolean) || [];
  
  // Find jobs that match user skills (check both required_skills and preferred_skills)
  // Get more jobs initially so we can calculate scores and then sort by match score
  // Include jobs with status 'active' OR is_active true (for backward compatibility)
  const jobs = await Job.find({
    $or: [
      { status: 'active' },
      { is_active: true }
    ],
    $and: [
      {
        $or: [
          { 'required_skills.name': { $in: userSkillNames } },
          { 'preferred_skills.name': { $in: userSkillNames } },
          { skills: { $in: userSkillNames } }
        ]
      }
    ]
  })
  .populate('employer_id', 'name email')
  .lean();
  
  // Calculate match scores for all matching jobs
  const jobsWithScores = jobs.map(job => {
    const jobSkills = [
      ...(job.required_skills || []).map((s: any) => typeof s === 'string' ? s : s?.name),
      ...(job.preferred_skills || []).map((s: any) => typeof s === 'string' ? s : s?.name),
      ...(job.skills || [])
    ].filter(Boolean);
    
    const matchingSkills = userSkillNames.filter(skill => 
      jobSkills.some((jobSkill: string) => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    ).length;
    
    const matchScore = jobSkills.length > 0 ? (matchingSkills / jobSkills.length) * 100 : 0;
    
    return {
      ...job,
      matchScore: Math.round(matchScore)
    };
  });
  
  // Sort by match score (highest first), then by creation date (newest first) as tiebreaker
  // Limit to top 10 after sorting by relevance
  const sortedJobs = jobsWithScores.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    // If scores are equal, prefer newer jobs
    const aDate = new Date(a.created_at || a.posted_at || 0).getTime();
    const bDate = new Date(b.created_at || b.posted_at || 0).getTime();
    return bDate - aDate;
  }).slice(0, 10);
  
  res.json(sortedJobs);
};
