import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/store';
import { 
  StarIcon, 
  MapPinIcon, 
  ClockIcon, 
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon
} from '../../components/icons';

interface JobRecommendation {
  job: {
    _id: string;
    title: string;
    description: string;
    location: string;
    type: string;
    skills: string[];
    salary_min: number;
    salary_max: number;
    currency: string;
    deadline: string;
    employer_id: {
      name: string;
      email: string;
    };
  };
  score: number;
  matchScore?: number;
  reasons: string[];
  areasOfImprovement?: string[];
  keywordBoost?: boolean;
}

export function JobRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/jobs/recommendations');
      
      // Handle different response formats
      let recommendationsData: any[] = [];
      
      if (Array.isArray(response.data)) {
        // Direct array response
        recommendationsData = response.data;
      } else if (response.data?.recommendations) {
        // Object with recommendations array
        recommendationsData = response.data.recommendations;
      } else if (response.data?.data) {
        // Object with data array
        recommendationsData = response.data.data;
      }
      
      // Normalize the data structure - handle both { job, score } and { job, matchScore } formats
      const normalized = recommendationsData.map((rec: any) => {
        // If rec is already a job object (from some endpoints), wrap it
        if (rec._id && rec.title && !rec.job) {
          return {
            job: rec,
            score: rec.matchScore || rec.score || 0,
            reasons: rec.reasons || []
          };
        }
        // Otherwise, ensure we have the right structure
        return {
          job: rec.job || rec,
          score: rec.score || rec.matchScore || 0,
          matchScore: rec.matchScore || rec.score || 0,
          reasons: rec.reasons || [],
          areasOfImprovement: rec.areasOfImprovement || [],
          keywordBoost: rec.keywordBoost || false
        };
      }).filter((rec: any) => {
        // Only filter out if job is completely missing or invalid
        if (!rec || !rec.job) return false;
        if (!rec.job._id && !rec.job.id) return false;
        return true;
      });
      
      console.log('Job Recommendations - Raw data:', recommendationsData);
      console.log('Job Recommendations - Normalized:', normalized.length, normalized);
      setRecommendations(normalized);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load job recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
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
          className="mt-4 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Job Recommendations
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Complete your profile to get personalized job recommendations.
        </p>
        <Link
          to="/profile"
          className="inline-flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700"
        >
          Complete Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recommendations.slice(0, 6).map((rec, index) => (
        <div
          key={rec.job?._id || rec.job?.id || `rec-${index}`}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-all duration-200 flex flex-col relative"
        >
          {/* Recommended Badge - Top Right */}
          <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex-shrink-0 whitespace-nowrap z-10 shadow-sm">
            <StarIcon className="w-2.5 h-2.5 mr-1" />
            Recommended
          </span>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 pr-24">
                <div className="mb-1.5">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1 pr-2">
                    {rec.job?.title || 'Job Title'}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-1.5 text-sm font-medium truncate">
                  {rec.job.employer_id?.name || rec.job.company_name || rec.job.employer_id?.company_name || 'Company'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 line-clamp-2 text-xs mb-2">
                  {rec.job?.description || rec.job?.short_description || 'No description available'}
                </p>
              </div>
            </div>
            
            <div className="mb-3">
              {(() => {
                // Handle both decimal (0.85) and percentage (85) formats
                const scoreValue = typeof rec.score === 'number' 
                  ? (rec.score > 1 ? rec.score : Math.round(rec.score * 100))
                  : 0;
                return (
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(scoreValue)}`}>
                      <StarIcon className="w-3 h-3 mr-0.5" />
                      {scoreValue}%
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getScoreLabel(scoreValue)}
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-wrap gap-2 mb-3 text-xs">
              {rec.job.location && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="w-3 h-3 mr-0.5" />
                  <span className="truncate max-w-[100px]">
                    {typeof rec.job.location === 'string' 
                      ? rec.job.location 
                      : (rec.job.location.city || rec.job.location.address || 'Location')}
                  </span>
                </div>
              )}
              {rec.job.type && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <BriefcaseIcon className="w-3 h-3 mr-0.5" />
                  <span className="capitalize">{rec.job.type}</span>
                </div>
              )}
              {(rec.job.deadline || rec.job.application_deadline || rec.job.expiry_date) && (() => {
                const deadline = rec.job.deadline || rec.job.application_deadline || rec.job.expiry_date;
                const deadlineDate = new Date(deadline);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                deadlineDate.setHours(0, 0, 0, 0);
                const isPassed = deadlineDate < today;
                
                return (
                  <div className={`flex items-center ${isPassed 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                  }`}>
                    <ClockIcon className="w-3 h-3 mr-0.5" />
                    <span className="text-xs">{new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                );
              })()}
            </div>

            {rec.job.skills && rec.job.skills.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1.5">
                  {rec.job.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {rec.job.skills.length > 3 && (
                    <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                      +{rec.job.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {rec.reasons && rec.reasons.length > 0 && (
              <div className="mb-3">
                <div className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                  <CheckCircleIcon className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{rec.reasons[0]}</span>
                </div>
              </div>
            )}

            {rec.areasOfImprovement && rec.areasOfImprovement.length > 0 && (
              <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-1.5">
                  💡 Areas to Improve:
                </div>
                <ul className="space-y-1">
                  {rec.areasOfImprovement.slice(0, 3).map((improvement, idx) => (
                    <li key={idx} className="text-xs text-yellow-700 dark:text-yellow-400 flex items-start">
                      <span className="mr-1.5">•</span>
                      <span className="line-clamp-2">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-gray-200 dark:border-gray-600">
            <Link
              to={`/jobs/${rec.job?._id || rec.job?.id}`}
              className="w-full text-center px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              View Details
            </Link>
            {user && user.role === 'seeker' && (
              <Link
                to={`/jobs/${rec.job?._id || rec.job?.id}`}
                className="w-full text-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                Apply Now
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
