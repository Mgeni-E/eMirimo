import { Schema, model } from 'mongoose';

const LearningResourceSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['article', 'video', 'course', 'tutorial', 'guide'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['technical', 'soft-skills', 'career', 'interview', 'resume', 'networking'], 
    required: true 
  },
  skills: [{ type: String }], // Skills this resource helps develop
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'beginner' 
  },
  duration: { type: Number }, // Duration in minutes
  language: { type: String, default: 'en' },
  
  // Content details
  content_url: { type: String }, // For articles, guides
  video_url: { type: String }, // For YouTube videos
  video_id: { type: String }, // YouTube video ID
  thumbnail_url: { type: String },
  
  // Metadata
  author: { type: String },
  source: { type: String }, // e.g., 'YouTube', 'Medium', 'Coursera'
  tags: [{ type: String }],
  
  // Engagement metrics
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 },
  
  // Status
  is_active: { type: Boolean, default: true },
  is_featured: { type: Boolean, default: false },
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Index for efficient queries
LearningResourceSchema.index({ skills: 1, category: 1, is_active: 1 });
LearningResourceSchema.index({ type: 1, difficulty: 1 });

export const LearningResource = model('LearningResource', LearningResourceSchema);
