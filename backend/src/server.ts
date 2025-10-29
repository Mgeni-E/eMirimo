import mongoose from 'mongoose';
import { createServer } from 'http';
import app from './app.js';
import config, { validateEnv } from './config/env.js';
import { initializeSocketService } from './services/socket.service.js';
import { JobPostingHooks } from './hooks/jobPosting.hooks.js';
import { ScheduledJobsService } from './services/scheduledJobs.service.js';

// Display startup banner
console.log('\n eMirimo Backend API Server starting...\n');

// Validate environment configuration
validateEnv();

mongoose.connect(config.MONGO_URI).then(()=>{
  console.log('✅ Database connected');
  
  // Initialize job posting hooks for email notifications
  JobPostingHooks.initialize();
  
  // Initialize scheduled jobs for periodic email notifications
  ScheduledJobsService.initialize();
  
  // Create HTTP server
  const server = createServer(app);
  
  // Initialize Socket service
  const socketService = initializeSocketService(server);
  
  server.listen(config.PORT, ()=>{
    console.log(`✅ Server running on http://localhost:${config.PORT}`);
    console.log(`📊 Environment: ${config.NODE_ENV}`);
    console.log('🔌 Socket.io enabled for real-time features');
    console.log('📧 Email notification system enabled');
    console.log('📝 Ready to handle requests\n');
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
