import { Schema, model, Types } from 'mongoose';

const EmployerSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
  org_name: { type: String, required: true },
  contact_phone: String
},{ timestamps:true });

export const Employer = model('Employer', EmployerSchema);
