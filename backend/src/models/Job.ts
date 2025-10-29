import { Schema, model, Types } from 'mongoose';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
export type WorkLocation = 'remote' | 'hybrid' | 'onsite';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed' | 'expired';
export type ApplicationMethod = 'platform' | 'email' | 'external_url';

// Enhanced Job Schema with modern features
const JobSchema = new Schema({
  // Basic Information
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 200,
    index: true
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 10000,
    trim: true
  },
  short_description: { 
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Company & Employer
  employer_id: { 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  company_id: { 
    type: Types.ObjectId, 
    ref: 'Company', 
    index: true 
  },
  company_name: { type: String, trim: true },
  company_logo: { type: String },
  
  // Job Details
  job_type: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    required: true,
    index: true
  },
  work_location: { 
    type: String, 
    enum: ['remote', 'hybrid', 'onsite'],
    required: true,
    index: true
  },
  experience_level: { 
    type: String, 
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    required: true,
    index: true
  },
  category: { 
    type: String, 
    required: true,
    trim: true,
    index: true
  },
  subcategory: { 
    type: String,
    trim: true,
    index: true
  },
  
  // Location Information
  location: {
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'Rwanda' },
    address: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    is_remote: { type: Boolean, default: false },
    remote_allowed: { type: Boolean, default: false }
  },
  
  // Compensation
  salary: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    currency: { type: String, default: 'RWF' },
    period: { 
      type: String, 
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly'
    },
    negotiable: { type: Boolean, default: false },
    equity: { type: String },
    commission: { type: String }
  },
  
  // Skills & Requirements
  required_skills: [{
    name: { type: String, required: true, trim: true },
    level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    years_required: { type: Number, min: 0, max: 20 },
    is_mandatory: { type: Boolean, default: true }
  }],
  preferred_skills: [{
    name: { type: String, required: true, trim: true },
    level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    years_required: { type: Number, min: 0, max: 20 }
  }],
  requirements: [{
    type: { 
      type: String, 
      enum: ['education', 'experience', 'certification', 'language', 'other'],
      required: true
    },
    description: { type: String, required: true, trim: true },
    is_mandatory: { type: Boolean, default: true }
  }],
  
  // Benefits & Perks
  benefits: [{
    category: { 
      type: String, 
      enum: ['health', 'financial', 'work_life', 'professional', 'other'],
      required: true
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true }
  }],
  
  // Application Process
  application_method: { 
    type: String, 
    enum: ['platform', 'email', 'external_url'],
    default: 'platform'
  },
  application_email: { type: String },
  application_url: { type: String },
  application_instructions: { type: String, maxlength: 1000 },
  
  // Timeline
  posted_at: { type: Date, default: Date.now, index: true },
  application_deadline: { type: Date, required: true, index: true },
  start_date: { type: Date },
  expiry_date: { type: Date, index: true },
  
  // Status & Visibility
  status: { 
    type: String, 
    enum: ['draft', 'active', 'paused', 'closed', 'expired'],
    default: 'draft',
    index: true
  },
  is_featured: { type: Boolean, default: false, index: true },
  is_urgent: { type: Boolean, default: false },
  is_remote_friendly: { type: Boolean, default: false },
  
  // Analytics & Metrics
  views_count: { type: Number, default: 0 },
  applications_count: { type: Number, default: 0 },
  shortlisted_count: { type: Number, default: 0 },
  hired_count: { type: Number, default: 0 },
  saved_count: { type: Number, default: 0 },
  
  // SEO & Marketing
  tags: [{ type: String, trim: true, lowercase: true }],
  keywords: [{ type: String, trim: true, lowercase: true }],
  seo_title: { type: String, maxlength: 60 },
  seo_description: { type: String, maxlength: 160 },
  
  // Internal Notes
  internal_notes: { type: String, maxlength: 2000 },
  hiring_team: [{ 
    type: Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published_at: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days since posted
JobSchema.virtual('days_since_posted').get(function() {
  return Math.floor((Date.now() - this.posted_at.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for days until deadline
JobSchema.virtual('days_until_deadline').get(function() {
  return Math.floor((this.application_deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
});

// Virtual for application rate
JobSchema.virtual('application_rate').get(function() {
  if (this.views_count === 0) return 0;
  return Math.round((this.applications_count / this.views_count) * 100);
});

// Virtual for is expired
JobSchema.virtual('is_expired').get(function() {
  return this.expiry_date && new Date() > this.expiry_date;
});

// Virtual for is deadline passed
JobSchema.virtual('is_deadline_passed').get(function() {
  return new Date() > this.application_deadline;
});

// Compound indexes for better query performance
JobSchema.index({ status: 1, posted_at: -1 });
JobSchema.index({ employer_id: 1, status: 1 });
JobSchema.index({ category: 1, subcategory: 1, status: 1 });
JobSchema.index({ work_location: 1, job_type: 1, status: 1 });
JobSchema.index({ experience_level: 1, status: 1 });
JobSchema.index({ 'salary.min': 1, 'salary.max': 1, status: 1 });
JobSchema.index({ is_featured: 1, status: 1, posted_at: -1 });
JobSchema.index({ application_deadline: 1, status: 1 });

// Text search index
JobSchema.index({
  title: 'text',
  description: 'text',
  short_description: 'text',
  company_name: 'text',
  'required_skills.name': 'text',
  'preferred_skills.name': 'text',
  tags: 'text',
  keywords: 'text'
});

// Pre-save middleware
JobSchema.pre('save', function(next) {
  this.updated_at = new Date();
  
  // Auto-set published_at when status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.published_at) {
    this.published_at = new Date();
  }
  
  // Auto-set expiry_date if not provided (30 days from posted_at)
  if (!this.expiry_date && this.status === 'active') {
    this.expiry_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Post-save middleware to update company job count
JobSchema.post('save', async function(doc) {
  if (doc.company_id) {
    const Company = model('Company');
    await Company.findByIdAndUpdate(doc.company_id, {
      $inc: { total_jobs: 1 }
    });
  }
});

// Post-remove middleware to update company job count
JobSchema.post('remove', async function(doc) {
  if (doc.company_id) {
    const Company = model('Company');
    await Company.findByIdAndUpdate(doc.company_id, {
      $inc: { total_jobs: -1 }
    });
  }
});

export const Job = model('Job', JobSchema);