import { Schema, model, Types } from 'mongoose';

export type TestStatus = 'in_progress' | 'completed' | 'abandoned' | 'expired';
export type ResultStatus = 'pending' | 'passed' | 'failed' | 'under_review';

// Enhanced Skill Test Result Schema for comprehensive result tracking
const AnswerSchema = new Schema({
  question_id: { 
    type: Types.ObjectId, 
    required: true,
    index: true
  },
  answer: { 
    type: String, 
    required: true,
    maxlength: 5000
  },
  is_correct: { 
    type: Boolean, 
    required: true
  },
  time_taken: { 
    type: Number, 
    required: true,
    min: 0,
    max: 3600 // 1 hour max per question
  },
  points_earned: { 
    type: Number, 
    required: true,
    min: 0
  },
  max_points: { 
    type: Number, 
    required: true,
    min: 0
  },
  
  // Detailed Answer Analysis
  answer_analysis: {
    confidence_score: { type: Number, min: 0, max: 100 },
    difficulty_level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    skill_gaps: [{ type: String }],
    strengths: [{ type: String }],
    improvement_areas: [{ type: String }]
  },
  
  // Coding Specific
  coding_result: {
    code_submitted: { type: String },
    test_cases_passed: { type: Number, default: 0 },
    total_test_cases: { type: Number, default: 0 },
    execution_time: { type: Number }, // in milliseconds
    memory_usage: { type: Number }, // in bytes
    code_quality_score: { type: Number, min: 0, max: 100 },
    syntax_errors: [{ type: String }],
    runtime_errors: [{ type: String }]
  },
  
  // Essay/Practical Specific
  essay_result: {
    word_count: { type: Number },
    grammar_score: { type: Number, min: 0, max: 100 },
    content_score: { type: Number, min: 0, max: 100 },
    structure_score: { type: Number, min: 0, max: 100 },
    ai_detection_score: { type: Number, min: 0, max: 100 },
    plagiarism_score: { type: Number, min: 0, max: 100 }
  },
  
  // Timestamps
  answered_at: { type: Date, default: Date.now }
}, {
  timestamps: false
});

