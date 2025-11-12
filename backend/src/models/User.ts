import { Schema, model } from 'mongoose';

export type Role = 'seeker' | 'employer' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type AvailabilityStatus = 'immediate' | '2-weeks' | '1-month' | '2-months' | '3-months';
export type RemotePreference = 'remote' | 'hybrid' | 'onsite' | 'flexible';

// Enhanced User Schema with better structure and modern features
const UserSchema = new Schema({
  // Basic Information
  email: { 
    type: String, 
    unique: true, 
    required: true, 
    lowercase: true,
    trim: true
  },
  password_hash: { type: String, required: true },
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  role: { 
    type: String, 
    enum: ['seeker', 'employer', 'admin'], 
    default: 'seeker', 
    index: true 
  },
  
  // Profile Information
  bio: { 
    type: String, 
    maxlength: 1000,
    trim: true
  },
  phone: { 
    type: String,
    trim: true
  },
  profile_image: { 
    type: String,
    default: '',
    validate: {
      validator: function(v: string) {
        // Allow empty string, null, or undefined
        if (!v || v.trim() === '') return true;
        // Reject blob URLs (not persistent)
        if (v.startsWith('blob:')) return false;
        // Allow any valid HTTP/HTTPS URL (including Cloudinary, etc.)
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Profile image must be a valid HTTP/HTTPS URL or empty. Blob URLs are not allowed.'
    }
  },
  cover_image: { 
    type: String,
    default: '',
    validate: {
      validator: function(v: string) {
        // Allow empty string, null, or undefined
        if (!v || v.trim() === '') return true;
        // Allow any valid HTTP/HTTPS URL (including Cloudinary, etc.)
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Cover image must be a valid URL or empty'
    }
  },
  cv_url: {
    type: String,
    default: '',
    validate: {
      validator: function(v: string) {
        // Allow empty string, null, or undefined
        if (!v || v.trim() === '') return true;
        // Allow any valid HTTP/HTTPS URL (Firebase Storage for documents)
        return /^https?:\/\/.+/.test(v);
      },
      message: 'CV URL must be a valid HTTP/HTTPS URL or empty'
    }
  },
  
  // Location & Contact
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'Rwanda' },
    postal_code: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // Skills & Expertise
  skills: [{
    name: { type: String, required: true, trim: true },
    level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'], 
      default: 'intermediate' 
    },
    years_experience: { type: Number, min: 0, max: 50 },
    verified: { type: Boolean, default: false },
    verified_at: { type: Date }
  }],
  
  // Social Links
  social_links: {
    linkedin: { 
      type: String,
      validate: {
        validator: function(v: string) {
          // Allow empty string, null, or undefined
          if (!v || v.trim() === '') return true;
          // Accept any valid LinkedIn URL (profile, company page, etc.)
          // This accepts: /in/, /company/, /pub/, /school/, /groups/, /showcase/, etc.
          return /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(v);
        },
        message: 'LinkedIn URL must be a valid LinkedIn URL (profile, company page, etc.)'
      }
    },
    github: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/(www\.)?github\.com\/.+/.test(v);
        },
        message: 'GitHub URL must be a valid GitHub profile URL'
      }
    },
    portfolio: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Portfolio URL must be a valid URL'
      }
    },
    twitter: { type: String },
    website: { type: String }
  },
  
  // Job Seeker Specific Fields
  job_seeker_profile: {
    // Professional Summary
    professional_summary: { 
      type: String, 
      maxlength: 2000,
      trim: true
    },
    
    // Education
    education: [{
      institution: { type: String, required: true, trim: true },
      degree: { type: String, required: true, trim: true },
      field_of_study: { type: String, trim: true },
      start_date: { type: Date },
      end_date: { type: Date },
      current: { type: Boolean, default: false },
      gpa: { type: String, trim: true },
      achievements: [{ type: String, trim: true }],
      description: { type: String, maxlength: 1000, trim: true }
    }],
    
    // Work Experience
    work_experience: [{
      company: { type: String, required: true, trim: true },
      position: { type: String, required: true, trim: true },
      start_date: { type: Date, required: true },
      end_date: { type: Date },
      current: { type: Boolean, default: false },
      description: { type: String, maxlength: 2000, trim: true },
      achievements: [{ type: String, trim: true }],
      skills_used: [{ type: String, trim: true }],
      location: { type: String, trim: true },
      employment_type: { 
        type: String, 
        enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
        default: 'full-time'
      }
    }],
    
    // Certifications
    certifications: [{
      name: { type: String, required: true, trim: true },
      issuer: { type: String, required: true, trim: true },
      issue_date: { type: Date, required: true },
      expiry_date: { type: Date },
      credential_id: { type: String, trim: true },
      credential_url: { type: String },
      skills: [{ type: String, trim: true }]
    }],
    
    // Languages
    languages: [{
      language: { type: String, required: true, trim: true },
      proficiency: { 
        type: String, 
        enum: ['beginner', 'intermediate', 'advanced', 'native'],
        required: true
      },
      speaking: { 
        type: String, 
        enum: ['beginner', 'intermediate', 'advanced', 'native'],
        default: 'intermediate'
      },
      reading: { 
        type: String, 
        enum: ['beginner', 'intermediate', 'advanced', 'native'],
        default: 'intermediate'
      },
      writing: { 
        type: String, 
        enum: ['beginner', 'intermediate', 'advanced', 'native'],
        default: 'intermediate'
      }
    }],
    
    // Job Preferences
    job_preferences: {
      job_types: [{ 
        type: String, 
        enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'] 
      }],
      work_locations: [{ type: String, trim: true }],
      salary_expectation: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 },
        currency: { type: String, default: 'RWF' }
      },
      availability: { 
        type: String, 
        enum: ['immediate', '2-weeks', '1-month', '2-months', '3-months'],
        default: 'immediate'
      },
      remote_preference: { 
        type: String, 
        enum: ['remote', 'hybrid', 'onsite', 'flexible'],
        default: 'flexible'
      },
      industries: [{ type: String, trim: true }],
      company_sizes: [{ 
        type: String, 
        enum: ['startup', 'small', 'medium', 'large'] 
      }],
      benefits: [{ type: String, trim: true }]
    },
    
    // Documents
    documents: {
      resume_url: { type: String },
      cover_letter_template: { type: String },
      portfolio_url: { type: String },
      other_documents: [{
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: true }
      }]
    },
    
    // Preferences
    preferences: {
      email_notifications: { type: Boolean, default: true },
      job_alerts: { type: Boolean, default: true },
      profile_visibility: { 
        type: String, 
        enum: ['public', 'private', 'employers_only'],
        default: 'public'
      },
      show_salary: { type: Boolean, default: true },
      show_contact: { type: Boolean, default: true }
    }
  },
  
  // Employer Specific Fields
  employer_profile: {
    company_name: { 
      type: String, 
      trim: true
      // Index defined below at schema level
    },
    company_description: { 
      type: String, 
      maxlength: 1000,
      trim: true
    },
    company_website: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Company website must be a valid URL'
      }
    },
    company_size: {
      type: String,
      enum: ['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '501-1000 employees', '1000+ employees'],
      trim: true
    },
    industry: {
      type: String,
      enum: ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Non-profit', 'Government', 'Other'],
      trim: true,
      index: true
    },
    position: { type: String, trim: true },
    department: { type: String, trim: true },
    hiring_authority: { type: Boolean, default: false },
    can_post_jobs: { type: Boolean, default: true },
    can_view_applications: { type: Boolean, default: true },
    can_schedule_interviews: { type: Boolean, default: true }
  },
  
  // System Fields
  locale: { type: String, default: 'en' },
  timezone: { type: String, default: 'Africa/Kigali' },
  
  // Security & Verification
  is_verified: { type: Boolean, default: false },
  verification_token: { type: String },
  verification_expires: { type: Date },
  password_reset_token: { type: String },
  password_reset_expires: { type: Date },
  refresh_token: { type: String },
  refresh_token_expires: { type: Date },
  
  // Status & Activity
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending', 'suspended'], 
    default: 'active',
    index: true
  },
  last_login: { type: Date },
  last_active: { type: Date },
  login_count: { type: Number, default: 0 },
  
  // Analytics
  profile_views: { type: Number, default: 0 },
  job_applications_count: { type: Number, default: 0 },
  jobs_posted_count: { type: Number, default: 0 },
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
UserSchema.virtual('full_name').get(function() {
  return this.name;
});

