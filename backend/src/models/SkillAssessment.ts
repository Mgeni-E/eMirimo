import { Schema, model, Types } from 'mongoose';

export type QuestionType = 'multiple_choice' | 'true_false' | 'coding' | 'practical' | 'essay' | 'fill_blank';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type AssessmentStatus = 'draft' | 'active' | 'paused' | 'archived';

// Enhanced Skill Assessment Schema for comprehensive skill testing
const QuestionSchema = new Schema({
  // Question Content
  question: { 
    type: String, 
    required: true,
    maxlength: 2000,
    trim: true
  },
  question_type: { 
    type: String, 
    enum: ['multiple_choice', 'true_false', 'coding', 'practical', 'essay', 'fill_blank'],
    required: true
  },
  
  // Multiple Choice Options
  options: [{
    id: { type: String, required: true },
    text: { type: String, required: true, maxlength: 1000 },
    is_correct: { type: Boolean, default: false },
    explanation: { type: String, maxlength: 500 }
  }],
  
  // Correct Answer
  correct_answer: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  correct_answers: [{ 
    type: String,
    maxlength: 2000
  }], // For multiple correct answers
  
  // Answer Explanation
  explanation: { 
    type: String,
    maxlength: 2000,
    trim: true
  },
  detailed_explanation: { 
    type: String,
    maxlength: 5000,
    trim: true
  },
  
  // Question Settings
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  time_limit: { 
    type: Number, 
    default: 60,
    min: 10,
    max: 1800 // 30 minutes max
  },
  points: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 10
  },
  
  // Coding Questions
  coding: {
    language: { type: String }, // e.g., 'javascript', 'python', 'java'
    starter_code: { type: String },
    test_cases: [{
      input: { type: String, required: true },
      expected_output: { type: String, required: true },
      is_hidden: { type: Boolean, default: false }
    }],
    solution: { type: String },
    hints: [{ type: String, maxlength: 500 }]
  },
  
  // Media & Resources
  media: {
    images: [{ 
      url: { type: String, required: true },
      alt_text: { type: String },
      caption: { type: String }
    }],
    videos: [{
      url: { type: String, required: true },
      title: { type: String },
      duration: { type: Number } // in seconds
    }],
    documents: [{
      url: { type: String, required: true },
      name: { type: String, required: true },
      type: { type: String, required: true }
    }]
  },
  
  // Question Metadata
  tags: [{ type: String, trim: true, lowercase: true }],
  skills_tested: [{ type: String, trim: true }],
  learning_objectives: [{ type: String, trim: true }],
  
  // Question Statistics
  stats: {
    attempts: { type: Number, default: 0 },
    correct_attempts: { type: Number, default: 0 },
    average_time: { type: Number, default: 0 }, // in seconds
    difficulty_rating: { type: Number, default: 0 }, // 1-5 scale
    last_used: { type: Date }
  },
  
  // Question Status
  is_active: { type: Boolean, default: true },
  is_verified: { type: Boolean, default: false },
  verified_by: { type: Types.ObjectId, ref: 'User' },
  verified_at: { type: Date },
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for success rate
QuestionSchema.virtual('success_rate').get(function() {
  if (this.stats.attempts === 0) return 0;
  return Math.round((this.stats.correct_attempts / this.stats.attempts) * 100);
});

// Virtual for is recently used
QuestionSchema.virtual('is_recently_used').get(function() {
  if (!this.stats.last_used) return false;
  const daysSinceUsed = (Date.now() - this.stats.last_used.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUsed < 30;
});

const SkillAssessmentSchema = new Schema({
  // Basic Information
  title: { 
    type: String, 
    required: true,
    maxlength: 200,
    trim: true,
    index: true
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 2000,
    trim: true
  },
  short_description: { 
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Skill Information
  skill_name: { 
    type: String, 
    required: true, 
    trim: true,
    index: true
  },
  skill_category: { 
    type: String, 
    required: true,
    trim: true,
    index: true
  },
  sub_skills: [{ 
    type: String, 
    trim: true 
  }],
  
  // Assessment Content
  questions: [QuestionSchema],
  total_questions: { 
    type: Number, 
    required: true,
    min: 1,
    max: 100
  },
  
  // Assessment Settings
  time_limit: { 
    type: Number, 
    required: true,
    min: 5,
    max: 300 // 5 hours max
  },
  passing_score: { 
    type: Number, 
    default: 70,
    min: 0,
    max: 100
  },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true,
    index: true
  },
  
  // Assessment Configuration
  settings: {
    randomize_questions: { type: Boolean, default: true },
    randomize_options: { type: Boolean, default: true },
    show_correct_answers: { type: Boolean, default: false },
    show_explanations: { type: Boolean, default: true },
    allow_retake: { type: Boolean, default: true },
    max_attempts: { type: Number, default: 3 },
    retake_delay_hours: { type: Number, default: 24 },
    require_webcam: { type: Boolean, default: false },
    require_fullscreen: { type: Boolean, default: false },
    allow_skip: { type: Boolean, default: false },
    show_progress: { type: Boolean, default: true }
  },
  
  // Prerequisites
  prerequisites: [{
    skill_name: { type: String, required: true },
    level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    },
    required: { type: Boolean, default: true }
  }],
  
  // Learning Resources
  learning_resources: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['article', 'video', 'course', 'tutorial', 'documentation'],
      required: true
    },
    description: { type: String, maxlength: 500 },
    duration: { type: Number }, // in minutes
    is_required: { type: Boolean, default: false }
  }],
  
  // Certification
  certification: {
    enabled: { type: Boolean, default: true },
    certificate_template: { type: String },
    certificate_validity_days: { type: Number, default: 365 },
    issuer: { type: String, default: 'eMirimo' },
    issuer_logo: { type: String },
    verification_code: { type: String }
  },
  
  // Assessment Status
  status: { 
    type: String, 
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft',
    index: true
  },
  is_featured: { type: Boolean, default: false },
  is_public: { type: Boolean, default: true },
  
  // Creator Information
  created_by: { 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  reviewed_by: { type: Types.ObjectId, ref: 'User' },
  reviewed_at: { type: Date },
  approved_by: { type: Types.ObjectId, ref: 'User' },
  approved_at: { type: Date },
  
  // Assessment Statistics
  stats: {
    total_attempts: { type: Number, default: 0 },
    successful_attempts: { type: Number, default: 0 },
    average_score: { type: Number, default: 0 },
    average_completion_time: { type: Number, default: 0 }, // in minutes
    pass_rate: { type: Number, default: 0 },
    difficulty_rating: { type: Number, default: 0 }, // 1-5 scale
    last_attempt: { type: Date }
  },
  
  // SEO & Marketing
  seo_title: { type: String, maxlength: 60 },
  seo_description: { type: String, maxlength: 160 },
  keywords: [{ type: String, trim: true, lowercase: true }],
  tags: [{ type: String, trim: true, lowercase: true }],
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published_at: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for success rate
SkillAssessmentSchema.virtual('success_rate').get(function() {
  if (this.stats.total_attempts === 0) return 0;
  return Math.round((this.stats.successful_attempts / this.stats.total_attempts) * 100);
});

// Virtual for is recently updated
SkillAssessmentSchema.virtual('is_recently_updated').get(function() {
  const daysSinceUpdate = (Date.now() - this.updated_at.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate < 7;
});

// Virtual for estimated completion time
SkillAssessmentSchema.virtual('estimated_completion_time').get(function() {
  return Math.round(this.time_limit * 0.8); // 80% of time limit
});

// Indexes for better performance
SkillAssessmentSchema.index({ skill_name: 1, skill_category: 1, status: 1 });
SkillAssessmentSchema.index({ difficulty: 1, status: 1 });
SkillAssessmentSchema.index({ created_by: 1, status: 1 });
SkillAssessmentSchema.index({ is_featured: 1, status: 1 });
SkillAssessmentSchema.index({ 'stats.total_attempts': -1 });
SkillAssessmentSchema.index({ created_at: -1 });

// Text search index
SkillAssessmentSchema.index({
  title: 'text',
  description: 'text',
  short_description: 'text',
  skill_name: 'text',
  skill_category: 'text',
  keywords: 'text',
  tags: 'text'
});

// Pre-save middleware
SkillAssessmentSchema.pre('save', function(next) {
  this.updated_at = new Date();
  
  // Auto-calculate total questions
  this.total_questions = this.questions.length;
  
  // Auto-set published_at when status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.published_at) {
    this.published_at = new Date();
  }
  
  // Auto-calculate pass rate
  if (this.stats.total_attempts > 0) {
    this.stats.pass_rate = Math.round((this.stats.successful_attempts / this.stats.total_attempts) * 100);
  }
  
  next();
});

// Static method to get assessments by skill
SkillAssessmentSchema.statics.getBySkill = async function(skillName: string, options: any = {}) {
  const query: any = { 
    skill_name: skillName, 
    status: 'active' 
  };
  
  if (options.difficulty) {
    query.difficulty = options.difficulty;
  }
  
  return await this.find(query)
    .sort({ is_featured: -1, 'stats.total_attempts': -1 })
    .limit(options.limit || 10);
};

// Static method to get popular assessments
SkillAssessmentSchema.statics.getPopular = async function(limit = 10) {
  return await this.find({ status: 'active' })
    .sort({ 'stats.total_attempts': -1 })
    .limit(limit);
};

export const SkillAssessment = model('SkillAssessment', SkillAssessmentSchema);