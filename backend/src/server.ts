import mongoose from 'mongoose';
import { createServer } from 'http';
import app from './app.js';
import config, { validateEnv } from './config/env.js';
import { initializeSocketService } from './services/socket.service.js';
import { JobPostingHooks } from './hooks/jobPosting.hooks.js';
import { ScheduledJobsService } from './services/scheduledJobs.service.js';
import { initializeModels } from './models/index.js';
import { initializeFirebase } from './services/firebase-storage.service.js';

// Validate environment configuration (silently)
validateEnv();

// Initialize Firebase Admin SDK (required for document uploads)
const firebaseInitialized = initializeFirebase();
if (!firebaseInitialized) {
  console.warn('⚠️  Firebase not initialized - document uploads will fail');
  console.warn('   Please configure Firebase environment variables for document uploads');
}

// Global error handlers - must be set before any async operations
let isShuttingDown = false;
let gracefulShutdownFn: ((signal: string) => Promise<void>) | null = null;

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  
  // For critical errors, exit gracefully
  // But allow some non-critical errors to be logged without crashing
  const isCritical = error.name === 'ReferenceError' || 
                     error.name === 'TypeError' ||
                     error.message.includes('Cannot read') ||
                     error.message.includes('is not defined');
  
  if (isCritical && !isShuttingDown) {
    console.error('💥 Critical error detected, shutting down gracefully...');
    isShuttingDown = true;
    if (gracefulShutdownFn) {
      gracefulShutdownFn('uncaughtException').catch(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  
  // Log the error but don't crash for non-critical rejections
  // However, if it's a database or critical service error, we should handle it
  if (reason && typeof reason === 'object') {
    const errorMessage = reason.message || String(reason);
    if (errorMessage.includes('Mongo') || 
        errorMessage.includes('database') ||
        errorMessage.includes('connection')) {
      console.error('⚠️  Database-related unhandled rejection - this may indicate a connection issue');
    }
  }
});

// Database connection with retry logic
let initialRetryCount = 0;
let reconnectRetryCount = 0;
const MAX_INITIAL_RETRIES = 5;
const MAX_RECONNECT_RETRIES = 10; // More retries for reconnection
const RETRY_DELAY = 5000; // 5 seconds
let reconnectTimeout: NodeJS.Timeout | null = null;

const connectDatabase = async (isReconnect: boolean = false): Promise<void> => {
  try {
    // Close existing connection if reconnecting
    if (isReconnect && mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.close();
      } catch (closeErr) {
        // Ignore close errors during reconnection
      }
    }

    await mongoose.connect(config.MONGO_URI, {
  // Connection pool settings for better performance
  maxPoolSize: 10,
  minPoolSize: 2,
      serverSelectionTimeoutMS: 10000, // Increased for Render
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000, // Keep connection alive
      retryWrites: true,
      retryReads: true,
    });
    
  console.log('✅ Database connected');
    
    // Reset retry counts on success
    initialRetryCount = 0;
    reconnectRetryCount = 0;
    
    // Clear any pending reconnect timeout
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  
  // Initialize all main model schemas and verify database schema
  await initializeModels();
  
  // Initialize job posting hooks for email notifications
  JobPostingHooks.initialize();
  
  // Initialize scheduled jobs for periodic email notifications
  ScheduledJobsService.initialize();
  
    // Set up database event handlers (only once)
    if (!isReconnect) {
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        // Don't attempt reconnection here - let the disconnected handler do it
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        
        // Clear any existing reconnect timeout
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        
        if (reconnectRetryCount < MAX_RECONNECT_RETRIES) {
          reconnectRetryCount++;
          const delay = RETRY_DELAY * Math.min(reconnectRetryCount, 3); // Exponential backoff, max 3x
          console.log(`⏳ Reconnection attempt ${reconnectRetryCount}/${MAX_RECONNECT_RETRIES} in ${delay / 1000} seconds...`);
          
          reconnectTimeout = setTimeout(() => {
            connectDatabase(true).catch(err => {
              console.error('❌ Reconnection failed:', err.message);
            });
          }, delay);
        } else {
          console.error('❌ Max reconnection attempts reached. Server will continue but database operations may fail.');
          reconnectRetryCount = 0; // Reset for next disconnection cycle
        }
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        reconnectRetryCount = 0;
      });
      
      mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB connection established');
      });
    }
    
  } catch (err: any) {
    if (isReconnect) {
      reconnectRetryCount++;
      console.error(`❌ Database reconnection failed (attempt ${reconnectRetryCount}/${MAX_RECONNECT_RETRIES})`);
      console.error(`Error: ${err.message}`);
      
      if (reconnectRetryCount < MAX_RECONNECT_RETRIES) {
        const delay = RETRY_DELAY * Math.min(reconnectRetryCount, 3);
        console.log(`⏳ Retrying reconnection in ${delay / 1000} seconds...`);
        reconnectTimeout = setTimeout(() => {
          connectDatabase(true).catch(() => {
            // Will be handled by the catch block
          });
        }, delay);
      } else {
        console.error('❌ Max reconnection attempts reached. Server will continue but database operations may fail.');
        reconnectRetryCount = 0; // Reset for next disconnection cycle
      }
    } else {
      initialRetryCount++;
      console.error(`❌ Database connection failed (attempt ${initialRetryCount}/${MAX_INITIAL_RETRIES})`);
      console.error(`Error: ${err.message}`);
      
      if (initialRetryCount < MAX_INITIAL_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
        setTimeout(() => {
          connectDatabase(false).catch(() => {
            // Will be handled by the catch block
          });
        }, RETRY_DELAY);
      } else {
        console.error('\nTroubleshooting:');
        console.error('• Check MongoDB connection string');
        console.error('• Verify network connectivity');
        console.error('• Ensure MongoDB service is running\n');
        process.exit(1);
      }
    }
  }
};

