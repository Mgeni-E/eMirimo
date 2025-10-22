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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Recommended Jobs
        </h2>
        <button
          onClick={fetchRecommendations}
          className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-6">
        {recommendations.map((rec) => (
          <div
            key={rec.job._id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {rec.job.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {rec.job.employer_id.name}
                </p>
                <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
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
                  <span className="text-sm">
                    {rec.job.salary_min.toLocaleString()} - {rec.job.salary_max.toLocaleString()} {rec.job.currency}
                  </span>
                </div>
              )}
            </div>

            {rec.job.skills && rec.job.skills.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {rec.job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {rec.reasons && rec.reasons.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Why this job matches you:</h4>
                <ul className="space-y-1">
                  {rec.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center">
              <Link
                to={`/jobs/${rec.job._id}`}
                className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
              >
                View Details
              </Link>
              <Link
                to={`/jobs/${rec.job._id}/apply`}
                className="px-4 py-2 border border-accent-600 text-accent-600 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900 transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
