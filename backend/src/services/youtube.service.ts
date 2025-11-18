import axios from 'axios';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  durationSeconds?: number; // Duration in seconds for filtering
  channelTitle: string;
  viewCount: string;
  publishedAt: string;
  playlistId?: string;
}

interface YouTubePlaylist {
  playlistId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  videoCount: number;
  publishedAt: string;
  videos?: YouTubeVideo[];
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
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 3600000; // 1 hour in milliseconds

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  YouTube API key not configured. YouTube features will be limited.');
      console.warn('   To enable YouTube learning resources, set YOUTUBE_API_KEY in your .env file');
      console.warn('   Get your API key from: https://console.cloud.google.com/apis/credentials');
    }
  }

  /**
   * Get cached data or fetch new
   */
  private async getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Search for educational videos based on skills and difficulty
   */
  async searchEducationalVideos(skills: string[], difficulty: string = 'beginner', maxResults: number = 20): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      console.warn('YouTube API key not configured');
      return [];
    }

    const cacheKey = `videos:${skills.join(',')}:${difficulty}:${maxResults}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
    try {
      const query = this.buildSearchQuery(skills, difficulty);
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          // No videoDuration filter - allow any duration
          maxResults: Math.min(maxResults * 3, 50), // Fetch more to account for filtering
          order: 'relevance',
          key: this.apiKey,
          safeSearch: 'strict'
        },
        timeout: 10000 // 10 second timeout
      });

      const searchResults: YouTubeSearchResult = response.data;
      
        if (!searchResults.items || searchResults.items.length === 0) {
          return [];
        }
      
      // Get additional video details with raw ISO 8601 duration
      const videoIds = searchResults.items.map(item => item.id.videoId).join(',');
      const videoDetailsResponse = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: 'contentDetails,statistics',
          id: videoIds,
          key: this.apiKey
        },
        timeout: 10000 // 10 second timeout
      });

      const videoDetails = videoDetailsResponse.data.items || [];
      
      // Create a map for faster lookup
      const detailsMap = new Map();
      videoDetails.forEach((detail: any) => {
        if (detail.id) {
          detailsMap.set(detail.id, detail);
        }
      });

      // Filter videos to 10-25 minutes (600-1500 seconds) for Rwanda youth career skills
      const mappedVideos = searchResults.items
        .map((item) => {
          const detail = detailsMap.get(item.id.videoId);
          if (!detail) return null;
          
          const rawDuration = detail?.contentDetails?.duration || 'PT0S';
          const durationSeconds = this.parseDurationToSeconds(rawDuration);
          const formattedDuration = this.formatDuration(rawDuration);
          
          return {
        videoId: item.id.videoId,
        title: item.snippet.title,
            description: item.snippet.description.substring(0, 500),
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
            duration: formattedDuration,
            durationSeconds: durationSeconds,
            channelTitle: item.snippet.channelTitle,
            viewCount: detail?.statistics?.viewCount || '0',
            publishedAt: item.snippet.publishedAt
          } as YouTubeVideo;
        })
        .filter((video): video is YouTubeVideo => video !== null);
      
      // No duration filter - use all videos regardless of duration
      // Return all mapped videos up to maxResults
      return mappedVideos.slice(0, maxResults);
      } catch (error: any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        return [];
      }
    });
  }

  /**
   * Search for educational playlists (courses)
   */
  async searchEducationalPlaylists(skills: string[], difficulty: string = 'beginner', maxResults: number = 10): Promise<YouTubePlaylist[]> {
    if (!this.apiKey) {
      console.warn('YouTube API key not configured');
      return [];
    }

    const cacheKey = `playlists:${skills.join(',')}:${difficulty}:${maxResults}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        const query = this.buildSearchQuery(skills, difficulty) + ' playlist course';
        const response = await axios.get(`${this.baseUrl}/search`, {
          params: {
            part: 'snippet',
            q: query,
            type: 'playlist',
            maxResults: Math.min(maxResults, 50),
            order: 'relevance',
            key: this.apiKey,
            safeSearch: 'strict'
          },
          timeout: 10000 // 10 second timeout
        });

        if (!response.data.items || response.data.items.length === 0) {
          return [];
        }

        // Get playlist details
        const playlistIds = response.data.items.map((item: any) => item.id.playlistId).join(',');
        let playlistDetails: any[] = [];
        try {
          playlistDetails = await this.getPlaylistDetails(playlistIds);
        } catch (detailsError: any) {
          console.error('Error fetching playlist details:', detailsError.message);
          // Continue with empty details
        }

        // Create a map for faster lookup
        const detailsMap = new Map();
        playlistDetails.forEach((detail: any) => {
          if (detail.playlistId) {
            detailsMap.set(detail.playlistId, detail);
          }
        });

        return response.data.items.map((item: any) => {
          const detail = detailsMap.get(item.id.playlistId);
          return {
            playlistId: item.id.playlistId,
            title: item.snippet.title,
            description: item.snippet.description.substring(0, 500),
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
            videoCount: detail?.itemCount || detail?.videoCount || 0,
        publishedAt: item.snippet.publishedAt
          };
        });
      } catch (error: any) {
        console.error('YouTube Playlist API error:', error.response?.data || error.message);
        return [];
      }
    });
  }

  /**
   * Get playlist details including video count
   */
  private async getPlaylistDetails(playlistIds: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/playlists`, {
        params: {
          part: 'contentDetails,snippet,status',
          id: playlistIds,
          key: this.apiKey
        },
        timeout: 10000 // 10 second timeout
      });

      // Create a map with playlist ID for easier lookup
      return response.data.items.map((item: any) => ({
        playlistId: item.id,
        itemCount: item.contentDetails?.itemCount || 0,
        videoCount: item.contentDetails?.itemCount || 0
      }));
    } catch (error: any) {
      console.error('Error fetching playlist details:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get videos from a playlist
   */
  async getPlaylistVideos(playlistId: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      return [];
    }

    const cacheKey = `playlist_videos:${playlistId}:${maxResults}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        const response = await axios.get(`${this.baseUrl}/playlistItems`, {
          params: {
            part: 'snippet,contentDetails',
            playlistId: playlistId,
            maxResults: Math.min(maxResults, 50),
            key: this.apiKey
          },
          timeout: 10000 // 10 second timeout
        });

        if (!response.data.items || response.data.items.length === 0) {
          return [];
        }

        const videoIds = response.data.items
          .map((item: any) => item.contentDetails.videoId)
          .join(',');
        
        const videoDetails = await this.getVideoDetails(videoIds);

        return response.data.items.map((item: any, index: number) => ({
          videoId: item.contentDetails.videoId,
          title: item.snippet.title,
          description: item.snippet.description.substring(0, 500),
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
          duration: videoDetails[index]?.duration || '0:00',
          channelTitle: item.snippet.channelTitle,
          viewCount: videoDetails[index]?.viewCount || '0',
          publishedAt: item.snippet.publishedAt,
          playlistId: playlistId
        }));
      } catch (error: any) {
        console.error('Error fetching playlist videos:', error.response?.data || error.message);
        return [];
      }
    });
  }

  /**
   * Get video details including duration and view count
   */
  private async getVideoDetails(videoIds: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: 'contentDetails,statistics,snippet',
          id: videoIds,
          key: this.apiKey
        },
        timeout: 10000 // 10 second timeout
      });

      return response.data.items.map((item: any) => ({
        duration: this.formatDuration(item.contentDetails.duration),
        viewCount: item.statistics.viewCount,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt
      }));
    } catch (error) {
      console.error('Error fetching video details:', error);
      return [];
    }
  }

  /**
   * Get a single video by ID
   */
  async getVideoById(videoId: string): Promise<YouTubeVideo | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: videoId,
          key: this.apiKey
        },
        timeout: 10000
      });

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      const item = response.data.items[0];
      const rawDuration = item.contentDetails?.duration || 'PT0S';
      const durationSeconds = this.parseDurationToSeconds(rawDuration);
      const formattedDuration = this.formatDuration(rawDuration);

      return {
        videoId: videoId,
        title: item.snippet.title,
        description: item.snippet.description.substring(0, 500),
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
        duration: formattedDuration,
        durationSeconds: durationSeconds,
        channelTitle: item.snippet.channelTitle,
        viewCount: item.statistics?.viewCount || '0',
        publishedAt: item.snippet.publishedAt
      };
    } catch (error: any) {
      console.error('Error fetching video by ID:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Get a single playlist by ID
   */
  async getPlaylistById(playlistId: string): Promise<YouTubePlaylist | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/playlists`, {
        params: {
          part: 'contentDetails,snippet',
          id: playlistId,
          key: this.apiKey
        },
        timeout: 10000
      });

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      const item = response.data.items[0];
      return {
        playlistId: playlistId,
        title: item.snippet.title,
        description: item.snippet.description.substring(0, 500),
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        videoCount: item.contentDetails?.itemCount || 0,
        publishedAt: item.snippet.publishedAt
      };
    } catch (error: any) {
      console.error('Error fetching playlist by ID:', error.response?.data || error.message);
      return null;
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
  convertToLearningResource(video: YouTubeVideo, skills: string[], category: string, difficulty: string = 'beginner'): any {
    // Parse duration from seconds or formatted string
    const durationMinutes = video.durationSeconds 
      ? Math.round(video.durationSeconds / 60)
      : this.parseDuration(video.duration);
    
    return {
      title: video.title,
      description: video.description,
      type: 'video',
      category: category,
      skills: skills,
      difficulty: difficulty,
      duration: durationMinutes,
      language: 'en',
      content: {
      video_url: `https://www.youtube.com/watch?v=${video.videoId}`,
        video_id: video.videoId
      },
      video_url: `https://www.youtube.com/watch?v=${video.videoId}`, // Legacy support
      video_id: video.videoId,
      thumbnail_url: video.thumbnail,
      author: {
        name: video.channelTitle
      },
      source: 'YouTube',
      source_url: `https://www.youtube.com/watch?v=${video.videoId}`,
      tags: skills,
      keywords: skills,
      metrics: {
      views: parseInt(video.viewCount) || 0,
      likes: 0,
        bookmarks: 0
      },
      views: parseInt(video.viewCount) || 0, // Legacy support
      likes: 0, // Legacy support
      bookmarks: 0, // Legacy support
      is_active: true,
      is_featured: false,
      status: 'published',
      created_at: new Date(video.publishedAt),
      updated_at: new Date()
    };
  }

  /**
   * Convert YouTube playlist to LearningResource format (as a course)
   */
  convertPlaylistToLearningResource(playlist: YouTubePlaylist, skills: string[], category: string, difficulty: string = 'beginner'): any {
    return {
      title: playlist.title,
      description: playlist.description,
      type: 'course',
      category: category,
      skills: skills,
      difficulty: difficulty,
      duration: playlist.videoCount * 10, // Estimate 10 minutes per video
      language: 'en',
      content: {
        video_url: `https://www.youtube.com/playlist?list=${playlist.playlistId}`,
        video_id: playlist.playlistId // Store playlist ID
      },
      video_url: `https://www.youtube.com/playlist?list=${playlist.playlistId}`, // Legacy support
      video_id: playlist.playlistId,
      thumbnail_url: playlist.thumbnail,
      author: {
        name: playlist.channelTitle
      },
      source: 'YouTube',
      source_url: `https://www.youtube.com/playlist?list=${playlist.playlistId}`,
      tags: skills,
      keywords: skills,
      metrics: {
        views: 0,
        likes: 0,
        bookmarks: 0
      },
      views: 0, // Legacy support
      likes: 0, // Legacy support
      bookmarks: 0, // Legacy support
      is_active: true,
      is_featured: playlist.videoCount > 10, // Feature longer playlists
      status: 'published',
      created_at: new Date(playlist.publishedAt),
      updated_at: new Date(),
      // Additional course metadata
      estimated_practice_time: playlist.videoCount * 15, // 15 minutes per video including practice
      short_description: `${playlist.videoCount} videos covering ${skills.join(', ')}`
    };
  }

  /**
   * Parse duration string to minutes
   */
  /**
   * Parse ISO 8601 duration to seconds
   */
  private parseDurationToSeconds(duration: string): number {
    // ISO 8601 format: PT1H2M10S (1 hour, 2 minutes, 10 seconds)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    return hours * 3600 + minutes * 60 + seconds;
  }

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
