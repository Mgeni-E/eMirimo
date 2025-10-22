import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import config, { validateEnv } from './config/env.js';
import { SocketService } from './services/socket.service.js';

// Display startup banner
console.log('\n eMirimo Backend API Server starting...\n');

// Validate environment configuration
validateEnv();

mongoose.connect(config.MONGO_URI).then(()=>{
  console.log('✅ Database connected');
  
  // Create HTTP server
  const server = createServer(app);
  
  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: config.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Initialize Socket service
  const socketService = new SocketService(io);
  
  // Make socket service globally available
  (global as any).io = io;
  (global as any).socketService = socketService;
  
  server.listen(config.PORT, ()=>{
    console.log(`✅ Server running on http://localhost:${config.PORT}`);
    console.log(`📊 Environment: ${config.NODE_ENV}`);
    console.log('🔌 Socket.io enabled for real-time features');
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
