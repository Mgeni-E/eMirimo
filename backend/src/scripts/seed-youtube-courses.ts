/**
 * Efficient script to fetch and store 100 upskilling courses in the database
 * Uses minimal quota by doing fewer searches (50 results each) and direct video fetching
 * Filters videos to be below 50 minutes for optimal engagement
 * 
 * Run with: npx tsx src/scripts/seed-youtube-courses.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { LearningResource } from '../models/LearningResource.js';
import { YouTubeService } from '../services/youtube.service.js';
import config from '../config/env.js';
import { Types } from 'mongoose';

// Broad search terms per category - fewer searches, more results per search
const CATEGORY_SEARCH_TERMS = {
  'digital-literacy-productivity': [
    'digital literacy tutorial',
    'Microsoft Office basics',
    'computer skills for beginners'
  ],
  'soft-skills-professional': [
    'communication skills training',
    'soft skills course',
    'professional development'
  ],
  'entrepreneurship-business': [
    'entrepreneurship for beginners',
    'business skills tutorial',
    'start a business guide'
  ],
  'job-search-career': [
    'resume writing tutorial',
    'job interview skills',
    'career development course'
  ],
  'technology-digital-careers': [
    'programming for beginners',
    'web development tutorial',
    'coding basics course',
    'data analysis tutorial'
  ],
  'personal-development-workplace': [
    'personal development course',
    'productivity skills',
    'workplace skills training'
  ]
};

// Target number of courses per category
const TARGET_COURSES_PER_CATEGORY = {
  'digital-literacy-productivity': 15,
  'soft-skills-professional': 20,
  'entrepreneurship-business': 15,
  'job-search-career': 15,
  'technology-digital-careers': 20,
  'personal-development-workplace': 15
};

// Maximum video duration in seconds (50 minutes)
const MAX_DURATION_SECONDS = 50 * 60; // 3000 seconds

async function seedCourses() {
  try {
    // Connect to database
    const mongoUri = config.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Initialize YouTube service
    const youtubeService = new YouTubeService();

    // Delete existing YouTube courses to avoid duplicates
    console.log('🗑️  Cleaning existing YouTube courses...');
    await LearningResource.deleteMany({ 
      source: 'YouTube',
      isYouTube: true 
    });
    console.log('✅ Cleaned existing YouTube courses\n');

    let totalSaved = 0;
    let totalFailed = 0;
    const savedVideoIds = new Set<string>(); // Track saved videos to avoid duplicates

    // Fetch and save courses for each category
    for (const [category, searchTerms] of Object.entries(CATEGORY_SEARCH_TERMS)) {
      const targetCount = TARGET_COURSES_PER_CATEGORY[category as keyof typeof TARGET_COURSES_PER_CATEGORY];
      console.log(`\n📚 Processing category: ${category} (target: ${targetCount} courses)`);
      
      let categorySaved = 0;
      let allCategoryVideos: any[] = [];

      // Step 1: Do fewer searches but fetch more results per search (up to 50)
      for (const searchQuery of searchTerms) {
        if (categorySaved >= targetCount) break;
        
        console.log(`  🔍 Searching: "${searchQuery}" (fetching up to 50 results)`);
        
        try {
          // Fetch up to 50 videos per search (max allowed by YouTube API)
          const videos = await youtubeService.searchEducationalVideos([searchQuery], 'beginner', 50);
          
          // Filter videos: below 50 minutes and not already saved
          const validVideos = videos.filter(video => {
            const durationSeconds = video.durationSeconds || 0;
            return durationSeconds > 0 && 
                   durationSeconds <= MAX_DURATION_SECONDS && 
                   !savedVideoIds.has(video.videoId);
          });

          allCategoryVideos.push(...validVideos);
          console.log(`    ✅ Found ${validVideos.length} valid videos from this search`);
          
          // Small delay to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error: any) {
          if (error?.response?.data?.error?.code === 403) {
            console.log(`    ❌ Quota exceeded for: ${searchQuery}`);
            console.log(`    ⚠️  YouTube API quota limit reached.`);
            break;
          } else {
            console.log(`    ⚠️  Error for "${searchQuery}": ${error.message}`);
            totalFailed++;
          }
        }
      }

      // Step 2: Remove duplicates and sort by relevance (view count as proxy)
      const uniqueVideos = Array.from(
        new Map(allCategoryVideos.map(v => [v.videoId, v])).values()
      ).sort((a, b) => {
        const viewsA = parseInt(a.viewCount || '0');
        const viewsB = parseInt(b.viewCount || '0');
        return viewsB - viewsA; // Sort by view count (popularity)
      });

      console.log(`  📊 Total unique valid videos found: ${uniqueVideos.length}`);

      // Step 3: Save videos up to target count
      for (const video of uniqueVideos) {
        if (categorySaved >= targetCount) break;
        
        try {
          const resource = youtubeService.convertToLearningResource(
            video,
            [category],
            category,
            'beginner'
          );
          
          // Mark as YouTube resource
          resource.source = 'YouTube';
          resource.isYouTube = true;
          resource.is_active = true;
          resource.status = 'published';
          resource.created_by = new Types.ObjectId(); // System user
          
          // Set video_id and video_url at root level and in content object
          resource.video_id = video.videoId;
          resource.video_url = `https://www.youtube.com/watch?v=${video.videoId}`;
          
          if (!resource.content) {
            resource.content = {};
          }
          resource.content.video_id = video.videoId;
          resource.content.video_url = `https://www.youtube.com/watch?v=${video.videoId}`;
          resource.content.video_duration = video.durationSeconds || 0;
          
          // Generate unique slug from title + video ID to avoid duplicate key errors
          const slugBase = (resource.title || 'video')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .substring(0, 40);
          resource.slug = `${slugBase}-${video.videoId}`;
          
          // Save to database - find by video_id instead of _id
          await LearningResource.findOneAndUpdate(
            { video_id: video.videoId },
            resource,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          
          savedVideoIds.add(video.videoId);
          categorySaved++;
          totalSaved++;
          console.log(`    ✅ [${categorySaved}/${targetCount}] Saved: ${resource.title.substring(0, 60)}...`);
        } catch (saveError: any) {
          console.log(`    ⚠️  Error saving video: ${saveError.message}`);
          totalFailed++;
        }
      }

      console.log(`  ✅ Category complete: ${categorySaved}/${targetCount} courses saved`);
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Total saved: ${totalSaved} courses`);
    console.log(`   Total failed: ${totalFailed} searches`);
    console.log(`\n💡 Quota Usage: This approach uses ~${Object.values(CATEGORY_SEARCH_TERMS).flat().length} searches (${Object.values(CATEGORY_SEARCH_TERMS).flat().length * 100} units) instead of 100+ searches.`);
    console.log(`💡 Tip: If quota was exceeded, wait 24 hours and run this script again.`);

  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the script
seedCourses();
