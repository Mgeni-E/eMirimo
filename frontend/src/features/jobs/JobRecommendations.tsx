import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
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
  reasons: string[];
}

export function JobRecommendations() {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs/recommendations');
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load job recommendations');
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
    <div className="space-y-4">
      {recommendations.slice(0, 3).map((rec) => (
        <div
          key={rec.job._id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rec.job.title}
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <StarIcon className="w-3 h-3 mr-1" />
                  Recommended
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
                {rec.job.employer_id.name}
              </p>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-2 text-sm">
                {rec.job.description}
              </p>
            </div>
            <div className="ml-4 text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(rec.score)}`}>
                <StarIcon className="w-4 h-4 mr-1" />
                {rec.score}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {getScoreLabel(rec.score)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span className="text-sm">{rec.job.location}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <BriefcaseIcon className="w-4 h-4 mr-1" />
              <span className="text-sm capitalize">{rec.job.type}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {new Date(rec.job.deadline).toLocaleDateString()}
              </span>
            </div>
            {rec.job.salary_min && rec.job.salary_max && (
              <div className="text-gray-600 dark:text-gray-400">
                <span className="text-sm font-medium">
                  {rec.job.salary_min.toLocaleString()} - {rec.job.salary_max.toLocaleString()} {rec.job.currency}
                </span>
              </div>
            )}
          </div>

          {rec.job.skills && rec.job.skills.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {rec.job.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {rec.job.skills.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                    +{rec.job.skills.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {rec.reasons && rec.reasons.length > 0 && (
            <div className="mb-4">
              <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{rec.reasons[0]}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Link
              to={`/jobs/${rec.job._id}`}
              className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              View Details
            </Link>
            <Link
              to={`/jobs/${rec.job._id}/apply`}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
            >
              Apply Now
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
