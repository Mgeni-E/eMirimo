import { Schema, model, Types } from 'mongoose';

const LogSchema = new Schema({
  level: { 
    type: String, 
    enum: ['info', 'warn', 'error', 'debug'], 
    required: true,
    index: true
  },
  message: { type: String, required: true },
  userId: { type: Types.ObjectId, ref: 'User', index: true },
  action: { type: String, index: true },
  metadata: { type: Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Index for efficient querying
LogSchema.index({ level: 1, timestamp: -1 });
LogSchema.index({ userId: 1, timestamp: -1 });
LogSchema.index({ action: 1, timestamp: -1 });

export const Log = model('Log', LogSchema);
