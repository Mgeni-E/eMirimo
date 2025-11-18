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

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration with proper preflight handling
const allowedOrigins = [
  'http://localhost:5173', // Vite default port
  'http://localhost:3000', // Alternative frontend port
  'http://localhost:5174', // Vite alternative port
  'https://e-mirimo.vercel.app', // Vercel production
  'https://e-mirimo-git-main-elvins-projects-78a22d58.vercel.app', // Vercel preview
  config.CORS_ORIGIN
].filter(Boolean);

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, allow any localhost origin
      if (config.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        // In production, allow Vercel preview deployments
        if (origin.includes('vercel.app')) {
          callback(null, true);
        } else if (origin.includes('render.com') || origin.includes('onrender.com')) {
          // Allow Render health checks
          callback(null, true);
        } else {
          console.warn(`⚠️  CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));
// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  });
  next();
});

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For multipart/form-data
app.use(express.raw({ type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], limit: '10mb' }));
app.use(cookieParser());

// Rate limiting with better error handling
const limiter = rateLimit({ 
  windowMs: 15*60*1000, 
  max: 300,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});
app.use(limiter);

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
  try {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    let dbPing = false;
    
    if (dbStatus === 'connected') {
      try {
        // Simple ping to verify database is responsive
        await mongoose.connection.db.command({ ping: 1 });
        dbPing = true;
      } catch {
        dbPing = false;
      }
    }
    
    const isHealthy = dbStatus === 'connected' && dbPing;
    
    res.status(isHealthy ? 200 : 503).json({ 
      ok: isHealthy,
    env: process.env.NODE_ENV,
    database: dbStatus,
      databasePing: dbPing ? 'ok' : 'failed',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime())
    });
  } catch (error: any) {
    res.status(503).json({ 
      ok: false,
      env: process.env.NODE_ENV,
      database: 'error',
      error: error.message,
    timestamp: new Date().toISOString()
  });
  }
});

app.get('/api/health', async (_req, res) => {
  try {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    let dbPing = false;
    
    if (dbStatus === 'connected') {
      try {
        // Simple ping to verify database is responsive
        await mongoose.connection.db.command({ ping: 1 });
        dbPing = true;
      } catch {
        dbPing = false;
      }
    }
    
    const isHealthy = dbStatus === 'connected' && dbPing;
    
    res.status(isHealthy ? 200 : 503).json({ 
      ok: isHealthy,
    env: process.env.NODE_ENV,
    database: dbStatus,
      databasePing: dbPing ? 'ok' : 'failed',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime())
    });
  } catch (error: any) {
    res.status(503).json({ 
      ok: false,
      env: process.env.NODE_ENV,
      database: 'error',
      error: error.message,
    timestamp: new Date().toISOString()
  });
  }
});

// API routes
app.use('/api', api);

// Error handling middleware
app.use(errorLogger);
app.use((err: any, req: any, res: any, next: any) => {
  // Don't log CORS errors as errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS policy violation',
      message: 'Origin not allowed'
    });
  }

  // Log error details
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    status: err.status || 500
  });

  // Send error response
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  // Don't expose internal errors in production
  const errorResponse: any = {
    error: status >= 500 && config.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : message
  };

  if (config.NODE_ENV === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(status).json(errorResponse);
});

export default app;
