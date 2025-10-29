import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../dist/models/User.js';
import { Job } from '../dist/models/Job.js';
import { Application } from '../dist/models/Application.js';
import { Notification } from '../dist/models/Notification.js';
import { LearningResource } from '../dist/models/LearningResource.js';

dotenv.config();

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/emirimo');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

async function verifyData() {
  try {
    console.log('🔍 Verifying data in MongoDB Atlas...\n');
    
    await connectToDatabase();
    
    // Count documents in each collection
    const userCount = await User.countDocuments();
    const jobCount = await Job.countDocuments();
    const applicationCount = await Application.countDocuments();
    const notificationCount = await Notification.countDocuments();
    const learningResourceCount = await LearningResource.countDocuments();
    
    console.log('📊 Database Statistics:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`💼 Jobs: ${jobCount}`);
    console.log(`📝 Applications: ${applicationCount}`);
    console.log(`🔔 Notifications: ${notificationCount}`);
    console.log(`📚 Learning Resources: ${learningResourceCount}`);
    
    // Show user details
    console.log('\n👥 Users in Database:');
    const users = await User.find({}, 'name email role status').lean();
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.role}) - ${user.email} - ${user.status}`);
    });
    
    // Show job details
    console.log('\n💼 Jobs in Database:');
    const jobs = await Job.find({}, 'title employer_id is_active').populate('employer_id', 'name').lean();
    jobs.forEach(job => {
      console.log(`  - ${job.title} by ${job.employer_id?.name} (${job.is_active ? 'Active' : 'Inactive'})`);
    });
    
    // Show application details
    console.log('\n📝 Applications in Database:');
    const applications = await Application.find({}, 'seeker_id job_id status').populate('seeker_id', 'name').populate('job_id', 'title').lean();
    applications.forEach(app => {
      console.log(`  - ${app.seeker_id?.name} applied to ${app.job_id?.title} (${app.status})`);
    });
    
    // Show learning resources
    console.log('\n📚 Learning Resources in Database:');
    const resources = await LearningResource.find({}, 'title category skills').lean();
    resources.forEach(resource => {
      console.log(`  - ${resource.title} (${resource.category}) - Skills: ${resource.skills.join(', ')}`);
    });
    
    // Show notifications summary
    console.log('\n🔔 Notifications Summary:');
    const notificationTypes = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    notificationTypes.forEach(type => {
      console.log(`  - ${type._id}: ${type.count} notifications`);
    });
    
    console.log('\n✅ Data verification complete! All collections are populated.');
    console.log('\n🎯 Ready for testing with the following accounts:');
    console.log('Admin: admin@emirimo.com / admin@123');
    console.log('Job Seekers: jean.baptiste@example.com, marie.claire@example.com, paul.nkurunziza@example.com / password123');
    console.log('Employers: jobs@innovationhub.rw, hr@eafintech.com, careers@kigalidigital.rw / password123');
    
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Verification error:', error);
    process.exit(1);
  }
}

// Run the verification
verifyData();

export { verifyData };
