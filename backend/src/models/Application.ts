import { Schema, model, Types } from 'mongoose';

const ApplicationSchema = new Schema({
  job_id: { type: Types.ObjectId, ref: 'Job', required: true, index: true },
  seeker_id: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['applied','shortlisted','interview','offer','hired','rejected'], default: 'applied' }
},{ timestamps:true });

ApplicationSchema.index({ seeker_id:1, job_id:1 }, { unique:true });

export const Application = model('Application', ApplicationSchema);
