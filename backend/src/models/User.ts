import { Schema, model } from 'mongoose';

export type Role = 'seeker'|'employer'|'mentor'|'admin';

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true, index: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['seeker','employer','mentor','admin'], default: 'seeker', index: true },
  locale: { type: String, default: 'en' },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  created_at: { type: Date, default: Date.now }
});

export const User = model('User', UserSchema);
