import { Schema, model } from 'mongoose';

export type Role = 'seeker'|'employer'|'admin';

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true, index: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['seeker','employer','admin'], default: 'seeker', index: true },
  locale: { type: String, default: 'en' },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  refreshToken: { type: String },
  refreshTokenExpiry: { type: Date },
  // Extended profile fields
  bio: { type: String },
  phone: { type: String },
  skills: [{ type: String }],
  linkedin: { type: String },
  address: { type: String },
  cv_url: { type: String },
  profile_image: { type: String },
  
  // Job Seeker specific fields
  education: [{
    institution: { type: String },
    degree: { type: String },
    field_of_study: { type: String },
    graduation_year: { type: Number },
    gpa: { type: String },
    achievements: [{ type: String }]
  }],
  work_experience: [{
    company: { type: String },
    position: { type: String },
    start_date: { type: Date },
    end_date: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
    achievements: [{ type: String }],
    skills_used: [{ type: String }]
  }],
  certifications: [{
    name: { type: String },
    issuer: { type: String },
    issue_date: { type: Date },
    expiry_date: { type: Date },
    credential_id: { type: String }
  }],
  languages: [{
    language: { type: String },
    proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'native'] }
  }],
  job_preferences: {
    job_types: [{ type: String, enum: ['full-time', 'part-time', 'contract', 'internship'] }],
    work_locations: [{ type: String }],
    salary_expectation: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'RWF' }
    },
    availability: { type: String, enum: ['immediate', '2-weeks', '1-month', '2-months', '3-months'] },
    remote_preference: { type: String, enum: ['remote', 'hybrid', 'onsite', 'flexible'] }
  },
  is_verified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  last_login: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const User = model('User', UserSchema);
