import { Schema, model, Types } from 'mongoose';

const JobSchema = new Schema({
  employer_id: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['remote','hybrid','onsite'], default: 'remote' },
  skills: [String],
  description: String,
  location: { type: String, default: 'Remote' },
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' }
  },
  job_category: { type: String, required: true },
  experience_level: { type: String, enum: ['entry', 'mid', 'senior', 'lead'], default: 'mid' },
  posted_at: { type: Date, default: Date.now },
  application_deadline: { type: Date, required: true },
  expiry_date: { type: Date },
  requirements: [String],
  benefits: [String],
  is_active: { type: Boolean, default: true },
  is_featured: { type: Boolean, default: false },
  application_count: { type: Number, default: 0 }
},{ timestamps:true });

JobSchema.index({ title:'text', description:'text' });

export const Job = model('Job', JobSchema);
