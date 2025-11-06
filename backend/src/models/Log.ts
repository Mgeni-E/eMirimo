import { Schema, model, Types } from 'mongoose';

const LogSchema = new Schema({
  level: { 
    type: String, 
    enum: ['info', 'warn', 'error', 'debug', 'critical'], 
    required: true,
    index: true
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 2000,
    trim: true
  },
  userId: { 
    type: Types.ObjectId, 
    ref: 'User', 
    index: true 
  },
  action: { 
    type: String, 
    index: true,
    trim: true
  },
  metadata: { 
    type: Schema.Types.Mixed 
  },
  ip: { 
    type: String,
    index: true,
    trim: true
  },
  userAgent: { 
    type: String,
    maxlength: 500,
    trim: true
  },
  endpoint: {
    type: String,
    trim: true,
    index: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    index: true
  },
  statusCode: {
    type: Number,
    min: 100,
    max: 599,
    index: true
  },
  responseTime: {
    type: Number, // in milliseconds
    min: 0
  },
  error: {
    name: { type: String },
    message: { type: String },
    stack: { type: String }
  },
  timestamp: { 
    type: Date, 
    default: Date.now, 
    index: true 
  }
}, { 
  timestamps: true,
  expireAfterSeconds: 90 * 24 * 60 * 60 // Auto-delete logs after 90 days
});

// Compound indexes for efficient querying
LogSchema.index({ level: 1, timestamp: -1 });
LogSchema.index({ userId: 1, timestamp: -1 });
LogSchema.index({ action: 1, timestamp: -1 });
LogSchema.index({ endpoint: 1, method: 1, timestamp: -1 });
LogSchema.index({ statusCode: 1, timestamp: -1 });
LogSchema.index({ ip: 1, timestamp: -1 });

// Text search index
LogSchema.index({
  message: 'text',
  action: 'text'
});

export const Log = model('Log', LogSchema);
