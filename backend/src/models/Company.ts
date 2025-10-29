import { Schema, model, Types } from 'mongoose';

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type CompanyStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type Industry = 'technology' | 'finance' | 'healthcare' | 'education' | 'retail' | 'manufacturing' | 'consulting' | 'non_profit' | 'government' | 'other';

// Enhanced Company Schema with comprehensive company information
const CompanySchema = new Schema({
  // Basic Information
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 200,
    index: true
  },
  slug: { 
    type: String, 
    unique: true, 
    required: true, 
    lowercase: true,
    trim: true,
    index: true 
  },
  legal_name: { type: String, trim: true },
  description: { 
    type: String, 
    required: true,
    maxlength: 5000,
    trim: true
  },
  short_description: { 
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Company Details
  industry: { 
    type: String, 
    enum: ['technology', 'finance', 'healthcare', 'education', 'retail', 'manufacturing', 'consulting', 'non_profit', 'government', 'other'],
    required: true,
    index: true
  },
  sub_industry: { type: String, trim: true },
  company_size: { 
    type: String, 
    enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
    required: true,
    index: true
  },
  employee_count: { 
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 }
  },
  
  // Contact Information
  website: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  email: { 
    type: String,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email must be a valid email address'
    }
  },
  phone: { type: String, trim: true },
  
  // Location Information
  headquarters: {
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'Rwanda' },
    postal_code: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  offices: [{
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, default: 'Rwanda' },
    postal_code: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    is_headquarters: { type: Boolean, default: false }
  }],
  
  // Visual Identity
  logo_url: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v);
      },
      message: 'Logo must be a valid image URL'
    }
  },
  cover_image_url: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Cover image must be a valid image URL'
    }
  },
  brand_colors: {
    primary: { type: String },
    secondary: { type: String },
    accent: { type: String }
  },
  
  // Social Media & Online Presence
  social_links: {
    linkedin: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\/company\/.+/.test(v);
        },
        message: 'LinkedIn URL must be a valid LinkedIn company page URL'
      }
    },
    twitter: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/(www\.)?twitter\.com\/.+/.test(v);
        },
        message: 'Twitter URL must be a valid Twitter profile URL'
      }
    },
    facebook: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/(www\.)?facebook\.com\/.+/.test(v);
        },
        message: 'Facebook URL must be a valid Facebook page URL'
      }
    },
    instagram: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/(www\.)?instagram\.com\/.+/.test(v);
        },
        message: 'Instagram URL must be a valid Instagram profile URL'
      }
    },
    youtube: { type: String },
    github: { type: String },
    blog: { type: String }
  },
  
  // Company Culture & Values
  mission: { 
    type: String,
    maxlength: 1000,
    trim: true
  },
  vision: { 
    type: String,
    maxlength: 1000,
    trim: true
  },
  values: [{ 
    type: String,
    trim: true
  }],
  culture: [{
    aspect: { type: String, required: true },
    description: { type: String, required: true }
  }],
  
  // Benefits & Perks
  benefits: [{
    category: { 
      type: String, 
      enum: ['health', 'financial', 'work_life', 'professional', 'wellness', 'other'],
      required: true
    },
    name: { type: String, required: true },
    description: { type: String },
    is_standard: { type: Boolean, default: false }
  }],
  
  // Work Environment
  work_environment: {
    remote_policy: { 
      type: String, 
      enum: ['fully_remote', 'hybrid', 'office_based', 'flexible'],
      default: 'flexible'
    },
    work_hours: { type: String },
    dress_code: { type: String },
    office_amenities: [{ type: String }],
    team_events: { type: String },
    professional_development: { type: String }
  },
  
  // Hiring Information
  hiring_process: {
    stages: [{ 
      name: { type: String, required: true },
      description: { type: String },
      duration: { type: String },
      is_required: { type: Boolean, default: true }
    }],
    average_time_to_hire: { type: Number }, // in days
    interview_process: { type: String },
    assessment_types: [{ type: String }]
  },
  
  // Technology Stack
  technologies: [{
    category: { 
      type: String, 
      enum: ['programming_languages', 'frameworks', 'databases', 'cloud_platforms', 'tools', 'other'],
      required: true
    },
    name: { type: String, required: true },
    proficiency_level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    }
  }],
  
  // Awards & Recognition
  awards: [{
    name: { type: String, required: true },
    year: { type: Number, required: true },
    issuer: { type: String, required: true },
    category: { type: String },
    description: { type: String },
    url: { type: String }
  }],
  
  // Financial Information (optional, for verified companies)
  financial_info: {
    revenue_range: { 
      type: String, 
      enum: ['under_1m', '1m_10m', '10m_50m', '50m_100m', '100m_500m', '500m_1b', 'over_1b']
    },
    funding_rounds: [{
      round: { type: String, required: true },
      amount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      date: { type: Date, required: true },
      investors: [{ type: String }]
    }],
    is_public: { type: Boolean, default: false },
    stock_symbol: { type: String }
  },
  
  // Company Statistics
  stats: {
    total_jobs: { type: Number, default: 0 },
    active_jobs: { type: Number, default: 0 },
    total_applications: { type: Number, default: 0 },
    total_employees: { type: Number, default: 0 },
    average_rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    followers_count: { type: Number, default: 0 },
    page_views: { type: Number, default: 0 }
  },
  
  // Verification & Status
  is_verified: { type: Boolean, default: false },
  verification_date: { type: Date },
  verified_by: { type: Types.ObjectId, ref: 'User' },
  verification_documents: [{ type: String }],
  
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active',
    index: true
  },
  
  // SEO & Marketing
  seo_title: { type: String, maxlength: 60 },
  seo_description: { type: String, maxlength: 160 },
  keywords: [{ type: String, trim: true, lowercase: true }],
  tags: [{ type: String, trim: true, lowercase: true }],
  
  // Admin & Management
  admin_users: [{ 
    type: Types.ObjectId, 
    ref: 'User',
    required: true
  }],
  primary_contact: { 
    type: Types.ObjectId, 
    ref: 'User'
  },
  
  // Timestamps
  founded_year: { type: Number },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for company age
CompanySchema.virtual('company_age').get(function() {
  if (!this.founded_year) return null;
  return new Date().getFullYear() - this.founded_year;
});

// Virtual for is hiring (has active jobs)
CompanySchema.virtual('is_hiring').get(function() {
  return this.stats.active_jobs > 0;
});

// Virtual for employee count range
CompanySchema.virtual('employee_count_range').get(function() {
  if (!this.employee_count) return null;
  const { min, max } = this.employee_count;
  if (min && max) return `${min}-${max}`;
  if (min) return `${min}+`;
  if (max) return `Up to ${max}`;
  return null;
});

// Create slug from name
CompanySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes for better performance
CompanySchema.index({ name: 'text', description: 'text', short_description: 'text' });
CompanySchema.index({ industry: 1, company_size: 1, is_verified: 1 });
CompanySchema.index({ 'headquarters.city': 1, 'headquarters.country': 1 });
CompanySchema.index({ is_verified: 1, status: 1 });
CompanySchema.index({ 'stats.active_jobs': -1 });
CompanySchema.index({ created_at: -1 });

// Text search index
CompanySchema.index({
  name: 'text',
  description: 'text',
  short_description: 'text',
  industry: 'text',
  'technologies.name': 'text',
  'values': 'text',
  keywords: 'text',
  tags: 'text'
});

export const Company = model('Company', CompanySchema);