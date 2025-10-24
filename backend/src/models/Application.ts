import { Schema, model, Types } from 'mongoose';

const ApplicationSchema = new Schema({
  job_id: { type: Types.ObjectId, ref: 'Job', required: true, index: true },
  seeker_id: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  employer_id: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  status: { 
    type: String, 
    enum: ['applied', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'], 
    default: 'applied',
    index: true
  },
  cover_letter: { type: String },
  resume_url: { type: String },
  notes: { type: String }, // Employer notes
  interview_date: { type: Date },
  interview_location: { type: String },
  salary_offered: {
    amount: { type: Number },
    currency: { type: String, default: 'RWF' }
  },
  rejection_reason: { type: String },
  applied_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

ApplicationSchema.index({ seeker_id: 1, job_id: 1 }, { unique: true });
ApplicationSchema.index({ employer_id: 1, status: 1 });
ApplicationSchema.index({ status: 1, applied_at: -1 });

export const Application = model('Application', ApplicationSchema);
