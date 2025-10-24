import axios from 'axios';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
  viewCount: string;
  publishedAt: string;
}

interface YouTubeSearchResult {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: { url: string };
        high: { url: string };
      };
      channelTitle: string;
      publishedAt: string;
    };
  }>;
}

export class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
  }

  /**
   * Search for educational videos based on skills and difficulty
   */
  async searchEducationalVideos(skills: string[], difficulty: string = 'beginner'): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      console.warn('YouTube API key not configured');
      return [];
    }

    try {
      const query = this.buildSearchQuery(skills, difficulty);
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          videoDuration: 'medium', // 4-20 minutes
          maxResults: 10,
          order: 'relevance',
          key: this.apiKey
        }
      });

      const searchResults: YouTubeSearchResult = response.data;
      
      // Get additional video details
      const videoIds = searchResults.items.map(item => item.id.videoId).join(',');
      const videoDetails = await this.getVideoDetails(videoIds);

      return searchResults.items.map((item, index) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
        duration: videoDetails[index]?.duration || '0:00',
        channelTitle: item.snippet.channelTitle,
        viewCount: videoDetails[index]?.viewCount || '0',
        publishedAt: item.snippet.publishedAt
      }));
    } catch (error) {
      console.error('YouTube API error:', error);
      return [];
    }
  }

  /**
   * Get video details including duration and view count
   */
  private async getVideoDetails(videoIds: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: 'contentDetails,statistics',
          id: videoIds,
          key: this.apiKey
        }
      });

      return response.data.items.map((item: any) => ({
        duration: this.formatDuration(item.contentDetails.duration),
        viewCount: item.statistics.viewCount
      }));
    } catch (error) {
      console.error('Error fetching video details:', error);
      return [];
    }
  }

  /**
   * Build search query for educational content
   */
  private buildSearchQuery(skills: string[], difficulty: string): string {
    const skillTerms = skills.join(' ');
    const difficultyTerms = this.getDifficultyTerms(difficulty);
    
    return `${skillTerms} ${difficultyTerms} tutorial learn course`.trim();
  }

  /**
   * Get difficulty-specific search terms
   */
  private getDifficultyTerms(difficulty: string): string {
    switch (difficulty) {
      case 'beginner':
        return 'beginner basics introduction';
      case 'intermediate':
        return 'intermediate advanced tutorial';
      case 'advanced':
        return 'advanced expert professional';
      default:
        return 'tutorial learn';
    }
  }

  /**
   * Format YouTube duration (PT4M13S) to readable format (4:13)
   */
  private formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Convert YouTube video to LearningResource format
   */
  convertToLearningResource(video: YouTubeVideo, skills: string[], category: string): any {
    return {
      title: video.title,
      description: video.description,
      type: 'video',
      category: category,
      skills: skills,
      difficulty: 'beginner', // Default, can be enhanced with AI analysis
      duration: this.parseDuration(video.duration),
      language: 'en',
      video_url: `https://www.youtube.com/watch?v=${video.videoId}`,
      video_id: video.videoId,
      thumbnail_url: video.thumbnail,
      author: video.channelTitle,
      source: 'YouTube',
      tags: skills,
      views: parseInt(video.viewCount) || 0,
      likes: 0,
      bookmarks: 0,
      is_active: true,
      is_featured: false,
      created_at: new Date(video.publishedAt),
      updated_at: new Date()
    };
  }

  /**
   * Parse duration string to minutes
   */
  private parseDuration(duration: string): number {
    const parts = duration.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return 0;
  }
}
