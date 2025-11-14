import mongoose from 'mongoose';
import config from './env.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      // Connection pool settings for better performance
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take before timeout
      connectTimeoutMS: 10000, // How long to wait for initial connection
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