// Virtual for profile completeness
UserSchema.virtual('profile_completeness').get(function() {
  let score = 0;
  const fields = ['name', 'email', 'bio', 'skills', 'profile_image'];
  
  if (this.role === 'seeker') {
    fields.push('job_seeker_profile.professional_summary', 'job_seeker_profile.work_experience');
  } else if (this.role === 'employer') {
    fields.push('employer_profile.company_name');
  }
  
  fields.forEach(field => {
    if (this.get(field) && this.get(field).length > 0) {
      score += 1;
    }
  });
  
  return Math.round((score / fields.length) * 100);
});

// Indexes for better performance
UserSchema.index({ role: 1, status: 1 });
// Note: email index is automatically created by unique: true, no need to duplicate
UserSchema.index({ 'skills.name': 1 });
UserSchema.index({ 'job_seeker_profile.work_experience.company': 1 });
UserSchema.index({ 'job_seeker_profile.work_experience.position': 1 });
UserSchema.index({ 'employer_profile.company_name': 1 }); // For employer searches
UserSchema.index({ created_at: -1 });
UserSchema.index({ last_active: -1 });
UserSchema.index({ last_login: -1 });
UserSchema.index({ is_verified: 1, status: 1 }); // For verified user queries

// Text search index
UserSchema.index({
  name: 'text',
  bio: 'text',
  'job_seeker_profile.professional_summary': 'text',
  'job_seeker_profile.work_experience.company': 'text',
  'job_seeker_profile.work_experience.position': 'text',
  skills: 'text'
});

// Pre-save middleware
UserSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export const User = model('User', UserSchema);