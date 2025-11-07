import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from '../src/config/env.js';
import { Job } from '../src/models/Job.js';

dotenv.config();

async function fixJobsForKeza() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Update both jobs using updateOne to ensure is_active is set
    const result1 = await Job.updateOne(
      { 
        title: 'Marketing & Business Development Coordinator',
        company_name: 'eMirimo Solutions'
      },
      {
        $set: {
          is_active: true,
          status: 'active'
        }
      }
    );

    const result2 = await Job.updateOne(
      { 
        title: 'Business Operations Assistant',
        company_name: 'eMirimo Solutions'
      },
      {
        $set: {
          is_active: true,
          status: 'active'
        }
      }
    );

    console.log(`✅ Updated Job 1: ${result1.modifiedCount} document(s) modified`);
    console.log(`✅ Updated Job 2: ${result2.modifiedCount} document(s) modified`);

    // Verify the jobs
    const job1 = await Job.findOne({ 
      title: 'Marketing & Business Development Coordinator',
      company_name: 'eMirimo Solutions'
    }).lean();

    const job2 = await Job.findOne({ 
      title: 'Business Operations Assistant',
      company_name: 'eMirimo Solutions'
    }).lean();

    console.log('\n📋 Job Status:');
    console.log(`   Job 1 - is_active: ${job1?.is_active}, status: ${job1?.status}`);
    console.log(`   Job 2 - is_active: ${job2?.is_active}, status: ${job2?.status}`);
    
    console.log('\n📋 Required Skills:');
    if (job1?.required_skills) {
      console.log(`   Job 1: ${job1.required_skills.map((s: any) => s.name).join(', ')}`);
    }
    if (job2?.required_skills) {
      console.log(`   Job 2: ${job2.required_skills.map((s: any) => s.name).join(', ')}`);
    }

    console.log('\n✨ Jobs should now appear in recommendations!');

  } catch (error: any) {
    console.error('❌ Error fixing jobs:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
fixJobsForKeza();

