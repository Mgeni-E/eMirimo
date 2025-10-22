import { Schema, model, Types } from 'mongoose';

const NotificationSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['job_application', 'job_posted', 'system'], 
    default: 'system' 
  },
  read_status: { type: Boolean, default: false },
  data: { type: Schema.Types.Mixed }, // Additional data like job_id, etc.
  created_at: { type: Date, default: Date.now }
});

NotificationSchema.index({ user_id: 1, read_status: 1 });
NotificationSchema.index({ created_at: -1 });

export const Notification = model('Notification', NotificationSchema);
