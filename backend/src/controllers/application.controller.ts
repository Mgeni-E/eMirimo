import type { Request, Response } from 'express';
import { Application } from '../models/Application.js';

export const apply = async (req:any,res:Response)=>{
  const { job_id } = req.body;
  const app = await Application.create({ job_id, seeker_id: req.user.uid });
  res.status(201).json(app);
};

export const myApplications = async (req:any,res:Response)=>{
  const apps = await Application.find({ seeker_id: req.user.uid }).populate('job_id').lean();
  res.json(apps);
};
