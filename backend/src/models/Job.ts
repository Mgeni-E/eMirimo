import { Schema, model, Types } from 'mongoose';

const JobSchema = new Schema({
  employer_id: { type: Types.ObjectId, ref: 'Employer', required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['remote','hybrid','onsite'], default: 'remote' },
  skills: [String],
  description: String,
  location: { type: String, default: 'Remote' },
  is_active: { type: Boolean, default: true }
},{ timestamps:true });

JobSchema.index({ title:'text', description:'text', skills:1 });

export const Job = model('Job', JobSchema);
