import { io } from 'socket.io-client';

console.log('🔌 Testing Socket.io Real-time Features...');
console.log('-'.repeat(50));

const socket = io('http://localhost:3002', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2OGYxMGQzNzY2ZmM1MzNjZDI1MzJhNTEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjEwNDEwOTksImV4cCI6MTc2MTA0MTk5OX0.g2JX_FmZHhog_7vUm_BfWykFO1FL6mNs6RzHS9D_6P0'
  }
});

socket.on('connect', () => {
  console.log('✅ Socket.io connected successfully');
  console.log(`🔗 Connection ID: ${socket.id}`);
  
  // Test admin dashboard connection
  socket.emit('joinAdminDashboard');
  console.log('📊 Joined admin dashboard room');
  
  // Test real-time updates
  setTimeout(() => {
    socket.emit('adminUpdate', { type: 'test', message: 'Real-time test message' });
    console.log('📡 Sent test real-time message');
  }, 1000);
});

socket.on('adminUpdate', (data) => {
  console.log('📨 Received admin update:', data);
});

socket.on('connect_error', (error) => {
  console.log('❌ Socket connection failed:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});

// Test for 5 seconds then disconnect
setTimeout(() => {
  console.log('\n✅ Socket.io testing complete');
  socket.disconnect();
  process.exit(0);
}, 5000);
