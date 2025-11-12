import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/store';
import { DashboardLayout } from '../../components/DashboardLayout';
import { ApplicationModal } from '../../components/ApplicationModal';
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  BuildingOfficeIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  BookOpenIcon,
  LightBulbIcon,
  ArrowRightIcon
} from '../../components/icons';

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string; // Always a string after transformation
  type: string;
  company_name?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  requirements: string[];
  benefits: string[];
  employer_id: {
    name: string;
    email: string;
  };
  application_deadline: string;
  expiry_date?: string;
  posted_at: string;
  created_at: string;
  updated_at: string;
}

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [courseRecommendations, setCourseRecommendations] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/jobs/${id}`);
      
      // Helper function to format location
      const formatLocation = (loc: any): string => {
        if (!loc) return 'Location not specified';
        if (typeof loc === 'string') return loc;
        if (typeof loc === 'object') {
          const parts: string[] = [];
          if (loc.city) parts.push(loc.city);
          if (loc.country) parts.push(loc.country);
          if (parts.length > 0) return parts.join(', ');
          if (loc.address) return loc.address;
          return 'Location not specified';
        }
        return 'Location not specified';
      };
      
      // Transform backend data to frontend format
      const transformedJob: Job = {
        ...data,
        // Ensure company_name is available
        company_name: data.company_name || (data.employer_id as any)?.employer_profile?.company_name || (data.employer_id as any)?.name || 'Company',
        // Transform location from object to string
        location: formatLocation(data.location),
        // Transform skills from objects to strings
        skills: Array.isArray(data.required_skills)
          ? data.required_skills.map((s: any) => typeof s === 'string' ? s : s?.name || s)
          : Array.isArray(data.skills) ? data.skills : [],
        // Transform requirements from objects to strings
        requirements: Array.isArray(data.requirements)
          ? data.requirements.map((r: any) => typeof r === 'string' ? r : r?.description || r?.name || r)
          : [],
        // Transform benefits from objects to strings
        benefits: Array.isArray(data.benefits)
          ? data.benefits.map((b: any) => typeof b === 'string' ? b : b?.name || b?.description || b)
          : []
      };
      
      setJob(transformedJob);
      
      // Load course recommendations for skill gaps
      if (user && user.role === 'seeker') {
        loadCourseRecommendations(data._id);
      }
    } catch (error) {
      console.error('Failed to load job:', error);
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseRecommendations = async (jobId: string) => {
    try {
      setLoadingCourses(true);
      const response = await api.get(`/learning/recommendations/job/${jobId}`);
      setCourseRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Failed to load course recommendations:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    setApplying(true);
    try {
      const response = await api.post('/applications', applicationData);
      
      if (response.data.success) {
        // Success is handled by the modal
        return Promise.resolve();
      } else {
        throw new Error(response.data.error || 'Application failed');
      }
    } catch (err: any) {
      console.error('Failed to apply:', err);
      const errorMessage = err.response?.data?.error || 'Failed to submit application';
      throw new Error(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDeadlinePassed = (deadline: string): boolean => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">{t('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400">The job you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BuildingOfficeIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {job.company_name || job.employer_id.name}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {job.title}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{job.location}</span>
                  </div>
                  
                  {/* Application Deadline */}
                  {(job.application_deadline || job.expiry_date) && (() => {
                    const deadline = job.application_deadline || job.expiry_date;
                    if (!deadline) return null;
                    const deadlineDate = new Date(deadline);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    deadlineDate.setHours(0, 0, 0, 0);
                    const isPassed = deadlineDate < today;
                    
                    return (
                      <div className={`flex items-center gap-2 ${isPassed 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                      }`}>
                        <ClockIcon className="w-5 h-5" />
                        <span className="flex items-center gap-2">
                          <span>{deadlineDate.toLocaleDateString()}</span>
                          {isPassed && (
                            <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-xs font-semibold">
                              Closed
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })()}
                  
                  {job.salary && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CurrencyDollarIcon className="w-5 h-5" />
                      <span>
                        {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Posted {formatDate(job.posted_at)}
                </div>
                {job.application_deadline && (
                  <div className={`text-sm font-medium ${isDeadlinePassed(job.application_deadline) ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    Deadline: {formatDate(job.application_deadline)}
                    {isDeadlinePassed(job.application_deadline) && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-xs font-semibold">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Apply Button - Only show for job seekers */}
            {user && user.role === 'seeker' && (() => {
              const deadlinePassed = isDeadlinePassed(job.application_deadline);
              return (
                <div className="mb-8">
                  {deadlinePassed ? (
                    <div className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gray-400 dark:bg-gray-600 text-white rounded-lg font-semibold cursor-not-allowed shadow-lg">
                      <XCircleIcon className="w-5 h-5" />
                      Application Closed
                    </div>
                  ) : (
                    <button
                      onClick={handleApplyClick}
                      disabled={applying}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                    >
                      {applying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Applying...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5" />
                          Apply Now
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })()}
            {!user && (
              <div className="mb-8">
                <Link
                  to="/login"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <UserIcon className="w-5 h-5" />
                  Login to Apply
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Job Description</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => {
                    const reqText = typeof requirement === 'string' 
                      ? requirement 
                      : (typeof requirement === 'object' && requirement !== null
                          ? ((requirement as any)?.description || (requirement as any)?.name || String(requirement))
                          : String(requirement));
                    return (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        {reqText}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Benefits</h2>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => {
                    const benefitText = typeof benefit === 'string' 
                      ? benefit 
                      : (typeof benefit === 'object' && benefit !== null
                          ? ((benefit as any)?.name || (benefit as any)?.description || String(benefit))
                          : String(benefit));
                    return (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <StarIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        {benefitText}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => {
                    const skillName = typeof skill === 'string' 
                      ? skill 
                      : (typeof skill === 'object' && skill !== null
                          ? ((skill as any)?.name || String(skill))
                          : String(skill));
                    return (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-md"
                      >
                        {skillName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Company Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Company</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span>{job.company_name || job.employer_id.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Posted {formatDate(job.posted_at)}</span>
                </div>
              </div>
            </div>

            {/* AI Course Recommendations */}
            {user && user.role === 'seeker' && courseRecommendations.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <LightBulbIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upskill for This Role</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recommended courses to bridge skill gaps</p>
                  </div>
                </div>
                
                {loadingCourses ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading recommendations...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courseRecommendations.slice(0, 3).map((course, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                        <div className="flex items-start gap-3">
                          <BookOpenIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                              {course.resource?.title || course.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {course.resource?.description || course.description}
                            </p>
                            {course.skillGap && course.skillGap.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {course.skillGap.slice(0, 2).map((skill: string, skillIndex: number) => (
                                    <span key={skillIndex} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            {Math.round(course.relevanceScore * 100)}% match
                          </span>
                          <Link
                            to={`/learning/${course.resource?._id || course._id}`}
                            className="inline-flex items-center text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                          >
                            View Course
                            <ArrowRightIcon className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
                  <Link
                    to="/learning"
                    className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                  >
                    <BookOpenIcon className="w-4 h-4 mr-2" />
                    Explore All Learning Resources
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            )}

            {/* Application Deadline */}
            {(() => {
              const deadlinePassed = isDeadlinePassed(job.application_deadline);
              return (
                <div className={`rounded-xl border p-6 ${deadlinePassed 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-bold ${deadlinePassed 
                      ? 'text-red-900 dark:text-red-300' 
                      : 'text-green-900 dark:text-green-300'
                    }`}>
                      Application Deadline
                    </h3>
                    {deadlinePassed && (
                      <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-xs font-semibold">
                        Closed
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 ${deadlinePassed 
                    ? 'text-red-700 dark:text-red-400' 
                    : 'text-green-700 dark:text-green-400'
                  }`}>
                    <CalendarIcon className="w-5 h-5" />
                    <span className="font-medium">{formatDate(job.application_deadline)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {job && user && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          job={{
            _id: job._id,
            title: job.title,
            company_name: job.company_name || job.employer_id?.name || 'Company',
            company: job.company_name || job.employer_id?.name || 'Company',
            employer_id: job.employer_id,
            location: job.location,
            salary: job.salary
          }}
          user={{
            name: user.name,
            email: user.email,
            cv_url: (user as any).cv_url,
            skills: (user as any).skills || [],
            work_experience: (user as any).work_experience || []
          }}
          onApply={handleApplicationSubmit}
        />
      )}
    </DashboardLayout>
  );
}
