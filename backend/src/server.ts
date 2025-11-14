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

mongoose.connect(config.MONGO_URI, {
  // Connection pool settings for better performance
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
}).then(async ()=>{
  console.log('✅ Database connected');
  
  // Initialize all main model schemas and verify database schema
  await initializeModels();
  
  // Initialize job posting hooks for email notifications
  JobPostingHooks.initialize();
  
  // Initialize scheduled jobs for periodic email notifications
  ScheduledJobsService.initialize();
  
  // Create HTTP server
  const server = createServer(app);
  
  // Initialize Socket service
  const socketService = initializeSocketService(server);
  
  server.listen(config.PORT, ()=>{
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
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down...');
    mongoose.connection.close().then(() => {
      console.log('✅ Database disconnected');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    mongoose.connection.close().then(() => {
      console.log('✅ Database disconnected');
      process.exit(0);
    });
  });
  
}).catch(err=>{
  console.error('\n❌ Database connection failed');
  console.error(`Error: ${err.message}`);
  console.error('\nTroubleshooting:');
  console.error('• Check MongoDB connection string');
  console.error('• Verify network connectivity');
  console.error('• Ensure MongoDB service is running\n');
  process.exit(1);
});
