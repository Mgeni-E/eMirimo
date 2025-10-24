import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  LightBulbIcon,
  BookOpenIcon,
  BriefcaseIcon,
  StarIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
  ChartBarIcon
} from '../../components/icons';
import { api } from '../../lib/api';

interface JobRecommendation {
  job: {
    _id: string;
    title: string;
    description: string;
    location: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    skills: string[];
    experience_level: string;
    employer_id: {
      name: string;
      company_name?: string;
    };
  };
  matchScore: number;
  reasons: string[];
}

interface CourseRecommendation {
  course: {
    _id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    difficulty: string;
    duration: number;
    skills: string[];
    author: string;
  };
  matchScore: number;
  skillsGap: string[];
  reasons: string[];
}

interface PersonalizedDashboard {
  jobRecommendations: JobRecommendation[];
  courseRecommendations: CourseRecommendation[];
  skillsGap: string[];
  summary: {
    totalJobMatches: number;
    totalCourseMatches: number;
    skillsToLearn: number;
  };
}

export function Recommendations() {
  const [dashboard, setDashboard] = useState<PersonalizedDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'jobs' | 'courses'>('jobs');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/ai-recommendations/dashboard');
      setDashboard(response.data.data);
    } catch (error: any) {
      console.error('Failed to load recommendations:', error);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatMatchScore = (score: number) => {
    return Math.round(score * 100);
  };

  const getMatchColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    if (score >= 0.6) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dashboard) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error || 'No recommendations available'}</p>
          <button 
            onClick={loadRecommendations}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Recommendations</h1>
            <p className="text-gray-600 dark:text-gray-400">Personalized job and course recommendations based on your profile</p>
          </div>
          <div className="flex items-center space-x-2">
            <LightBulbIcon className="w-6 h-6 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Powered by AI</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Job Matches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboard.summary.totalJobMatches}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Course Matches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboard.summary.totalCourseMatches}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Skills to Learn</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboard.summary.skillsToLearn}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Gap */}
        {dashboard.skillsGap.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills Gap Analysis</h3>
            <div className="flex flex-wrap gap-2">
              {dashboard.skillsGap.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              These are the skills you should focus on learning to advance your career.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Job Recommendations ({dashboard.jobRecommendations.length})
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Course Recommendations ({dashboard.courseRecommendations.length})
            </button>
          </nav>
        </div>

        {/* Job Recommendations */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {dashboard.jobRecommendations.length === 0 ? (
              <div className="text-center py-12">
                <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No job recommendations available</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Complete your profile to get personalized recommendations</p>
              </div>
            ) : (
              dashboard.jobRecommendations.map((recommendation, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {recommendation.job.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchColor(recommendation.matchScore)}`}>
                          {formatMatchScore(recommendation.matchScore)}% match
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {recommendation.job.employer_id.company_name || recommendation.job.employer_id.name} • {recommendation.job.location}
                      </p>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {recommendation.job.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {recommendation.job.skills.slice(0, 5).map((skill, skillIndex) => (
                          <span 
                            key={skillIndex}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Why this matches you:</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {recommendation.reasons.map((reason, reasonIndex) => (
                            <li key={reasonIndex} className="flex items-center">
                              <StarIcon className="w-4 h-4 text-yellow-500 mr-2" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Course Recommendations */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {dashboard.courseRecommendations.length === 0 ? (
              <div className="text-center py-12">
                <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No course recommendations available</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Complete your profile to get personalized recommendations</p>
              </div>
            ) : (
              dashboard.courseRecommendations.map((recommendation, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {recommendation.course.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchColor(recommendation.matchScore)}`}>
                          {formatMatchScore(recommendation.matchScore)}% match
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {formatDuration(recommendation.course.duration)}
                        </span>
                        <span className="capitalize">{recommendation.course.difficulty}</span>
                        <span className="capitalize">{recommendation.course.category}</span>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {recommendation.course.description}
                      </p>
                      
                      {recommendation.skillsGap.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Skills you'll learn:</h4>
                          <div className="flex flex-wrap gap-2">
                            {recommendation.skillsGap.slice(0, 5).map((skill, skillIndex) => (
                              <span 
                                key={skillIndex}
                                className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Why this course is recommended:</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {recommendation.reasons.map((reason, reasonIndex) => (
                            <li key={reasonIndex} className="flex items-center">
                              <StarIcon className="w-4 h-4 text-yellow-500 mr-2" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
