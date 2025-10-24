import { Schema, model, Types } from 'mongoose';

const NotificationSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  title: { type: String },
  type: { 
    type: String, 
    enum: [
      'job_application', 
      'application_status_change', 
      'job_recommendation', 
      'course_recommendation',
      'interview_scheduled',
      'offer_received',
      'job_posted', 
      'system'
    ], 
    default: 'system',
    index: true
  },
  read_status: { type: Boolean, default: false, index: true },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  data: { 
    type: Schema.Types.Mixed,
    // Can contain: job_id, application_id, employer_id, etc.
  },
  action_url: { type: String }, // URL to navigate when notification is clicked
  expires_at: { type: Date }, // Optional expiration date
  created_at: { type: Date, default: Date.now, index: true }
});

NotificationSchema.index({ user_id: 1, read_status: 1 });
NotificationSchema.index({ created_at: -1 });

export const Notification = model('Notification', NotificationSchema);
