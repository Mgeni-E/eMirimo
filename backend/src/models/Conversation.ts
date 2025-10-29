import { Schema, model, Types } from 'mongoose';

export type ConversationType = 'general' | 'job_application' | 'interview' | 'offer' | 'support';
export type ConversationStatus = 'active' | 'archived' | 'muted' | 'blocked';

// Enhanced Conversation Schema for messaging system
const ConversationSchema = new Schema({
  // Core Participants
  participants: [{ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true,
    validate: {
      validator: function(participants: Types.ObjectId[]) {
        return participants.length >= 2 && participants.length <= 10;
      },
      message: 'Conversation must have between 2 and 10 participants'
    }
  }],
  
  // Conversation Details
  title: { 
    type: String, 
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 1000
  },
  conversation_type: { 
    type: String, 
    enum: ['general', 'job_application', 'interview', 'offer', 'support'],
    default: 'general',
    index: true
  },
  
  // Last Message Information
  last_message: { 
    type: Types.ObjectId, 
    ref: 'Message' 
  },
  last_message_at: { 
    type: Date,
    index: true
  },
  last_message_content: { 
    type: String,
    maxlength: 200
  },
  last_message_sender: { 
    type: Types.ObjectId, 
    ref: 'User' 
  },
  
  // Unread Counts
  unread_count: { 
    type: Map, 
    of: Number,
    default: new Map()
  },
  total_messages: { type: Number, default: 0 },
  
  // Conversation Status
  status: { 
    type: String, 
    enum: ['active', 'archived', 'muted', 'blocked'],
    default: 'active',
    index: true
  },
  
  // Context Information
  context: {
    job_id: { type: Types.ObjectId, ref: 'Job' },
    application_id: { type: Types.ObjectId, ref: 'Application' },
    interview_id: { type: Types.ObjectId },
    offer_id: { type: Types.ObjectId },
    support_ticket_id: { type: String }
  },
  
  // Conversation Settings
  settings: {
    is_encrypted: { type: Boolean, default: false },
    allow_file_sharing: { type: Boolean, default: true },
    allow_reactions: { type: Boolean, default: true },
    allow_editing: { type: Boolean, default: true },
    message_retention_days: { type: Number, default: 365 },
    auto_archive_days: { type: Number, default: 30 }
  },
  
  // Participant Settings
  participant_settings: [{
    user_id: { type: Types.ObjectId, ref: 'User', required: true },
    is_muted: { type: Boolean, default: false },
    is_archived: { type: Boolean, default: false },
    last_read_at: { type: Date },
    last_read_message_id: { type: Types.ObjectId, ref: 'Message' },
    notification_preferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      desktop: { type: Boolean, default: true }
    },
    joined_at: { type: Date, default: Date.now },
    left_at: { type: Date },
    is_active: { type: Boolean, default: true }
  }],
  
  // Moderation & Safety
  moderation: {
    is_moderated: { type: Boolean, default: false },
    moderator_ids: [{ type: Types.ObjectId, ref: 'User' }],
    blocked_users: [{ type: Types.ObjectId, ref: 'User' }],
    reported_count: { type: Number, default: 0 },
    last_reported_at: { type: Date }
  },
  
  // Analytics
  analytics: {
    total_views: { type: Number, default: 0 },
    total_reactions: { type: Number, default: 0 },
    total_files_shared: { type: Number, default: 0 },
    average_response_time: { type: Number }, // in minutes
    peak_activity_hour: { type: Number },
    most_active_participant: { type: Types.ObjectId, ref: 'User' }
  },
  
  // Tags & Labels
  tags: [{ 
    type: String, 
    trim: true, 
    lowercase: true 
  }],
  labels: [{
    name: { type: String, required: true },
    color: { type: String, default: '#3B82F6' },
    created_by: { type: Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now }
  }],
  
  // Archive Information
  is_archived: { type: Boolean, default: false, index: true },
  archived_at: { type: Date },
  archived_by: { type: Types.ObjectId, ref: 'User' },
  archive_reason: { type: String },
  
  // Timestamps
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for active participants
ConversationSchema.virtual('active_participants').get(function() {
  return this.participant_settings
    .filter((p: any) => p.is_active && !p.left_at)
    .map((p: any) => p.user_id);
});

// Virtual for unread count for specific user
ConversationSchema.virtual('getUnreadCount').get(function() {
  return (userId: string) => {
    return this.unread_count.get(userId) || 0;
  };
});

// Virtual for is muted for specific user
ConversationSchema.virtual('isMutedFor').get(function() {
  return (userId: string) => {
    const participant = this.participant_settings.find((p: any) => 
      p.user_id.toString() === userId
    );
    return participant ? participant.is_muted : false;
  };
});

// Virtual for last read message for specific user
ConversationSchema.virtual('getLastReadMessage').get(function() {
  return (userId: string) => {
    const participant = this.participant_settings.find((p: any) => 
      p.user_id.toString() === userId
    );
    return participant ? participant.last_read_message_id : null;
  };
});

// Virtual for conversation age
ConversationSchema.virtual('age_in_days').get(function() {
  return Math.floor((Date.now() - this.created_at.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for is recent (less than 24 hours since last message)
ConversationSchema.virtual('is_recent').get(function() {
  if (!this.last_message_at) return false;
  return (Date.now() - this.last_message_at.getTime()) < 24 * 60 * 60 * 1000;
});

// Indexes for better performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ conversation_type: 1, status: 1 });
ConversationSchema.index({ last_message_at: -1 });
ConversationSchema.index({ 'context.job_id': 1 });
ConversationSchema.index({ 'context.application_id': 1 });
ConversationSchema.index({ is_archived: 1, last_message_at: -1 });
ConversationSchema.index({ status: 1, last_message_at: -1 });

// Text search index
ConversationSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Pre-save middleware
ConversationSchema.pre('save', function(next) {
  this.updated_at = new Date();
  
  // Auto-generate title if not provided
  if (!this.title && this.participants.length === 2) {
    // For 1-on-1 conversations, we'll let the frontend handle title generation
    // based on participant names
  }
  
  next();
});

// Post-save middleware to update participant settings
ConversationSchema.post('save', async function(doc) {
  if (doc.isNew) {
    // Initialize participant settings for all participants
    const participantSettings = doc.participants.map((participantId: Types.ObjectId) => ({
      user_id: participantId,
      is_muted: false,
      is_archived: false,
      last_read_at: doc.created_at,
      notification_preferences: {
        email: true,
        push: true,
        desktop: true
      },
      joined_at: doc.created_at,
      is_active: true
    }));
    
    doc.participant_settings = participantSettings;
    await doc.save();
  }
});

// Static method to find or create conversation
ConversationSchema.statics.findOrCreate = async function(participantIds: Types.ObjectId[], context?: any) {
  // Sort participant IDs for consistent lookup
  const sortedParticipants = participantIds.sort();
  
  // Look for existing conversation
  let conversation = await this.findOne({
    participants: { $all: sortedParticipants },
    status: 'active'
  });
  
  if (!conversation) {
    // Create new conversation
    conversation = new this({
      participants: sortedParticipants,
      context: context || {},
      unread_count: new Map()
    });
    await conversation.save();
  }
  
  return conversation;
};

export const Conversation = model('Conversation', ConversationSchema);