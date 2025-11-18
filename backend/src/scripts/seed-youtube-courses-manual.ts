/**
 * Manual seeding script using direct YouTube video/playlist IDs
 * This bypasses the search API (which costs 100 units) and uses direct fetching (1 unit each)
 * Much more quota-efficient!
 * 
 * Usage: Add YouTube video/playlist IDs to the COURSE_IDS object below, then run:
 * npx tsx src/scripts/seed-youtube-courses-manual.ts
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

// Manual YouTube video/playlist IDs organized by category
// You can find these IDs from YouTube URLs:
// Video: https://www.youtube.com/watch?v=VIDEO_ID
// Playlist: https://www.youtube.com/playlist?list=PLAYLIST_ID
const COURSE_IDS = {
  'digital-literacy-productivity': [
    // Add video IDs here (11 characters each) or playlist IDs (starts with PL)
    // Example: 'dQw4w9WgXcQ', 'PLrAXtmRdnEQy6nuLMH7Fy8T1lE3q1VZ5x'
  ],
  'soft-skills-professional': [
    // Add video IDs here
  ],
  'entrepreneurship-business': [
    // Add video IDs here
  ],
  'job-search-career': [
    // Add video IDs here
  ],
  'technology-digital-careers': [
    // Add video IDs here
  ],
  'personal-development-workplace': [
    // Add video IDs here
  ]
};

// Maximum video duration in seconds (50 minutes)
const MAX_DURATION_SECONDS = 50 * 60; // 3000 seconds

async function seedCoursesManually() {
  try {
    // Connect to database
    const mongoUri = config.MONGODB_URI || config.MONGO_URI;
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

    // Process each category
    for (const [category, ids] of Object.entries(COURSE_IDS)) {
      if (ids.length === 0) {
        console.log(`\n⏭️  Skipping ${category} - no IDs provided`);
        continue;
      }

      console.log(`\n📚 Processing category: ${category} (${ids.length} IDs)`);
      
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const isPlaylist = id.startsWith('PL') || id.length > 11;
        
        console.log(`  [${i + 1}/${ids.length}] Fetching ${isPlaylist ? 'playlist' : 'video'}: ${id}`);
        
        try {
          let resource: any;
          let videoId: string;
          let playlistId: string | undefined;

          if (isPlaylist) {
            // Fetch playlist
            const playlist = await youtubeService.getPlaylistById(id);
            if (!playlist) {
              console.log(`    ⚠️  Playlist not found: ${id}`);
              totalFailed++;
              continue;
            }

            resource = youtubeService.convertPlaylistToLearningResource(
              playlist,
              [category],
              category,
              'beginner'
            );
            playlistId = id;
            videoId = id; // Use playlist ID as identifier
          } else {
            // Fetch video
            const video = await youtubeService.getVideoById(id);
            if (!video) {
              console.log(`    ⚠️  Video not found: ${id}`);
              totalFailed++;
              continue;
            }

            // Check duration (only for videos, not playlists)
            if (video.durationSeconds && video.durationSeconds > MAX_DURATION_SECONDS) {
              console.log(`    ⏭️  Skipping: Video too long (${Math.round(video.durationSeconds / 60)} min)`);
              totalFailed++;
              continue;
            }

            resource = youtubeService.convertToLearningResource(
              video,
              [category],
              category,
              'beginner'
            );
            videoId = id;
          }
          
          // Mark as YouTube resource
          resource.source = 'YouTube';
          resource.isYouTube = true;
          resource.video_id = videoId;
          if (playlistId) {
            resource.playlist_id = playlistId;
            resource.video_url = `https://www.youtube.com/playlist?list=${playlistId}`;
          } else {
            resource.video_url = `https://www.youtube.com/watch?v=${videoId}`;
          }
          resource.is_active = true;
          resource.status = 'published';
          resource.created_by = new Types.ObjectId(); // System user
          
          // Use ID as _id for YouTube resources
          const resourceData = {
            ...resource,
            _id: id
          };
          
          // Save to database
          await LearningResource.findOneAndUpdate(
            { _id: id },
            resourceData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          
          totalSaved++;
          console.log(`    ✅ Saved: ${resource.title.substring(0, 60)}...`);
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error: any) {
          if (error?.response?.data?.error?.code === 403) {
            console.log(`    ❌ Quota exceeded for: ${id}`);
            console.log(`    ⚠️  YouTube API quota limit reached.`);
            break;
          } else {
            console.log(`    ❌ Error for ${id}: ${error.message}`);
            totalFailed++;
          }
        }
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Total saved: ${totalSaved} courses`);
    console.log(`   Total failed: ${totalFailed} IDs`);
    console.log(`\n💡 Quota Usage: This approach uses only ${totalSaved + totalFailed} units (1 per video/playlist)`);
    console.log(`   vs ${(totalSaved + totalFailed) * 100} units if using search API!`);

  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the script
seedCoursesManually();

