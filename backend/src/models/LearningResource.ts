import { Schema, model, Types } from 'mongoose';

export type ResourceType = 'article' | 'video' | 'course' | 'tutorial' | 'guide' | 'ebook' | 'podcast' | 'webinar' | 'workshop';
export type ResourceCategory = 'technical' | 'soft_skills' | 'career' | 'interview' | 'resume' | 'networking' | 'leadership' | 'entrepreneurship' | 'industry_specific';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ResourceStatus = 'draft' | 'published' | 'archived' | 'under_review';

// Enhanced Learning Resource Schema for comprehensive learning content
const LearningResourceSchema = new Schema({
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
  
  // Resource Classification
  type: { 
    type: String, 
    enum: ['article', 'video', 'course', 'tutorial', 'guide', 'ebook', 'podcast', 'webinar', 'workshop'],
    required: true,
    index: true
  },
  category: { 
    type: String, 
    enum: ['technical', 'soft_skills', 'career', 'interview', 'resume', 'networking', 'leadership', 'entrepreneurship', 'industry_specific'],
    required: true,
    index: true
  },
  subcategory: { 
    type: String,
    trim: true,
    index: true
  },
  
  // Skills & Learning Objectives
  skills: [{ 
    type: String, 
    trim: true,
    lowercase: true,
    index: true
  }],
  learning_objectives: [{ 
    type: String,
    maxlength: 200,
    trim: true
  }],
  prerequisites: [{ 
    type: String,
    maxlength: 200,
    trim: true
  }],
  
  // Difficulty & Level
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner',
    index: true
  },
  skill_level: { 
    type: String, 
    enum: ['entry', 'mid', 'senior', 'lead'],
    default: 'entry'
  },
  
  // Content Details
  content: {
    // Text Content
    text_content: { type: String, maxlength: 50000 },
    
    // Video Content
    video_url: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Video URL must be a valid URL'
      }
    },
    video_id: { type: String }, // YouTube video ID
    video_duration: { type: Number }, // in seconds
    video_quality: { 
      type: String, 
      enum: ['360p', '480p', '720p', '1080p', '4K']
    },
    video_transcript: { type: String },
    video_subtitles: [{
      language: { type: String, required: true },
      url: { type: String, required: true }
    }],
    
    // Audio Content
    audio_url: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Audio URL must be a valid URL'
      }
    },
    audio_duration: { type: Number }, // in seconds
    
    // Document Content
    document_url: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+\.(pdf|doc|docx|ppt|pptx)$/i.test(v);
        },
        message: 'Document URL must be a valid document URL'
      }
    },
    document_type: { 
      type: String, 
      enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt']
    },
    document_pages: { type: Number },
    
    // Interactive Content
    interactive_elements: [{
      type: { 
        type: String, 
        enum: ['quiz', 'exercise', 'simulation', 'code_editor', 'assessment'],
        required: true
      },
      title: { type: String, required: true },
      content: { type: Schema.Types.Mixed, required: true },
      points: { type: Number, default: 0 }
    }],
    
    // External Resources
    external_links: [{
      title: { type: String, required: true },
      url: { type: String, required: true },
      description: { type: String, maxlength: 200 }
    }]
  },
  
  // Media & Visuals
  thumbnail_url: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Thumbnail URL must be a valid image URL'
    }
  },
  cover_image_url: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Cover image URL must be a valid image URL'
    }
  },
  gallery: [{
    url: { type: String, required: true },
    caption: { type: String, maxlength: 200 },
    alt_text: { type: String, maxlength: 100 }
  }],
  
  // Duration & Time
  duration: { 
    type: Number, 
    required: true,
    min: 1 // in minutes
  },
  estimated_reading_time: { type: Number }, // in minutes
  estimated_practice_time: { type: Number }, // in minutes
  
  // Author & Source Information
  author: {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Author email must be a valid email address'
      }
    },
    bio: { type: String, maxlength: 1000 },
    profile_image: { type: String },
    social_links: {
      linkedin: { type: String },
      twitter: { type: String },
      website: { type: String }
    }
  },
  source: { 
    type: String, 
    required: true,
    trim: true
  },
  source_url: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Source URL must be a valid URL'
    }
  },
  
  // Content Quality & Verification
  quality_score: { 
    type: Number, 
    min: 0, 
    max: 100,
    default: 0
  },
  is_verified: { type: Boolean, default: false },
  verified_by: { type: Types.ObjectId, ref: 'User' },
  verified_at: { type: Date },
  verification_notes: { type: String, maxlength: 1000 },
  
  // Content Status
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived', 'under_review'],
    default: 'draft',
    index: true
  },
  is_featured: { type: Boolean, default: false },
  is_premium: { type: Boolean, default: false },
  is_free: { type: Boolean, default: true },
  is_active: { type: Boolean, default: true },
  isYouTube: { type: Boolean, default: false },
  video_id: { type: String, index: true }, // YouTube video ID (root level for easier querying)
  video_url: { type: String }, // YouTube video URL (root level)
  
  // Pricing (for premium content)
  pricing: {
    currency: { type: String, default: 'RWF' },
    price: { type: Number, min: 0 },
    discount_price: { type: Number, min: 0 },
    discount_percentage: { type: Number, min: 0, max: 100 },
    is_on_sale: { type: Boolean, default: false },
    sale_ends_at: { type: Date }
  },
  
  // Engagement Metrics
  metrics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    average_rating: { type: Number, default: 0, min: 0, max: 5 },
    rating_count: { type: Number, default: 0 },
    comments_count: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 }
  },
  
  // User Interactions
  user_interactions: [{
    user_id: { type: Types.ObjectId, ref: 'User', required: true },
    interaction_type: { 
      type: String, 
      enum: ['view', 'like', 'dislike', 'bookmark', 'share', 'complete', 'rate', 'comment'],
      required: true
    },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    progress: { type: Number, min: 0, max: 100 }, // completion percentage
    time_spent: { type: Number, min: 0 }, // in minutes
    last_accessed: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now }
  }],
  
  // SEO & Discovery
  seo_title: { type: String, maxlength: 60 },
  seo_description: { type: String, maxlength: 160 },
  keywords: [{ type: String, trim: true, lowercase: true }],
  tags: [{ type: String, trim: true, lowercase: true }],
  slug: { 
    type: String, 
    unique: true, 
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Related Resources
  related_resources: [{ 
    type: Types.ObjectId, 
    ref: 'LearningResource' 
  }],
  prerequisites_resources: [{ 
    type: Types.ObjectId, 
    ref: 'LearningResource' 
  }],
  follow_up_resources: [{ 
    type: Types.ObjectId, 
    ref: 'LearningResource' 
  }],
  
  // Content Management
  created_by: { 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  updated_by: { type: Types.ObjectId, ref: 'User' },
  reviewed_by: { type: Types.ObjectId, ref: 'User' },
  reviewed_at: { type: Date },
  
  // Localization
  language: { type: String, default: 'en' },
  locale: { type: String, default: 'en' },
  translations: [{
    language: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String }
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

// Virtual for like ratio
LearningResourceSchema.virtual('like_ratio').get(function() {
  const total = this.metrics.likes + this.metrics.dislikes;
  if (total === 0) return 0;
  return Math.round((this.metrics.likes / total) * 100);
});

// Virtual for completion rate
LearningResourceSchema.virtual('completion_rate').get(function() {
  if (this.metrics.views === 0) return 0;
  return Math.round((this.metrics.completions / this.metrics.views) * 100);
});

// Virtual for is recently published
LearningResourceSchema.virtual('is_recently_published').get(function() {
  if (!this.published_at) return false;
  const daysSincePublished = (Date.now() - this.published_at.getTime()) / (1000 * 60 * 60 * 24);
  return daysSincePublished < 7;
});

// Virtual for is popular
LearningResourceSchema.virtual('is_popular').get(function() {
  return this.metrics.views > 1000 || this.metrics.likes > 100;
});

// Create slug from title
LearningResourceSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes for better performance
LearningResourceSchema.index({ type: 1, category: 1, status: 1 });
LearningResourceSchema.index({ skills: 1, difficulty: 1, status: 1 });
LearningResourceSchema.index({ is_featured: 1, status: 1 });
LearningResourceSchema.index({ 'metrics.views': -1 });
LearningResourceSchema.index({ 'metrics.average_rating': -1 });
LearningResourceSchema.index({ created_at: -1 });
LearningResourceSchema.index({ published_at: -1 });

// Text search index
LearningResourceSchema.index({
  title: 'text',
  description: 'text',
  short_description: 'text',
  'content.text_content': 'text',
  skills: 'text',
  keywords: 'text',
  tags: 'text'
});

// Pre-save middleware
LearningResourceSchema.pre('save', function(next) {
  this.updated_at = new Date();
  
  // Auto-set published_at when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.published_at) {
    this.published_at = new Date();
  }
  
  next();
});

// Static method to get resources by skill
LearningResourceSchema.statics.getBySkill = async function(skillName: string, options: any = {}) {
  const query: any = { 
    skills: skillName, 
    status: 'published' 
  };
  
  if (options.difficulty) {
    query.difficulty = options.difficulty;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  return await this.find(query)
    .sort({ is_featured: -1, 'metrics.views': -1 })
    .limit(options.limit || 10);
};

// Static method to get popular resources
LearningResourceSchema.statics.getPopular = async function(limit = 10) {
  return await this.find({ status: 'published' })
    .sort({ 'metrics.views': -1 })
    .limit(limit);
};

// Static method to get featured resources
LearningResourceSchema.statics.getFeatured = async function(limit = 10) {
  return await this.find({ 
    status: 'published', 
    is_featured: true 
  })
  .sort({ published_at: -1 })
  .limit(limit);
};

export const LearningResource = model('LearningResource', LearningResourceSchema);