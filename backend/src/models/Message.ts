import { Schema, model, Types } from 'mongoose';

export type MessageType = 'text' | 'image' | 'file' | 'application' | 'interview_invite' | 'offer' | 'rejection' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

// Enhanced Message Schema for real-time messaging
const MessageSchema = new Schema({
  // Core References
  conversation_id: { 
    type: Types.ObjectId, 
    ref: 'Conversation', 
    required: true, 
    index: true 
  },
  sender_id: { 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  receiver_id: { 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  
  // Message Content
  content: { 
    type: String, 
    required: true,
    maxlength: 10000,
    trim: true
  },
  message_type: { 
    type: String, 
    enum: ['text', 'image', 'file', 'application', 'interview_invite', 'offer', 'rejection', 'system'],
    default: 'text',
    index: true
  },
  
  // Attachments
  attachments: [{
    filename: { type: String, required: true },
    original_name: { type: String, required: true },
    url: { type: String, required: true },
    file_type: { 
      type: String, 
      enum: ['image', 'document', 'video', 'audio', 'other'],
      required: true
    },
    mime_type: { type: String, required: true },
    file_size: { type: Number, required: true }, // in bytes
    thumbnail_url: { type: String },
    duration: { type: Number }, // for video/audio files in seconds
    dimensions: {
      width: { type: Number },
      height: { type: Number }
    }
  }],
  
  // Message Status & Delivery
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent',
    index: true
  },
  is_read: { type: Boolean, default: false, index: true },
  read_at: { type: Date },
  delivered_at: { type: Date },
  failed_at: { type: Date },
  failure_reason: { type: String },
  
  // Message Threading
  reply_to: { 
    type: Types.ObjectId, 
    ref: 'Message' 
  },
  thread_id: { 
    type: Types.ObjectId, 
    ref: 'Message' 
  },
  
  // Message Context
  context: {
    job_id: { type: Types.ObjectId, ref: 'Job' },
    application_id: { type: Types.ObjectId, ref: 'Application' },
    interview_id: { type: Types.ObjectId },
    offer_id: { type: Types.ObjectId }
  },
  
  // Rich Content
  rich_content: {
    type: { 
      type: String, 
      enum: ['job_card', 'application_card', 'interview_card', 'offer_card', 'file_preview']
    },
    data: { type: Schema.Types.Mixed },
    template: { type: String }
  },
  
  // Message Actions
  actions: [{
    type: { 
      type: String, 
      enum: ['accept', 'decline', 'schedule', 'reschedule', 'view', 'download', 'apply'],
      required: true
    },
    label: { type: String, required: true },
    url: { type: String },
    data: { type: Schema.Types.Mixed },
    is_primary: { type: Boolean, default: false }
  }],
  
  // Message Metadata
  metadata: {
    client_id: { type: String }, // For client-side message tracking
    device_info: { type: String },
    ip_address: { type: String },
    user_agent: { type: String },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      city: { type: String },
      country: { type: String }
    }
  },
  
  // Message Reactions
  reactions: [{
    user_id: { type: Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
  }],
  
  // Message Editing & Deletion
  is_edited: { type: Boolean, default: false },
  edited_at: { type: Date },
  edit_history: [{
    content: { type: String, required: true },
    edited_at: { type: Date, default: Date.now },
    edited_by: { type: Types.ObjectId, ref: 'User' }
  }],
  
  is_deleted: { type: Boolean, default: false },
  deleted_at: { type: Date },
  deleted_by: { type: Types.ObjectId, ref: 'User' },
  deletion_reason: { type: String },
  
  // Message Priority & Flags
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  is_flagged: { type: Boolean, default: false },
  flag_reason: { type: String },
  is_important: { type: Boolean, default: false },
  
  // Message Encryption (for sensitive messages)
  is_encrypted: { type: Boolean, default: false },
  encryption_key: { type: String },
  
  // Timestamps
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for message age
MessageSchema.virtual('age_in_minutes').get(function() {
  return Math.floor((Date.now() - this.created_at.getTime()) / (1000 * 60));
});

// Virtual for is recent (less than 5 minutes)
MessageSchema.virtual('is_recent').get(function() {
  return this.age_in_minutes < 5;
});

// Virtual for has attachments
MessageSchema.virtual('has_attachments').get(function() {
  return this.attachments && this.attachments.length > 0;
});

// Virtual for reaction count by emoji
MessageSchema.virtual('reaction_counts').get(function() {
  const counts: { [key: string]: number } = {};
  this.reactions.forEach((reaction: any) => {
    counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
  });
  return counts;
});

// Indexes for better performance
MessageSchema.index({ conversation_id: 1, created_at: -1 });
MessageSchema.index({ sender_id: 1, receiver_id: 1, created_at: -1 });
MessageSchema.index({ is_read: 1, receiver_id: 1 });
MessageSchema.index({ status: 1, created_at: -1 });
MessageSchema.index({ message_type: 1, created_at: -1 });
MessageSchema.index({ 'context.job_id': 1 });
MessageSchema.index({ 'context.application_id': 1 });
MessageSchema.index({ is_deleted: 1, created_at: -1 });

// Text search index
MessageSchema.index({
  content: 'text'
});

// Pre-save middleware
MessageSchema.pre('save', function(next) {
  this.updated_at = new Date();
  
  // Set delivered_at when status changes to delivered
  if (this.isModified('status') && this.status === 'delivered' && !this.delivered_at) {
    this.delivered_at = new Date();
  }
  
  // Set read_at when is_read changes to true
  if (this.isModified('is_read') && this.is_read && !this.read_at) {
    this.read_at = new Date();
    this.status = 'read';
  }
  
  next();
});

// Post-save middleware to update conversation
MessageSchema.post('save', async function(doc) {
  if (doc.isNew) {
    const Conversation = model('Conversation');
    await Conversation.findByIdAndUpdate(doc.conversation_id, {
      last_message: doc._id,
      last_message_at: doc.created_at,
      $inc: { [`unread_count.${doc.receiver_id}`]: 1 }
    });
  }
});

export const Message = model('Message', MessageSchema);