const SkillTestResultSchema = new Schema({
  // Core References
  user_id: { 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  assessment_id: { 
    type: Types.ObjectId, 
    ref: 'SkillAssessment', 
    required: true, 
    index: true 
  },
  
  // Test Information
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
  
  // Test Session Details
  session_id: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  test_version: { 
    type: String, 
    required: true
  },
  
  // Test Content
  questions: [{
    question_id: { type: Types.ObjectId, required: true },
    question_text: { type: String, required: true },
    question_type: { 
      type: String, 
      enum: ['multiple_choice', 'true_false', 'coding', 'practical', 'essay', 'fill_blank'],
      required: true
    },
    difficulty: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    },
    points: { type: Number, required: true },
    time_limit: { type: Number, required: true }
  }],
  
  // User Answers
  answers: [AnswerSchema],
  
  // Test Results
  total_questions: { 
    type: Number, 
    required: true,
    min: 1
  },
  correct_answers: { 
    type: Number, 
    required: true,
    min: 0
  },
  total_points: { 
    type: Number, 
    required: true,
    min: 0
  },
  earned_points: { 
    type: Number, 
    required: true,
    min: 0
  },
  score: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  
  // Test Status
  status: { 
    type: String, 
    enum: ['in_progress', 'completed', 'abandoned', 'expired'],
    default: 'in_progress',
    index: true
  },
  result_status: { 
    type: String, 
    enum: ['pending', 'passed', 'failed', 'under_review'],
    default: 'pending',
    index: true
  },
  
  // Passing Criteria
  passing_score: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  passed: { 
    type: Boolean, 
    required: true,
    index: true
  },
  
  // Timing Information
  time_limit: { 
    type: Number, 
    required: true,
    min: 1
  },
  time_taken: { 
    type: Number, 
    required: true,
    min: 0
  },
  time_remaining: { 
    type: Number, 
    default: 0
  },
  
  // Test Session Details
  started_at: { 
    type: Date, 
    required: true,
    index: true
  },
  completed_at: { 
    type: Date,
    index: true
  },
  last_activity_at: { 
    type: Date, 
    default: Date.now
  },
  
  // Proctoring & Security
  proctoring: {
    enabled: { type: Boolean, default: false },
    webcam_required: { type: Boolean, default: false },
    fullscreen_required: { type: Boolean, default: false },
    tab_switches: { type: Number, default: 0 },
    suspicious_activities: [{ 
      type: { type: String, required: true },
      timestamp: { type: Date, required: true },
      description: { type: String, required: true }
    }],
    ip_address: { type: String },
    user_agent: { type: String },
    browser_fingerprint: { type: String }
  },
  
  // Detailed Analysis
  analysis: {
    overall_performance: { 
      type: String, 
      enum: ['excellent', 'good', 'average', 'below_average', 'poor']
    },
    skill_level_assessed: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    improvement_recommendations: [{ type: String }],
    next_level_skills: [{ type: String }],
    confidence_interval: {
      lower: { type: Number, min: 0, max: 100 },
      upper: { type: Number, min: 0, max: 100 }
    }
  },
  
  // Certification
  certificate: {
    generated: { type: Boolean, default: false },
    certificate_url: { type: String },
    certificate_id: { type: String, sparse: true },
    issued_at: { type: Date },
    expires_at: { type: Date },
    verification_code: { type: String },
    is_verified: { type: Boolean, default: false },
    verified_at: { type: Date },
    verified_by: { type: Types.ObjectId, ref: 'User' }
  },
  
  // Retake Information
  retake_info: {
    is_retake: { type: Boolean, default: false },
    original_attempt_id: { type: Types.ObjectId, ref: 'SkillTestResult' },
    retake_count: { type: Number, default: 0 },
    max_retakes: { type: Number, default: 3 },
    retake_delay_hours: { type: Number, default: 24 },
    can_retake: { type: Boolean, default: true },
    retake_available_after: { type: Date }
  },
  
  // Feedback & Review
  feedback: {
    user_feedback: { type: String, maxlength: 2000 },
    user_rating: { type: Number, min: 1, max: 5 },
    difficulty_rating: { type: Number, min: 1, max: 5 },
    relevance_rating: { type: Number, min: 1, max: 5 },
    instructor_feedback: { type: String, maxlength: 2000 },
    instructor_id: { type: Types.ObjectId, ref: 'User' },
    reviewed_at: { type: Date }
  },
  
  // Analytics & Metrics
  analytics: {
    question_difficulty_distribution: { type: Schema.Types.Mixed },
    time_per_question: { type: Schema.Types.Mixed },
    skill_gap_analysis: { type: Schema.Types.Mixed },
    performance_trends: { type: Schema.Types.Mixed },
    comparison_with_peers: { type: Schema.Types.Mixed }
  },
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for completion percentage
SkillTestResultSchema.virtual('completion_percentage').get(function() {
  if (this.total_questions === 0) return 0;
  return Math.round((this.answers.length / this.total_questions) * 100);
});

// Virtual for time efficiency
SkillTestResultSchema.virtual('time_efficiency').get(function() {
  if (this.time_taken === 0) return 0;
  const expectedTime = this.time_limit * 60; // Convert to seconds
  return Math.round((expectedTime / this.time_taken) * 100);
});

// Virtual for is expired
SkillTestResultSchema.virtual('is_expired').get(function() {
  if (this.status === 'completed') return false;
  const timeElapsed = (Date.now() - this.started_at.getTime()) / (1000 * 60); // in minutes
  return timeElapsed > this.time_limit;
});

// Virtual for can retake
SkillTestResultSchema.virtual('can_retake_now').get(function() {
  if (!this.retake_info.can_retake) return false;
  if (this.retake_info.retake_count >= this.retake_info.max_retakes) return false;
  if (this.retake_info.retake_available_after) {
    return new Date() > this.retake_info.retake_available_after;
  }
  return true;
});

// Indexes for better performance
SkillTestResultSchema.index({ user_id: 1, skill_name: 1 });
SkillTestResultSchema.index({ assessment_id: 1, user_id: 1 });
SkillTestResultSchema.index({ passed: 1, score: -1 });
SkillTestResultSchema.index({ status: 1, result_status: 1 });
SkillTestResultSchema.index({ started_at: -1 });
SkillTestResultSchema.index({ completed_at: -1 });
SkillTestResultSchema.index({ 'certificate.certificate_id': 1 });

// Pre-save middleware
SkillTestResultSchema.pre('save', function(next) {
  this.updated_at = new Date();
  this.last_activity_at = new Date();
  
  // Auto-calculate score
  if (this.total_points > 0) {
    this.score = Math.round((this.earned_points / this.total_points) * 100);
  }
  
  // Auto-determine if passed
  this.passed = this.score >= this.passing_score;
  
  // Auto-set result status
  if (this.status === 'completed') {
    this.result_status = this.passed ? 'passed' : 'failed';
  }
  
  // Auto-set completed_at when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completed_at) {
    this.completed_at = new Date();
  }
  
  next();
});

// Static method to get user's best score for a skill
SkillTestResultSchema.statics.getBestScore = async function(userId: string, skillName: string) {
  return await this.findOne({
    user_id: userId,
    skill_name: skillName,
    status: 'completed'
  }).sort({ score: -1 });
};

// Static method to get user's skill progress
SkillTestResultSchema.statics.getSkillProgress = async function(userId: string, skillName: string) {
  return await this.find({
    user_id: userId,
    skill_name: skillName,
    status: 'completed'
  }).sort({ started_at: 1 });
};

// Static method to get leaderboard for a skill
SkillTestResultSchema.statics.getLeaderboard = async function(skillName: string, limit = 10) {
  return await this.find({
    skill_name: skillName,
    status: 'completed',
    passed: true
  })
  .populate('user_id', 'name profile_image')
  .sort({ score: -1, time_taken: 1 })
  .limit(limit);
};

export const SkillTestResult = model('SkillTestResult', SkillTestResultSchema);