import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { router as api } from './routes/index.js';
import { requestLogger, errorLogger } from './services/logging.service.js';
import config from './config/env.js';

const app = express();

app.use(helmet());
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://e-mirimo.vercel.app',
      'https://e-mirimo-git-main-elvins-projects-78a22d58.vercel.app',
      config.CORS_ORIGIN
    ].filter(Boolean);
    
    // Check if the origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, allow any localhost origin
      if (config.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true 
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For multipart/form-data
app.use(express.raw({ type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], limit: '10mb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15*60*1000, max: 300 }));

// Logging middleware
app.use(requestLogger);

// Root route for Render health checks
app.get('/', (_req, res) => res.json({ 
  ok: true, 
  service: 'eMirimo API',
  version: '1.0.0',
  env: process.env.NODE_ENV,
  health: '/health',
  api: '/api/health'
}));

// Health check endpoints with database status
app.get('/health', async (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    ok: true, 
    env: process.env.NODE_ENV,
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', async (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    ok: true, 
    env: process.env.NODE_ENV,
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', api);

app.use(errorLogger);
app.use((err:any,_req:any,res:any,_next:any)=>{
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

export default app;
