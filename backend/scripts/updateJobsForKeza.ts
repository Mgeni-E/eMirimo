import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from '../src/config/env.js';
import { Job } from '../src/models/Job.js';

dotenv.config();

async function updateJobsForKeza() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Update Job 1: Marketing & Business Development Coordinator
    const job1 = await Job.findOne({ 
      title: 'Marketing & Business Development Coordinator',
      company_name: 'eMirimo Solutions'
    });

    if (job1) {
      job1.skills = ['Marketing', 'Business', 'Communication', 'Social media management', 'Collaboration', 'Time management'];
      job1.is_active = true;
      job1.status = 'active';
      await job1.save();
      console.log('✅ Updated Job 1: Marketing & Business Development Coordinator');
      console.log(`   Added skills array: ${job1.skills.join(', ')}`);
      console.log(`   Set is_active: ${job1.is_active}, status: ${job1.status}`);
    } else {
      console.log('⚠️  Job 1 not found');
    }

    // Update Job 2: Business Operations Assistant
    const job2 = await Job.findOne({ 
      title: 'Business Operations Assistant',
      company_name: 'eMirimo Solutions'
    });

    if (job2) {
      job2.skills = ['Acounting', 'Business', 'Time management', 'Collaboration', 'Communication'];
      job2.is_active = true;
      job2.status = 'active';
      await job2.save();
      console.log('✅ Updated Job 2: Business Operations Assistant');
      console.log(`   Added skills array: ${job2.skills.join(', ')}`);
      console.log(`   Set is_active: ${job2.is_active}, status: ${job2.status}`);
    } else {
      console.log('⚠️  Job 2 not found');
    }

    console.log('\n🎉 Successfully updated jobs for Keza!');
    console.log('\n📋 Updated Jobs:');
    console.log('   1. Marketing & Business Development Coordinator');
    console.log('      - Skills: Marketing, Business, Communication, Social media management, Collaboration, Time management');
    console.log('\n   2. Business Operations Assistant');
    console.log('      - Skills: Acounting, Business, Time management, Collaboration, Communication');
    console.log('\n✨ These jobs should now appear in Keza\'s recommended jobs!');

  } catch (error: any) {
    console.error('❌ Error updating jobs:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
updateJobsForKeza();

