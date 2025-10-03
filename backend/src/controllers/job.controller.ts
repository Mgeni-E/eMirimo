import type { Request, Response } from 'express';
import { Job } from '../models/Job.js';

export const list = async (req:Request,res:Response)=>{
  const { q, skills } = req.query as any;
  const filter:any = { is_active:true };
  if(q) filter.$text = { $search: q };
  if(skills) filter.skills = { $in: (''+skills).split(',') };
  const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(50).lean();
  res.json(jobs);
};

export const create = async (req:any,res:Response)=>{
  const { title, description, type, skills, location } = req.body;
  const employer_id = req.body.employer_id; 
  const job = await Job.create({ employer_id, title, description, type, skills, location });
  res.status(201).json(job);
};
