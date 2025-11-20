import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/store';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  PlayIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  StarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  ArrowRightIcon
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
}

interface LearningRecommendation {
  resource: LearningResource;
  relevanceScore: number;
  reasons: string[];
  skillGap: string[];
}

export function LearningResources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>('all');
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    difficulty: ''
  });

  useEffect(() => {
    loadLearningData();
  }, [filters, user]);

  const loadLearningData = async () => {
    try {
      setLoading(true);
      
      // Load recommendations only if user is authenticated
      if (user) {
        try {
          const recResponse = await api.get('/learning/recommendations');
          setRecommendations(recResponse.data.recommendations || []);
        } catch (error) {
          console.log('Recommendations not available for unauthenticated users');
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }
      
      // Load all resources with filters
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      
      const resResponse = await api.get(`/learning?${params.toString()}`);
      setResources(resResponse.data.resources || []);
    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayIcon className="w-5 h-5" />;
      case 'article': return <DocumentTextIcon className="w-5 h-5" />;
      case 'course': return <BookOpenIcon className="w-5 h-5" />;
      case 'tutorial': return <AcademicCapIcon className="w-5 h-5" />;
      case 'guide': return <DocumentIcon className="w-5 h-5" />;
      default: return <BookOpenIcon className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <BriefcaseIcon className="w-4 h-4" />;
      case 'soft-skills': return <UserGroupIcon className="w-4 h-4" />;
      case 'career': return <BriefcaseIcon className="w-4 h-4" />;
      case 'interview': return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
      case 'resume': return <DocumentIcon className="w-4 h-4" />;
      case 'networking': return <UserGroupIcon className="w-4 h-4" />;
      default: return <BookOpenIcon className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };


  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading learning resources...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Learning Resources
            </h1>
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={() => setActiveTab('recommended')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'recommended'
                      ? 'bg-accent-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Recommended
                </button>
              )}
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'all'
                    ? 'bg-accent-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All Resources
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="soft-skills">Soft Skills</option>
              <option value="career">Career</option>
              <option value="interview">Interview</option>
              <option value="resume">Resume</option>
              <option value="networking">Networking</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="video">Video</option>
              <option value="article">Article</option>
              <option value="course">Course</option>
              <option value="tutorial">Tutorial</option>
              <option value="guide">Guide</option>
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'all' ? resources : recommendations.map(rec => rec.resource)).map((resource) => {
              const rec = recommendations.find(r => r.resource._id === resource._id);
              return (
                <Link
                  key={resource._id}
                  to={`/learning/${resource._id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 overflow-hidden block"
                >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(resource.type)}
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {typeof resource.author === 'object' ? resource.author?.name : resource.author || 'Unknown Author'} • {resource.source}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2">
                      {resource.title}
                    </h3>
                    {resource.is_featured && (
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Featured</span>
                      </div>
                    )}
                    {rec && (
                      <div className="flex items-center gap-2 mt-2">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          {rec.relevanceScore}% Match
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Resource Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {getCategoryIcon(resource.category)}
                    <span className="capitalize">{resource.category.replace('-', ' ')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatDuration(resource.duration)}</span>
                  </div>
                  
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                    {resource.difficulty}
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
                  {resource.description}
                </p>
                
                {/* Skills */}
                {resource.skills && resource.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resource.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                    {resource.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-md">
                        +{resource.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Recommendation Reasons */}
                {rec && rec.reasons && rec.reasons.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Why recommended:</h4>
                    <ul className="space-y-1">
                      {rec.reasons.slice(0, 2).map((reason, index) => (
                        <li key={index} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                          <StarIcon className="w-3 h-3 text-primary-500 mr-1 mt-0.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 font-medium">
                  <span>View Details</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{resource.views} views</span>
                  <span>{resource.likes} likes</span>
                </div>
              </div>
            </Link>
              );
            })}
          </div>
        </div>
    </DashboardLayout>
  );
}
