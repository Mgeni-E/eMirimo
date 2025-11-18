/**
 * Script to clean up mock/test learning resources from the database
 * Run with: npx tsx src/scripts/cleanup-mock-learning-resources.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Import after dotenv loads
import { config } from '../config/env.js';
import { LearningResource } from '../models/LearningResource.js';

// Verify MongoDB URI is loaded
const mongoUri = config.MONGODB_URI || config.MONGO_URI;
if (!mongoUri) {
  console.error('❌ MongoDB URI not found in environment variables');
  console.error(`   Checked .env file at: ${envPath}`);
  console.error(`   Looking for: MONGO_URI or MONGODB_URI`);
  process.exit(1);
}

// Mock/test keywords to identify mock data
const MOCK_KEYWORDS = [
  'professional communication skills',
  'mock',
  'test',
  'sample',
  'dummy',
  'example course',
  'demo',
  'tutorial example',
  'sample course'
];

async function cleanupMockResources() {
  try {
    // Connect to MongoDB
    const mongoUri = config.MONGODB_URI || config.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all learning resources
    const allResources = await LearningResource.find({});
    console.log(`📊 Found ${allResources.length} total learning resources`);

    // Identify mock resources
    const mockResources = allResources.filter(resource => {
      const title = resource.title?.toLowerCase() || '';
      const description = resource.description?.toLowerCase() || '';
      const source = resource.source?.toLowerCase() || '';
      
      // Check if it's a YouTube resource (these are real)
      if (source === 'youtube' || resource.video_id || resource.video_url) {
        return false; // Keep YouTube resources
      }

      // Check if it matches mock keywords
      const isMock = MOCK_KEYWORDS.some(keyword => 
        title.includes(keyword) || description.includes(keyword)
      );

      // Also check if it's a minimal YouTube tracking resource (created when marking YouTube videos as complete)
      const isMinimalTracking = title.includes('YouTube Resource') && 
                                description === 'YouTube learning resource';

      return isMock || isMinimalTracking;
    });

    console.log(`🔍 Found ${mockResources.length} mock/test resources to delete:`);
    mockResources.forEach(resource => {
      console.log(`  - ${resource.title} (ID: ${resource._id})`);
    });

    if (mockResources.length === 0) {
      console.log('✅ No mock resources found. Database is clean!');
      await mongoose.disconnect();
      return;
    }

    // Delete ALL non-YouTube resources (more aggressive cleanup)
    // Only keep resources that are actually from YouTube
    const deleteResult = await LearningResource.deleteMany({
      $nor: [
        { source: 'YouTube' },
        { source: { $regex: /youtube/i } },
        { video_id: { $exists: true, $ne: null } },
        { video_url: { $exists: true, $ne: null, $regex: /youtube/i } }
      ]
    });

    console.log(`✅ Deleted ${deleteResult.deletedCount} mock resources`);

    // Show remaining resources
    const remainingResources = await LearningResource.find({});
    console.log(`📊 Remaining resources: ${remainingResources.length}`);
    
    // Show breakdown by source
    const youtubeCount = remainingResources.filter(r => r.source === 'YouTube' || r.video_id).length;
    const inAppCount = remainingResources.length - youtubeCount;
    console.log(`  - YouTube resources: ${youtubeCount}`);
    console.log(`  - In-app resources: ${inAppCount}`);

    await mongoose.disconnect();
    console.log('✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Error cleaning up mock resources:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the cleanup
cleanupMockResources();

