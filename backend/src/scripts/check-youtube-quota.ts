/**
 * Quick script to check YouTube API quota status
 * Run with: npx tsx src/scripts/check-youtube-quota.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.YOUTUBE_API_KEY;

if (!apiKey) {
  console.error('❌ YOUTUBE_API_KEY not found in environment variables');
  process.exit(1);
}

async function checkQuota() {
  try {
    console.log('🔍 Testing YouTube API quota...\n');
    
    // Try a simple search request
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: 'test',
        type: 'video',
        maxResults: 1,
        key: apiKey
      },
      timeout: 10000
    });

    console.log('✅ YouTube API quota is AVAILABLE!');
    console.log('   You can now run: npx tsx src/scripts/seed-youtube-courses.ts\n');
    return true;
    
  } catch (error: any) {
    if (error?.response?.data?.error?.code === 403) {
      const message = error.response.data.error.message;
      if (message.includes('quota') || message.includes('exceeded')) {
        console.log('❌ YouTube API quota is EXCEEDED');
        console.log('   Please wait 24 hours for quota reset');
        console.log('   Or use manual seeding: npx tsx src/scripts/seed-youtube-courses-manual.ts\n');
        return false;
      }
    }
    
    console.error('❌ Error checking quota:', error.message);
    return false;
  }
}

checkQuota();

