import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { router as api } from './routes/index.js';
import { requestLogger, errorLogger } from './services/logging.service.js';
import config from './config/env.js';

const app = express();

app.use(helmet());
app.use(cors({ 
  origin: config.CORS_ORIGIN, 
  credentials: true 
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15*60*1000, max: 300 }));

// Logging middleware
app.use(requestLogger);

app.get('/health', (_req,res)=>res.json({ok:true,env:process.env.NODE_ENV}));
app.get('/api/health', (_req,res)=>res.json({ok:true,env:process.env.NODE_ENV}));
app.use('/api', api);

app.use(errorLogger);
app.use((err:any,_req:any,res:any,_next:any)=>{
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

export default app;
