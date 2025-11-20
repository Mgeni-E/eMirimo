import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { 
  BookOpenIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon
} from '../../components/icons';

interface LearningRecommendation {
  course?: any;
  resource?: any;
  matchScore?: number;
  relevanceScore?: number;
  reasons?: string[];
  skillsGap?: string[];
}

export function LearningRecommendations() {
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      // Try to get recommendations from dashboard endpoint first
      try {
        const dashboardResponse = await api.get('/dashboard/seeker');
        if (dashboardResponse.data?.success && dashboardResponse.data?.data?.learningRecommendations) {
          const learningRecs = dashboardResponse.data.data.learningRecommendations;
          // Handle both formats: array of courses or array of recommendation objects
          const formatted = learningRecs.map((rec: any) => {
            if (rec.course) return rec;
            if (rec.resource) return rec;
            return { course: rec, matchScore: 0.7, reasons: [] };
          });
          setRecommendations(formatted);
          return;
        }
      } catch (dashboardError) {
        console.log('Dashboard endpoint not available, trying learning endpoint');
      }

      // Try learning recommendations endpoint for personalized courses
      try {
        const recommendationsResponse = await api.get('/learning/recommendations');
        if (recommendationsResponse.data?.success && recommendationsResponse.data?.resources) {
          const resources = recommendationsResponse.data.resources;
          setRecommendations(resources.slice(0, 6).map((resource: any) => ({
            course: resource,
            resource: resource,
            matchScore: 0.8,
            reasons: []
          })));
          return;
        }
      } catch (recError) {
        console.log('Recommendations endpoint not available, trying regular endpoint');
      }

      // Fallback to learning resources endpoint
      const response = await api.get('/learning?includeYouTube=true');
      const resources = response.data?.success 
        ? (response.data.resources || [])
        : (Array.isArray(response.data) ? response.data : []);
      setRecommendations(resources.slice(0, 6).map((resource: any) => ({
        course: resource,
        resource: resource,
        matchScore: 0.6,
        reasons: []
      })));
    } catch (error) {
      console.error('Error fetching learning recommendations:', error);
      setError('Failed to load learning recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    if (score >= 0.6) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      course: 'Course',
      tutorial: 'Tutorial',
      video: 'Video',
      article: 'Article',
      guide: 'Guide',
      ebook: 'E-book',
      podcast: 'Podcast',
      webinar: 'Webinar',
      workshop: 'Workshop'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading recommendations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const displayItems = recommendations.slice(0, 6).map((rec) => {
    const resource = rec.course || rec.resource || rec;
    return { resource, matchScore: rec.matchScore || rec.relevanceScore || 0.6, reasons: rec.reasons || [] };
  });

  if (displayItems.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Learning Recommendations
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Complete your profile to get personalized learning recommendations.
        </p>
        <Link
          to="/profile"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Complete Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayItems.map((item, index) => {
        const resource = item.resource;
        const matchScore = item.matchScore;
        const matchPercentage = Math.round(matchScore * 100);

        return (
          <div
            key={resource._id || resource.id || index}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-all duration-200 flex flex-col relative"
          >
            {/* Recommended Badge - Top Right */}
            <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-green-500 to-teal-500 text-white flex-shrink-0 whitespace-nowrap z-10 shadow-sm">
              <StarIcon className="w-2.5 h-2.5 mr-1" />
              Recommended
            </span>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-24">
                  <div className="mb-1.5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1 pr-2">
                      {typeof resource.title === 'string' ? resource.title : (resource.title?.toString() || 'Untitled')}
                    </h3>
                  </div>
                  {resource.author && (
                    <p className="text-gray-600 dark:text-gray-400 mb-1.5 text-sm font-medium truncate">
                      {typeof resource.author === 'object' ? resource.author?.name : resource.author || 'Unknown Author'} {resource.source && `• ${resource.source}`}
                    </p>
                  )}
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2 text-xs mb-2">
                    {(() => {
                      const desc = resource.short_description || resource.description;
                      return typeof desc === 'string' ? desc : (desc?.toString() || '');
                    })()}
                  </p>
                </div>
              </div>
              
              {matchScore > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(matchScore)}`}>
                      <StarIcon className="w-3 h-3 mr-0.5" />
                      {matchPercentage}%
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Match</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-3 text-xs">
                {resource.type && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <BookOpenIcon className="w-3 h-3 mr-0.5" />
                    <span className="capitalize">
                      {getTypeLabel(typeof resource.type === 'string' ? resource.type : String(resource.type || ''))}
                    </span>
                  </div>
                )}
                {resource.duration && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <ClockIcon className="w-3 h-3 mr-0.5" />
                    <span>{formatDuration(resource.duration)}</span>
                  </div>
                )}
                {resource.difficulty_level && (
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="capitalize">
                      {typeof resource.difficulty_level === 'string' 
                        ? resource.difficulty_level 
                        : (typeof resource.difficulty_level === 'object' && resource.difficulty_level?.name 
                            ? resource.difficulty_level.name 
                            : String(resource.difficulty_level || ''))}
                    </span>
                  </div>
                )}
                {resource.category && (
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="capitalize">
                      {typeof resource.category === 'string' 
                        ? resource.category.replace('_', ' ') 
                        : (typeof resource.category === 'object' && resource.category?.name 
                            ? resource.category.name 
                            : String(resource.category || ''))}
                    </span>
                  </div>
                )}
              </div>

              {resource.skills && resource.skills.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {resource.skills.slice(0, 3).map((skill: any, skillIndex: number) => {
                      // Handle both string and object formats for skills
                      const skillName = typeof skill === 'string' 
                        ? skill 
                        : (typeof skill === 'object' && skill?.name 
                            ? skill.name 
                            : String(skill || ''));
                      return (
                        <span
                          key={skillIndex}
                          className="px-1.5 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs font-medium"
                        >
                          {skillName}
                        </span>
                      );
                    })}
                    {resource.skills.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                        +{resource.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {item.reasons && item.reasons.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{item.reasons[0]}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-600">
              <Link
                to={`/learning/${resource._id || resource.id}`}
                className="w-full block text-center px-3 py-1.5 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                View Course
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

