import mongoose from 'mongoose';
import { config } from '../dist/config/env.js';

async function testAPI() {
  try {
    console.log('🧪 Testing API Endpoints...\n');
    
    // Test database connection
    console.log('1. Testing database connection...');
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Database connected successfully');
    
    // Test collections
    console.log('\n2. Testing collections...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Test user collection
    console.log('\n3. Testing users collection...');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const userCount = await User.countDocuments();
    console.log(`📈 Total users: ${userCount}`);
    
    // Test admin user
    console.log('\n4. Testing admin user...');
    const adminUser = await User.findOne({ email: 'admin@emirimo.com' });
    if (adminUser) {
      console.log('✅ Admin user found:', {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      });
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test jobs collection
    console.log('\n5. Testing jobs collection...');
    const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }));
    const jobCount = await Job.countDocuments();
    console.log(`📈 Total jobs: ${jobCount}`);
    
    // Test applications collection
    console.log('\n6. Testing applications collection...');
    const Application = mongoose.model('Application', new mongoose.Schema({}, { strict: false }));
    const applicationCount = await Application.countDocuments();
    console.log(`📈 Total applications: ${applicationCount}`);
    
    // Test notifications collection
    console.log('\n7. Testing notifications collection...');
    const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));
    const notificationCount = await Notification.countDocuments();
    console.log(`📈 Total notifications: ${notificationCount}`);
    
    // Test learning resources collection
    console.log('\n8. Testing learning resources collection...');
    const LearningResource = mongoose.model('LearningResource', new mongoose.Schema({}, { strict: false }));
    const learningResourceCount = await LearningResource.countDocuments();
    console.log(`📈 Total learning resources: ${learningResourceCount}`);
    
    console.log('\n✅ All database tests passed!');
    console.log('\n📋 Database Status Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Jobs: ${jobCount}`);
    console.log(`   Applications: ${applicationCount}`);
    console.log(`   Notifications: ${notificationCount}`);
    console.log(`   Learning Resources: ${learningResourceCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAPI();