// Memory monitoring
let memoryCheckInterval: NodeJS.Timeout | null = null;

const startMemoryMonitoring = () => {
  if (memoryCheckInterval) return; // Already monitoring
  
  memoryCheckInterval = setInterval(() => {
    const usage = process.memoryUsage();
    const mb = (bytes: number) => Math.round(bytes / 1024 / 1024 * 100) / 100;
    
    // Log memory usage every 5 minutes
    if (config.NODE_ENV === 'development') {
      console.log(`💾 Memory: RSS=${mb(usage.rss)}MB, Heap=${mb(usage.heapUsed)}/${mb(usage.heapTotal)}MB`);
    }
    
    // Warn if memory usage is high (over 500MB RSS or 80% heap)
    if (usage.rss > 500 * 1024 * 1024 || (usage.heapUsed / usage.heapTotal) > 0.8) {
      console.warn(`⚠️  High memory usage detected: RSS=${mb(usage.rss)}MB, Heap=${mb(usage.heapUsed)}/${mb(usage.heapTotal)}MB`);
      
      // Force garbage collection if available (requires --expose-gc flag)
      if (global.gc) {
        global.gc();
        console.log('🗑️  Garbage collection triggered');
      }
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
};

// Start database connection
let server: any = null;
let socketService: any = null;

connectDatabase().then(async () => {
  // Create HTTP server
  server = createServer(app);
  
  // Set keep-alive timeout for better connection handling
  server.keepAliveTimeout = 65000; // 65 seconds
  server.headersTimeout = 66000; // 66 seconds (must be > keepAliveTimeout)
  
  // Initialize Socket service
  socketService = initializeSocketService(server);
  
  // Start memory monitoring
  startMemoryMonitoring();
  
  server.listen(config.PORT, () => {
    const serverUrl = config.NODE_ENV === 'production' 
      ? 'https://emirimo-backend1.onrender.com'
      : `http://localhost:${config.PORT}`;
    console.log(`✅ Server running on ${serverUrl}\n`);
  });

  // Handle server errors
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${config.PORT} is already in use`);
      console.error('💡 Try killing existing processes or use a different port');
      console.error('🔧 Run: lsof -ti:' + config.PORT + ' | xargs kill -9');
    } else {
      console.error('❌ Server error:', err.message);
    }
    process.exit(1);
  });
  
  // Graceful shutdown handling
  gracefulShutdownFn = async (signal: string) => {
    if (isShuttingDown) {
      console.log('⚠️  Shutdown already in progress...');
      return;
    }
    
    isShuttingDown = true;
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    
    // Stop memory monitoring
    if (memoryCheckInterval) {
      clearInterval(memoryCheckInterval);
      memoryCheckInterval = null;
    }
    
    // Set a timeout to force exit if shutdown takes too long
    const shutdownTimeout = setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 30000); // 30 seconds
    
    try {
      // Close HTTP server
      if (server) {
        await new Promise<void>((resolve) => {
          server.close(() => {
            console.log('✅ HTTP server closed');
            resolve();
          });
          
          // Force close after 10 seconds
          setTimeout(() => {
            console.warn('⚠️  Forcing server close...');
            resolve();
          }, 10000);
        });
      }
      
      // Close Socket.IO connections
      if (socketService) {
        socketService.close();
        console.log('✅ Socket.IO closed');
      }
      
      // Clear any pending database reconnection timeouts
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      
      // Close database connection
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      console.log('✅ Database disconnected');
      }
      
      clearTimeout(shutdownTimeout);
      console.log('✅ Graceful shutdown complete');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  };
  
  process.on('SIGTERM', () => gracefulShutdownFn?.('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdownFn?.('SIGINT'));
  
}).catch(err => {
  console.error('\n❌ Failed to start server:', err);
  process.exit(1);
});
