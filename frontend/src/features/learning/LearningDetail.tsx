import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/store';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  PlayIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  StarIcon,
  ExternalLinkIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  ArrowLeftIcon,
  HomeIcon,
  CheckCircleIcon,
  RefreshIcon,
  ExclamationTriangleIcon
} from '../../components/icons';

interface LearningResource {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'course' | 'tutorial' | 'guide';
  category: 'technical' | 'soft-skills' | 'career' | 'interview' | 'resume' | 'networking';
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  language: string;
  content_url?: string;
  video_url?: string;
  video_id?: string;
  thumbnail_url?: string;
  author?: string | { name: string };
  source?: string;
  source_url?: string;
  tags: string[];
  views?: number;
  likes?: number;
  bookmarks?: number;
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
  playlistVideos?: any[];
  isYouTube?: boolean;
}

export function LearningDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState<LearningResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const hasCheckedCompletion = useRef(false);

  useEffect(() => {
    if (id) {
      loadResource();
    }
  }, [id]);

  const loadResource = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      if (isRetry) {
        setRetryCount(prev => prev + 1);
      }
      
      // Retry logic for YouTube resources
      let response;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          response = await api.get(`/learning/${id}`);
          break;
        } catch (err: any) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw err;
          }
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
      
      const resourceData = response?.data?.resource || response?.data;
      
      if (!resourceData) {
        setError('Resource not found');
        setLoading(false);
        return;
      }
      
      setResource(resourceData);
      
      // Check if course is already completed
      if (user && !hasCheckedCompletion.current) {
        checkCompletionStatus();
        hasCheckedCompletion.current = true;
      }
    } catch (err: any) {
      console.error('Failed to load resource:', err);
      setError(err.response?.data?.error || 'Failed to load course. Please try again.');
      if (retryCount < 2 && !isRetry) {
        // Auto-retry once
        setTimeout(() => loadResource(true), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkCompletionStatus = async () => {
    if (!user || !resource) return;
    
    try {
      const response = await api.get('/learning/completed');
      const completedIds = response.data?.completedCourses?.map((c: any) => c._id) || [];
      const currentId = resource._id || resource.id || id;
      setIsCompleted(completedIds.includes(currentId));
    } catch (err) {
      console.error('Failed to check completion status:', err);
    }
  };

  const handleMarkComplete = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsCompleting(true);
    try {
      const resourceId = resource?._id || resource?.id || id;
      await api.post(`/learning/${resourceId}/complete`);
      setIsCompleted(true);
      
      // Show success message briefly
      setTimeout(() => {
        // Optionally navigate back or show notification
      }, 1000);
    } catch (err: any) {
      console.error('Failed to mark as complete:', err);
      alert(err.response?.data?.error || 'Failed to mark course as complete');
    } finally {
      setIsCompleting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayIcon className="w-6 h-6" />;
      case 'article': return <DocumentTextIcon className="w-6 h-6" />;
      case 'course': return <BookOpenIcon className="w-6 h-6" />;
      case 'tutorial': return <AcademicCapIcon className="w-6 h-6" />;
      case 'guide': return <DocumentIcon className="w-6 h-6" />;
      default: return <BookOpenIcon className="w-6 h-6" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <BriefcaseIcon className="w-5 h-5" />;
      case 'soft-skills': return <UserGroupIcon className="w-5 h-5" />;
      case 'career': return <BriefcaseIcon className="w-5 h-5" />;
      case 'interview': return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
      case 'resume': return <DocumentIcon className="w-5 h-5" />;
      case 'networking': return <UserGroupIcon className="w-5 h-5" />;
      default: return <BookOpenIcon className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const capitalizeWords = (text: string): string => {
    if (!text) return '';
    return text
      .split(/[\s-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getYouTubeId = () => {
    if (!resource) return null;
    
    // Check if _id is a YouTube ID (playlist IDs start with PL, video IDs are 11 chars)
    if (resource._id && (resource._id.startsWith('PL') || resource._id.length === 11)) {
      return resource._id;
    }
    
    // Check video_id field
    if (resource.video_id) {
      return resource.video_id;
    }
    
    // Check playlist_id field
    if ((resource as any).playlist_id) {
      return (resource as any).playlist_id;
    }
    
    // Parse from video_url
    if (resource.video_url) {
      const videoMatch = resource.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (videoMatch) return videoMatch[1];
      
      const playlistMatch = resource.video_url.match(/[?&]list=([^&\n?#]+)/);
      if (playlistMatch) return playlistMatch[1];
    }
    
    // Fallback: use id from URL params if it looks like YouTube ID
    if (id && (id.startsWith('PL') || id.length === 11)) {
      return id;
    }
    
    return null;
  };

  const isYouTubeVideo = () => {
    const ytId = getYouTubeId();
    return ytId && ytId.length === 11;
  };

  const isYouTubePlaylist = () => {
    const ytId = getYouTubeId();
    return ytId && (ytId.startsWith('PL') || ytId.length > 11);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">{t('loading')}</p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Retrying... ({retryCount}/2)
              </p>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !resource) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-red-500 dark:text-red-400 mb-4">
              <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error || 'Resource Not Found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error ? 'Unable to load the course. Please try again.' : 'The course you are looking for does not exist.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => loadResource(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RefreshIcon className="w-5 h-5" />
                Retry
              </button>
          <Link
            to="/learning"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Learning
          </Link>
        </div>
      </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Link to="/learning" className="hover:text-primary-600 dark:hover:text-primary-400">
                Learning Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white">{resource.title}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Header Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {getTypeIcon(resource.type)}
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {typeof resource.author === 'object' ? resource.author?.name : resource.author || 'Unknown Author'} • {resource.source || 'eMirimo'}
                      </span>
                      {resource.source === 'YouTube' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          YouTube
                        </span>
                      )}
                      {resource.type === 'course' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          <BookOpenIcon className="w-3 h-3 mr-1" />
                          Full Course
                        </span>
                      )}
                      {resource.is_featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          <StarIcon className="w-3 h-3 mr-1" />
                          Featured
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Completed
                  </span>
                      )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {resource.title}
                </h1>
                
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    {getCategoryIcon(resource.category || 'technical')}
                        <span className="text-sm">{capitalizeWords((resource.category || 'technical').replace('-', ' '))}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <ClockIcon className="w-5 h-5" />
                        <span className="text-sm">{formatDuration(resource.duration || 0)}</span>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(resource.difficulty || 'beginner')}`}>
                        {capitalizeWords(resource.difficulty || 'beginner')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completion Button */}
                {user && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span className="font-medium">Course Completed!</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleMarkComplete}
                        disabled={isCompleting}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCompleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Marking...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-5 h-5" />
                            Mark as Done
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* YouTube Video/Playlist Embed */}
              {(isYouTubeVideo() || isYouTubePlaylist()) && user && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {isYouTubePlaylist() ? 'Course Playlist' : 'Video'}
                  </h2>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      src={
                        isYouTubePlaylist()
                          ? `https://www.youtube.com/embed/videoseries?list=${getYouTubeId()}`
                          : `https://www.youtube.com/embed/${getYouTubeId()}`
                      }
                      title={resource.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {isYouTubePlaylist() && resource.playlistVideos && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Course Content ({resource.playlistVideos.length} videos)
                      </h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {resource.playlistVideos.map((video: any, index: number) => (
                          <div
                            key={video.videoId}
                            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            onClick={() => {
                              const iframe = document.querySelector('iframe');
                              if (iframe) {
                                iframe.src = `https://www.youtube.com/embed/${video.videoId}?list=${getYouTubeId()}`;
                              }
                            }}
                          >
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {video.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {video.duration} • {video.channelTitle}
                              </p>
                  </div>
                </div>
                        ))}
              </div>
            </div>
                  )}
                </div>
              )}

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {resource.description}
                </p>
            </div>

            {/* Skills */}
            {resource.skills && resource.skills.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Skills You'll Learn</h2>
                <div className="flex flex-wrap gap-2">
                  {resource.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-md"
                    >
                        {capitalizeWords(skill)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md"
                    >
                        #{capitalizeWords(tag)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
              {/* Quick Navigation Menu */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Navigation</h3>
                <div className="space-y-2">
                  <Link
                    to="/learning"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <HomeIcon className="w-5 h-5 text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Learning Dashboard</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <HomeIcon className="w-5 h-5 text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Main Dashboard</span>
                  </Link>
                  <Link
                    to="/jobs"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <BriefcaseIcon className="w-5 h-5 text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Browse Jobs</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <UserIcon className="w-5 h-5 text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">My Profile</span>
                  </Link>
                </div>
              </div>

            {/* Resource Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resource Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  {getTypeIcon(resource.type || 'article')}
                    <span>{capitalizeWords(resource.type || 'article')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>{formatDuration(resource.duration || 0)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4" />
                    <span className="text-sm">Added {formatDate(resource.created_at || new Date().toISOString())}</span>
                </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Language: {resource.language || 'English'}
                </div>
              </div>
            </div>

            {/* Author Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Author</h3>
              <div className="space-y-2">
                <div className="text-gray-700 dark:text-gray-300 font-medium">
                    {typeof resource.author === 'object' ? resource.author?.name : resource.author || 'Unknown Author'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {resource.source || 'Unknown Source'}
                </div>
                  {resource.source === 'YouTube' && (resource.video_url || resource.source_url) && (
                    <div className="mt-2">
                      <a
                        href={resource.source_url || resource.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                        Watch on YouTube
                      </a>
                    </div>
                  )}
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Engagement</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <EyeIcon className="w-4 h-4" />
                      Views
                    </span>
                  <span className="font-medium text-gray-900 dark:text-white">{resource.views || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <HeartIcon className="w-4 h-4" />
                      Likes
                    </span>
                  <span className="font-medium text-gray-900 dark:text-white">{resource.likes || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Bookmarks</span>
                  <span className="font-medium text-gray-900 dark:text-white">{resource.bookmarks || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
