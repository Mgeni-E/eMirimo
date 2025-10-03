import { Schema, model, Types } from 'mongoose';

const MentorProfileSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
  expertise: [String],
  availability: String
},{ timestamps:true });

export const MentorProfile = model('MentorProfile', MentorProfileSchema);
