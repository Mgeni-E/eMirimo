import { Schema, model, Types } from 'mongoose';

export type NotificationType = 'job_application' | 'application_status_change' | 'job_recommendation' | 'course_recommendation' | 'interview_scheduled' | 'offer_received' | 'job_posted' | 'message_received' | 'system' | 'reminder' | 'achievement' | 'security';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

// Enhanced Notification Schema for comprehensive notification system
const NotificationSchema = new Schema({
  // Core References
  user_id: { 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  
  // Notification Content
  title: { 
    type: String, 
    required: true,
    maxlength: 200,
    trim: true
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 1000,
    trim: true
  },
  short_message: { 
    type: String,
    maxlength: 100,
    trim: true
  },
  
  // Notification Type & Category
  type: { 
    type: String, 
    enum: ['job_application', 'application_status_change', 'job_recommendation', 'course_recommendation', 'interview_scheduled', 'offer_received', 'job_posted', 'message_received', 'system', 'reminder', 'achievement', 'security'],
    required: true,
    index: true
  },
  category: { 
    type: String, 
    enum: ['job', 'application', 'message', 'system', 'marketing', 'security'],
    required: true,
    index: true
  },
  
  // Notification Data & Context
  data: { 
    type: Schema.Types.Mixed,
    // Can contain: job_id, application_id, employer_id, message_id, etc.
  },
  context: {
    job_id: { type: Types.ObjectId, ref: 'Job', index: true },
    application_id: { type: Types.ObjectId, ref: 'Application', index: true },
    user_id: { type: Types.ObjectId, ref: 'User', index: true },
    interview_id: { type: Types.ObjectId },
    offer_id: { type: Types.ObjectId },
    learning_resource_id: { type: Types.ObjectId, ref: 'LearningResource', index: true }
  },
  
  // Action & Navigation
  action_url: { 
    type: String,
    validate: {
      validator: function(v: string) {
        // Allow empty, full URLs (http/https), or relative paths starting with /
        return !v || /^https?:\/\/.+/.test(v) || /^\/.+/.test(v);
      },
      message: 'Action URL must be a valid URL (http/https) or relative path (starting with /)'
    }
  },
  action_text: { type: String, maxlength: 50 },
  action_data: { type: Schema.Types.Mixed },
  
  // Rich Content
  rich_content: {
    type: { 
      type: String, 
      enum: ['job_card', 'application_card', 'message_preview', 'achievement_badge', 'image', 'video']
    },
    content: { type: Schema.Types.Mixed },
    template: { type: String }
  },
  
  // Notification Status & Delivery
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending',
    index: true
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  
  // Delivery Channels
  delivery_channels: {
    email: { 
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sent_at: { type: Date },
      failed: { type: Boolean, default: false },
      failure_reason: { type: String }
    },
    push: { 
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sent_at: { type: Date },
      failed: { type: Boolean, default: false },
      failure_reason: { type: String }
    },
    sms: { 
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sent_at: { type: Date },
      failed: { type: Boolean, default: false },
      failure_reason: { type: String }
    },
    in_app: { 
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sent_at: { type: Date }
    }
  },
  
  // Read Status & Tracking
  read_status: { 
    type: Boolean, 
    default: false, 
    index: true 
  },
  read_at: { type: Date },
  clicked: { type: Boolean, default: false },
  clicked_at: { type: Date },
  action_taken: { type: Boolean, default: false },
  action_taken_at: { type: Date },
  
  // Scheduling & Timing
  scheduled_at: { type: Date, index: true },
  expires_at: { type: Date, index: true },
  sent_at: { type: Date },
  delivered_at: { type: Date },
  
  // Retry & Failure Handling
  retry_count: { type: Number, default: 0 },
  max_retries: { type: Number, default: 3 },
  last_retry_at: { type: Date },
  failure_reason: { type: String },
  
  // Notification Preferences
  preferences: {
    user_preference: { 
      type: String, 
      enum: ['immediate', 'daily_digest', 'weekly_digest', 'disabled'],
      default: 'immediate'
    },
    quiet_hours: {
      enabled: { type: Boolean, default: false },
      start_time: { type: String }, // HH:MM format
      end_time: { type: String },   // HH:MM format
      timezone: { type: String, default: 'Africa/Kigali' }
    }
  },
  
  // Grouping & Batching
  group_id: { type: String, index: true },
  batch_id: { type: String, index: true },
  is_batchable: { type: Boolean, default: false },
  
  // Analytics & Metrics
  analytics: {
    open_rate: { type: Number, default: 0 },
    click_rate: { type: Number, default: 0 },
    conversion_rate: { type: Number, default: 0 },
    delivery_time: { type: Number }, // in milliseconds
    user_agent: { type: String },
    device_type: { 
      type: String, 
      enum: ['mobile', 'tablet', 'desktop', 'unknown'] 
    },
    platform: { 
      type: String, 
      enum: ['web', 'ios', 'android', 'email', 'sms'] 
    }
  },
  
  // Localization
  locale: { type: String, default: 'en' },
  language: { type: String, default: 'en' },
  
  // Timestamps
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age in minutes
NotificationSchema.virtual('age_in_minutes').get(function() {
  return Math.floor((Date.now() - this.created_at.getTime()) / (1000 * 60));
});

// Virtual for is expired
NotificationSchema.virtual('is_expired').get(function() {
  return this.expires_at && new Date() > this.expires_at;
});

// Virtual for is overdue (scheduled but not sent)
NotificationSchema.virtual('is_overdue').get(function() {
  return this.scheduled_at && this.scheduled_at < new Date() && this.status === 'pending';
});

// Virtual for delivery success rate
NotificationSchema.virtual('delivery_success_rate').get(function() {
  const channels = Object.values(this.delivery_channels);
  const enabledChannels = channels.filter((channel: any) => channel.enabled);
  const successfulChannels = enabledChannels.filter((channel: any) => channel.sent && !channel.failed);
  return enabledChannels.length > 0 ? (successfulChannels.length / enabledChannels.length) * 100 : 0;
});

// Indexes for better performance
NotificationSchema.index({ user_id: 1, read_status: 1, created_at: -1 });
NotificationSchema.index({ type: 1, category: 1, status: 1 });
NotificationSchema.index({ priority: 1, status: 1, created_at: -1 });
NotificationSchema.index({ scheduled_at: 1, status: 1 });
NotificationSchema.index({ expires_at: 1, status: 1 });
NotificationSchema.index({ group_id: 1, created_at: -1 });
NotificationSchema.index({ batch_id: 1, created_at: -1 });

// Text search index
NotificationSchema.index({
  title: 'text',
  message: 'text',
  short_message: 'text'
});

// Pre-save middleware
NotificationSchema.pre('save', function(next) {
  this.updated_at = new Date();
  
  // Set sent_at when status changes to sent
  if (this.isModified('status') && this.status === 'sent' && !this.sent_at) {
    this.sent_at = new Date();
  }
  
  // Set delivered_at when status changes to delivered
  if (this.isModified('status') && this.status === 'delivered' && !this.delivered_at) {
    this.delivered_at = new Date();
  }
  
  // Set read_at when read_status changes to true
  if (this.isModified('read_status') && this.read_status && !this.read_at) {
    this.read_at = new Date();
  }
  
  next();
});

// Static method to get unread count for user
NotificationSchema.statics.getUnreadCount = async function(userId: string) {
  return await this.countDocuments({
    user_id: userId,
    read_status: false,
    status: { $in: ['sent', 'delivered'] }
  });
};

// Static method to mark all as read for user
NotificationSchema.statics.markAllAsRead = async function(userId: string) {
  return await this.updateMany(
    { 
      user_id: userId, 
      read_status: false 
    },
    { 
      read_status: true, 
      read_at: new Date() 
    }
  );
};

// Static method to get notifications for user with pagination
NotificationSchema.statics.getUserNotifications = async function(
  userId: string, 
  options: {
    page?: number;
    limit?: number;
    type?: string;
    read_status?: boolean;
    priority?: string;
  } = {}
) {
  const {
    page = 1,
    limit = 20,
    type,
    read_status,
    priority
  } = options;
  
  const query: any = { user_id: userId };
  
  if (type) query.type = type;
  if (read_status !== undefined) query.read_status = read_status;
  if (priority) query.priority = priority;
  
  const skip = (page - 1) * limit;
  
  return await this.find(query)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .populate('context.job_id', 'title company_name')
    .populate('context.application_id', 'status')
    .populate('context.user_id', 'name profile_image');
};

export const Notification = model('Notification', NotificationSchema);