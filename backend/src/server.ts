import mongoose from 'mongoose';
import app from './app.js';
import config, { validateEnv } from './config/env.js';

// Display startup banner
console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                                                              ║');
console.log('║  🚀 eMirimo Backend API Server                              ║');
console.log('║  📅 Starting up...                                           ║');
console.log('║                                                              ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// Validate environment configuration
validateEnv();

mongoose.connect(config.MONGO_URI).then(()=>{
  console.log('✅ Database connection established');
  console.log('🔗 MongoDB Atlas connected successfully\n');
  
  app.listen(config.PORT, ()=>{
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    eMirimo API Server                       ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  🚀 Server Status:    ONLINE                                ║`);
    console.log(`║  🌐 Endpoint:         http://localhost:${config.PORT}                    ║`);
    console.log(`║  📊 Environment:      ${config.NODE_ENV.toUpperCase().padEnd(20)} ║`);
    console.log(`║  🔐 Authentication:   JWT Enabled                           ║`);
    console.log(`║  🛡️  Security:        CORS + Helmet + Rate Limiting        ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('\n🎯 API endpoints available:');
    console.log('   • POST /api/auth/register     - User registration');
    console.log('   • POST /api/auth/login        - User authentication');
    console.log('   • GET  /api/health            - Health check');
    console.log('\n📝 Ready to handle requests...\n');
  });
  
  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close().then(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received. Shutting down gracefully...');
    mongoose.connection.close().then(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
  
}).catch(err=>{
  console.error('\n❌ Database Connection Failed');
  console.error('┌─────────────────────────────────────────────────────────────┐');
  console.error('│ Error Details:                                              │');
  console.error(`│ ${err.message.padEnd(60)} │`);
  console.error('└─────────────────────────────────────────────────────────────┘');
  console.error('\n🔧 Troubleshooting:');
  console.error('   • Check MongoDB connection string');
  console.error('   • Verify network connectivity');
  console.error('   • Ensure MongoDB service is running\n');
  process.exit(1);
});
