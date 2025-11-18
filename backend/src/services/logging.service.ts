import type { Request, Response, NextFunction } from 'express';
import { Log } from '../models/Log.js';

export interface LogData {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export class LoggingService {
  public static async log(data: LogData): Promise<void> {
    try {
      await Log.create({
        level: data.level,
        message: data.message,
        userId: data.userId,
        action: data.action,
        metadata: data.metadata,
        ip: data.ip,
        userAgent: data.userAgent,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to log:', error);
    }
  }

  public static async getLogs(filters: {
    level?: string;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    const query: any = {};

    if (filters.level) query.level = filters.level;
    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = filters.startDate;
      if (filters.endDate) query.timestamp.$lte = filters.endDate;
    }

    return await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 100)
      .skip(filters.offset || 0)
      .lean();
  }

  public static async getAnalytics(): Promise<any> {
    const totalLogs = await Log.countDocuments();
    const logsByLevel = await Log.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);
    const logsByAction = await Log.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);
    const recentErrors = await Log.find({ level: 'error' })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    return {
      totalLogs,
      logsByLevel,
      logsByAction,
      recentErrors
    };
  }
}

// Middleware for automatic request logging (non-blocking)
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData: LogData = {
      level: res.statusCode >= 400 ? 'error' : 'info',
      message: `${req.method} ${req.path} - ${res.statusCode}`,
      userId: (req as any).user?.uid,
      action: `${req.method.toLowerCase()}_${req.path.replace(/\//g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`,
      metadata: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        query: req.query,
        params: req.params
      },
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    // Log asynchronously without blocking the response
    LoggingService.log(logData).catch(err => {
      // Silently fail logging to prevent blocking requests
      console.error('Failed to log request:', err.message);
    });
  });

  next();
};

// Middleware for error logging (non-blocking)
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const logData: LogData = {
    level: 'error',
    message: error.message,
    userId: (req as any).user?.uid,
    action: 'error',
    metadata: {
      stack: error.stack,
      method: req.method,
      path: req.path,
      query: req.query,
      params: req.params,
      body: req.body
    },
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  };

  // Log asynchronously without blocking error response
  LoggingService.log(logData).catch(err => {
    console.error('Failed to log error:', err.message);
  });
  
  next(error);
};
