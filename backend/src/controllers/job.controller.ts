import type { Request, Response } from 'express';
import { Job } from '../models/Job.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const list = async (req:Request,res:Response)=>{
  const { q, skills, category, type, experience } = req.query as any;
  const filter:any = { is_active:true };
  
  if(q) filter.$text = { $search: q };
  if(skills) filter.skills = { $in: (''+skills).split(',') };
  if(category) filter.job_category = category;
  if(type) filter.type = type;
  if(experience) filter.experience_level = experience;
  
  const jobs = await Job.find(filter)
    .populate('employer_id', 'name email')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json(jobs);
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
  
  res.json(job);
};

export const create = async (req:any,res:Response)=>{
  const { 
    title, 
    description, 
    type, 
    skills, 
    location, 
    salary, 
    job_category, 
    experience_level, 
    expiry_date, 
    requirements, 
    benefits 
  } = req.body;
  
  const employer_id = (req as any).user.uid;
  
  const job = await Job.create({ 
    employer_id, 
    title, 
    description, 
    type, 
    skills, 
    location,
    salary,
    job_category,
    experience_level,
    expiry_date,
    requirements,
    benefits
  });
  
  res.status(201).json(job);
};

export const update = async (req:any,res:Response)=>{
  const { id } = req.params;
  const employer_id = (req as any).user.uid;
  
  const job = await Job.findOne({ _id: id, employer_id });
  if (!job) {
    return res.status(404).json({ error: 'Job not found or unauthorized' });
  }
  
  const updates = req.body;
  delete updates.employer_id; // Prevent changing employer
  delete updates.application_count; // Prevent manual manipulation
  
  const updatedJob = await Job.findByIdAndUpdate(
    id, 
    { ...updates, updated_at: new Date() }, 
    { new: true, runValidators: true }
  );
  
  res.json(updatedJob);
};

export const deleteJob = async (req:any,res:Response)=>{
  const { id } = req.params;
  const employer_id = (req as any).user.uid;
  
  const job = await Job.findOne({ _id: id, employer_id });
  if (!job) {
    return res.status(404).json({ error: 'Job not found or unauthorized' });
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
    .sort({ createdAt: -1 })
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
  const jobs = await Job.find({
    is_active: true,
    skills: { $in: user.skills }
  })
  .populate('employer_id', 'name email')
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();
  
  // Calculate match scores
  const jobsWithScores = jobs.map(job => {
    const matchingSkills = job.skills.filter(skill => 
      user.skills.includes(skill)
    ).length;
    const matchScore = (matchingSkills / job.skills.length) * 100;
    
    return {
      ...job,
      matchScore: Math.round(matchScore)
    };
  });
  
  res.json(jobsWithScores.sort((a, b) => b.matchScore - a.matchScore));
};
