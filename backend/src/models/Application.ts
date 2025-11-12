import { Schema, model, Types } from 'mongoose';

export type ApplicationStatus = 'applied' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'interview_completed' | 'offer_made' | 'hired' | 'rejected' | 'withdrawn';
export type InterviewType = 'phone' | 'video' | 'in_person' | 'technical' | 'panel' | 'hr';
export type RejectionReason = 'not_qualified' | 'over_qualified' | 'cultural_fit' | 'salary_mismatch' | 'position_filled' | 'other';

// Enhanced Application Schema with comprehensive tracking
const ApplicationSchema = new Schema({
  // Core References
  job_id: { 
    type: Types.ObjectId, 
    ref: 'Job', 
    required: true, 
    index: true 
  },
  seeker_id: { 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  employer_id: { 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  company_name: { 
    type: String, 
    trim: true,
    index: true
  },
  
  // Application Details
  status: { 
    type: String, 
    enum: ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'interview_completed', 'offer_made', 'hired', 'rejected', 'withdrawn'],
    default: 'applied',
    index: true
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Application Content
  cover_letter: { 
    type: String,
    maxlength: 5000,
    trim: true
  },
  resume_url: { 
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty resume URL
        
        // Must be a valid HTTP/HTTPS URL
        if (!/^https?:\/\/.+/.test(v)) {
          return false;
        }
        
        // Accept direct file URLs (PDF, DOC, DOCX)
        if (/\.(pdf|doc|docx)$/i.test(v)) {
          return true;
        }
        
        // Accept Google Docs URLs (document, drive, etc.)
        if (/docs\.google\.com/i.test(v) || /drive\.google\.com/i.test(v)) {
          return true;
        }
        
        // Accept other common document hosting services
        if (/\.(dropbox|onedrive|drive\.google|box\.com|sharepoint)/i.test(v)) {
          return true;
        }
        
        // Accept Cloudinary URLs (for uploaded documents)
        if (/cloudinary\.com/i.test(v)) {
          return true;
        }
        
        // Accept any valid URL (flexible for other hosting services)
        // This allows users to use any document hosting service
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Resume must be a valid URL (PDF, DOC, Google Docs, or other document hosting service)'
    }
  },
  portfolio_url: { type: String },
  additional_documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true }
  }],
  
  // Application Questions & Responses
  custom_questions: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    is_required: { type: Boolean, default: false }
  }],
  
  // Interview Information
  interviews: [{
    type: { 
      type: String, 
      enum: ['phone', 'video', 'in_person', 'technical', 'panel', 'hr'],
      required: true
    },
    scheduled_at: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // in minutes
    location: { type: String },
    meeting_url: { type: String },
    interviewer_ids: [{ type: Types.ObjectId, ref: 'User' }],
    interviewer_names: [{ type: String }],
    status: { 
      type: String, 
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    notes: { type: String, maxlength: 2000 },
    feedback: { type: String, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 },
    created_at: { type: Date, default: Date.now }
  }],
  
  // Offer Information
  offer: {
    salary: {
      amount: { type: Number, min: 0 },
      currency: { type: String, default: 'RWF' },
      period: { 
        type: String, 
        enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly'
      }
    },
    benefits: [{ type: String }],
    start_date: { type: Date },
    offer_date: { type: Date },
    expiry_date: { type: Date },
    notes: { type: String, maxlength: 2000 },
    is_accepted: { type: Boolean, default: false },
    accepted_at: { type: Date },
    is_declined: { type: Boolean, default: false },
    declined_at: { type: Date },
    decline_reason: { type: String }
  },
  
  // Rejection Information
  rejection: {
    reason: { 
      type: String, 
      enum: ['not_qualified', 'over_qualified', 'cultural_fit', 'salary_mismatch', 'position_filled', 'other']
    },
    reason_details: { type: String, maxlength: 1000 },
    rejected_by: { type: Types.ObjectId, ref: 'User' },
    rejected_at: { type: Date },
    feedback: { type: String, maxlength: 2000 },
    can_reapply: { type: Boolean, default: false },
    reapply_after: { type: Date }
  },
  
  // Application-specific fields
  availability: { 
    type: String,
    enum: ['immediate', '2-weeks', '1-month', '2-months', '3-months'],
    default: 'immediate'
  },
  salary_expectation: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    currency: { type: String, default: 'RWF' }
  },
  additional_notes: { type: String, maxlength: 2000 },
  
  // Internal Notes & Communication
  internal_notes: { type: String, maxlength: 2000 },
  employer_notes: { type: String, maxlength: 2000 },
  seeker_notes: { type: String, maxlength: 2000 },
  
  // Communication History
  communication_log: [{
    type: { 
      type: String, 
      enum: ['email', 'phone', 'message', 'note', 'status_change'],
      required: true
    },
    direction: { 
      type: String, 
      enum: ['inbound', 'outbound'],
      required: true
    },
    content: { type: String, required: true },
    sender_id: { type: Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Scoring & Evaluation
  evaluation: {
    overall_score: { type: Number, min: 0, max: 100 },
    technical_score: { type: Number, min: 0, max: 100 },
    cultural_fit_score: { type: Number, min: 0, max: 100 },
    communication_score: { type: Number, min: 0, max: 100 },
    experience_score: { type: Number, min: 0, max: 100 },
    skills_match_score: { type: Number, min: 0, max: 100 },
    evaluator_id: { type: Types.ObjectId, ref: 'User' },
    evaluated_at: { type: Date },
    comments: { type: String, maxlength: 2000 }
  },
  
  // Timeline Tracking
  timeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    changed_by: { type: Types.ObjectId, ref: 'User' },
    notes: { type: String, maxlength: 500 }
  }],
  
  // Source Tracking
  source: {
    platform: { type: String, default: 'emirimo' },
    referrer: { type: String },
    campaign: { type: String },
    utm_source: { type: String },
    utm_medium: { type: String },
    utm_campaign: { type: String }
  },
  
  // Analytics
  views_count: { type: Number, default: 0 },
  last_viewed_at: { type: Date },
  last_viewed_by: { type: Types.ObjectId, ref: 'User' },
  
  // Flags
  is_archived: { type: Boolean, default: false },
  is_flagged: { type: Boolean, default: false },
  flag_reason: { type: String },
  is_priority: { type: Boolean, default: false },
  
  // Timestamps
  applied_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
  last_activity_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days since applied
ApplicationSchema.virtual('days_since_applied').get(function() {
  return Math.floor((Date.now() - this.applied_at.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for days since last activity
ApplicationSchema.virtual('days_since_last_activity').get(function() {
  return Math.floor((Date.now() - this.last_activity_at.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue (no activity for 7+ days)
ApplicationSchema.virtual('is_overdue').get(function() {
  return ((this as any).days_since_last_activity || 0) > 7;
});

// Virtual for has offer
ApplicationSchema.virtual('has_offer').get(function() {
  return this.offer && this.offer.salary && this.offer.salary.amount > 0;
});

// Virtual for is active (not rejected, withdrawn, or hired)
ApplicationSchema.virtual('is_active').get(function() {
  return !['rejected', 'withdrawn', 'hired'].includes(this.status);
});

// Compound indexes for better query performance
ApplicationSchema.index({ seeker_id: 1, status: 1 });
ApplicationSchema.index({ employer_id: 1, status: 1 });
ApplicationSchema.index({ job_id: 1, status: 1 });
ApplicationSchema.index({ status: 1, applied_at: -1 });
ApplicationSchema.index({ employer_id: 1, applied_at: -1 });
ApplicationSchema.index({ seeker_id: 1, applied_at: -1 });
ApplicationSchema.index({ is_archived: 1, status: 1 });
ApplicationSchema.index({ is_priority: 1, status: 1 });

// Unique constraint to prevent duplicate applications
ApplicationSchema.index({ seeker_id: 1, job_id: 1 }, { unique: true });

// Pre-save middleware
ApplicationSchema.pre('save', function(next) {
  this.updated_at = new Date();
  this.last_activity_at = new Date();
  
  // Add to timeline when status changes
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      changed_by: this.employer_id
    });
  }
  
  next();
});

// Post-save middleware to update job application count
ApplicationSchema.post('save', async function(doc) {
  if (doc.isNew) {
    const Job = model('Job');
    await Job.findByIdAndUpdate(doc.job_id, {
      $inc: { applications_count: 1 }
    });
  }
});

// Post-remove middleware to update job application count
ApplicationSchema.post('findOneAndDelete', async function(doc) {
  const Job = model('Job');
  await Job.findByIdAndUpdate(doc.job_id, {
    $inc: { applications_count: -1 }
  });
});

export const Application = model('Application', ApplicationSchema);