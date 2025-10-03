import type { Request, Response } from 'express';
import { MentorProfile } from '../models/MentorProfile.js';

export const upsertProfile = async (req:any,res:Response)=>{
  const { expertise, availability } = req.body;
  const doc = await MentorProfile.findOneAndUpdate(
    { user_id: req.user.uid },
    { expertise, availability, user_id: req.user.uid },
    { upsert:true, new:true }
  );
  res.json(doc);
};

export const directory = async (_req:Request,res:Response)=>{
  const list = await MentorProfile.find().select('expertise availability user_id').limit(50).lean();
  res.json(list);
};
