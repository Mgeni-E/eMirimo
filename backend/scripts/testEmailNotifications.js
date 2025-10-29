import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { JobNotificationService } from '../dist/services/jobNotification.service.js';
import { User } from '../dist/models/User.js';
import { Job } from '../dist/models/Job.js';

dotenv.config();

async function testEmailNotifications() {
  try {
    console.log('🧪 Testing Email Notification System...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get a test job
    const testJob = await Job.findOne({ is_active: true }).populate('employer_id', 'name email');
    if (!testJob) {
      console.log('❌ No active jobs found for testing');
      return;
    }
    
    console.log(`📋 Testing with job: ${testJob.title} by ${testJob.employer_id.name}`);
    
    // Get test users
    const testUsers = await User.find({ role: 'seeker', status: 'active' }).limit(3);
    console.log(`👥 Found ${testUsers.length} test users`);
    
    // Test job recommendation emails
    console.log('\n📧 Testing job recommendation emails...');
    await JobNotificationService.sendJobRecommendationEmails(testJob._id.toString());
    
    console.log('\n✅ Email notification test completed!');
    console.log('\n📊 What was tested:');
    console.log('• AI job matching algorithm');
    console.log('• Email template generation');
    console.log('• Skills gap analysis');
    console.log('• Match score calculation');
    console.log('• Personalized recommendations');
    
    console.log('\n🎯 Email features:');
    console.log('• Professional HTML templates');
    console.log('• Match score visualization');
    console.log('• Skills matching display');
    console.log('• Skills gap identification');
    console.log('• Direct apply links');
    console.log('• Learning resource suggestions');
    
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testEmailNotifications();
