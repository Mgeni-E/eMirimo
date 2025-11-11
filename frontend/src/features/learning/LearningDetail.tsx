import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/store';
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
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon
} from '../../components/icons';

interface LearningResource {
  _id: string;
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
  author: string;
  source: string;
  tags: string[];
  views: number;
  likes: number;
  bookmarks: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export function LearningDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState<LearningResource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadResource();
    }
  }, [id]);

  const loadResource = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/learning/${id}`);
      setResource(data);
    } catch (error) {
      console.error('Failed to load resource:', error);
      navigate('/learning');
    } finally {
      setLoading(false);
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

  const openResource = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (resource?.video_url) {
      window.open(resource.video_url, '_blank');
    } else if (resource?.content_url) {
      window.open(resource.content_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Resource Not Found</h1>
          <Link
            to="/learning"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Learning
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/learning"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Learning
          </Link>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(resource.type)}
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {resource.author || 'Unknown Author'} • {resource.source}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {resource.title}
                </h1>
                
                {resource.is_featured && (
                  <div className="flex items-center gap-1 mb-4">
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Featured Resource</span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    {getCategoryIcon(resource.category || 'technical')}
                    <span className="capitalize">{(resource.category || 'technical').replace('-', ' ')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <ClockIcon className="w-5 h-5" />
                    <span>{formatDuration(resource.duration || 0)}</span>
                  </div>
                  
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(resource.difficulty || 'beginner')}`}>
                    {resource.difficulty || 'beginner'}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Added {formatDate(resource.created_at || new Date().toISOString())}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{resource.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HeartIcon className="w-4 h-4" />
                    <span>{resource.likes || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Learn Button */}
            <div className="mb-8">
              {user ? (
                <button
                  onClick={openResource}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {getTypeIcon(resource.type)}
                  {resource.type === 'video' ? 'Watch Now' : 'Read Now'}
                  <ExternalLinkIcon className="w-5 h-5" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <UserIcon className="w-5 h-5" />
                  Login to Access
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Resource Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {resource.description}
                </p>
              </div>
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
                      {skill}
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
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resource Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resource Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  {getTypeIcon(resource.type || 'article')}
                  <span className="capitalize">{resource.type || 'article'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>{formatDuration(resource.duration || 0)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Added {formatDate(resource.created_at || new Date().toISOString())}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="text-sm">Language: {resource.language || 'English'}</span>
                </div>
              </div>
            </div>

            {/* Author Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Author</h3>
              <div className="space-y-2">
                <div className="text-gray-700 dark:text-gray-300 font-medium">
                  {resource.author || 'Unknown Author'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {resource.source || 'Unknown Source'}
                </div>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Engagement</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Views</span>
                  <span className="font-medium text-gray-900 dark:text-white">{resource.views || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Likes</span>
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
  );
}
