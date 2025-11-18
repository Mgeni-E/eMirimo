import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../components/DashboardLayout';
import { api } from '../../lib/api';
import { 
  ApplicationsIcon, 
  ClockIcon, 
  CheckIcon, 
  StarIcon,
  ArrowRightIcon,
  DocumentIcon
} from '../../components/icons';
import { JobRecommendations } from '../jobs/JobRecommendations';
import { LearningRecommendations } from '../learning/LearningRecommendations';

interface DashboardStats {
  totalApplications: number;
  interviewsScheduled: number;
  profileCompletion: number;
  newOpportunities: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'interview' | 'profile' | 'opportunity';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning';
}

export function SeekerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    interviewsScheduled: 0,
    profileCompletion: 0,
    newOpportunities: 0
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Try to load comprehensive dashboard data first
      try {
        const dashboardResponse = await api.get('/dashboard/seeker');
        
        if (dashboardResponse.data.success) {
          const { stats, recentActivity } = dashboardResponse.data.data;
          
          setStats({
            totalApplications: stats.totalApplications,
            interviewsScheduled: stats.interviewsScheduled,
            profileCompletion: stats.profileCompletion,
            newOpportunities: stats.newOpportunities
          });

          // Set real recent activities
          setActivities(recentActivity || []);
          
          return; // Success, exit early
        }
      } catch (dashboardError) {
        console.log('Dashboard endpoint not available, using fallback');
      }
      
      // Fallback to individual API calls
      await loadFallbackData();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      await loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = async () => {
    try {
      // Load applications data from database
      const applicationsResponse = await api.get('/applications/me');
      const applications = Array.isArray(applicationsResponse.data) ? applicationsResponse.data : [];
      
      // Calculate stats from real data
      const totalApplications = applications.length;
      const interviewsScheduled = applications.filter((app: any) => 
        app.status === 'interview_scheduled' || app.status === 'interview_completed' || app.status === 'shortlisted' || app.status === 'under_review'
      ).length;
      
      // Get user profile for completion calculation
      const profileResponse = await api.get('/users/me');
      const user = profileResponse.data?.user;
      const profileCompletion = user ? calculateProfileCompletion(user) : 0;
      
      // Get new opportunities from database (jobs posted in last 7 days)
      const jobsResponse = await api.get('/jobs?limit=100');
      const allJobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newOpportunities = allJobs.filter((job: any) => {
        const jobDate = new Date(job.created_at || job.createdAt || 0);
        return jobDate >= sevenDaysAgo;
      }).length;

      setStats({
        totalApplications,
        interviewsScheduled,
        profileCompletion,
        newOpportunities
      });

      // Get real recent activities from applications
      const recentActivities: RecentActivity[] = applications.slice(0, 5).map((app: any) => ({
        id: app.id || app._id,
        type: 'application' as const,
        title: `Applied to ${app.job_id?.title || app.job?.title || 'Job'}`,
        description: `Application status: ${app.status}`,
        timestamp: app.applied_at || app.created_at || new Date().toISOString(),
        status: (app.status === 'hired' ? 'success' : app.status === 'rejected' ? 'warning' : 'pending') as 'success' | 'pending' | 'warning'
      }));

      setActivities(recentActivities);
    } catch (error) {
      console.error('Failed to load fallback data:', error);
      // Set empty state instead of mock data
      setStats({
        totalApplications: 0,
        interviewsScheduled: 0,
        profileCompletion: 0,
        newOpportunities: 0
      });
      setActivities([]);
    }
  };

  const calculateProfileCompletion = (user: any) => {
    if (!user) return 0;
    
    const seeker = user?.job_seeker_profile || {};
    const skills = Array.isArray(user?.skills) ? user.skills : [];

    const requiredFields = [
      user?.name,
      user?.email,
      user?.bio,
      user?.phone,
      user?.profile_image,
      skills.length > 0,
      seeker?.professional_summary,
      seeker?.work_experience?.length > 0,
      seeker?.education?.length > 0,
      seeker?.languages?.length > 0,
      seeker?.job_preferences?.job_types?.length > 0,
      seeker?.job_preferences?.availability
    ];

    const filled = requiredFields.filter(Boolean).length;
    const pct = Math.round((filled / requiredFields.length) * 100);
    return isNaN(pct) ? 0 : Math.max(0, Math.min(100, pct));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'pending': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application': return <ApplicationsIcon className="w-4 h-4" />;
      case 'interview': return <ClockIcon className="w-4 h-4" />;
      case 'profile': return <CheckIcon className="w-4 h-4" />;
      case 'opportunity': return <StarIcon className="w-4 h-4" />;
      default: return <DocumentIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {stats.profileCompletion < 100 && (
        <div className="mb-4 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 flex items-center justify-between">
          <div>
            <div className="text-sm text-amber-800 dark:text-amber-200 font-medium">{t('yourProfileIsPercentComplete', { percent: stats.profileCompletion })}</div>
            <div className="text-xs text-amber-700 dark:text-amber-300">{t('completeYourProfileToImprove')}</div>
          </div>
          <Link to="/profile" className="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-md">{t('completeProfile')}</Link>
        </div>
      )}
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 py-2 sm:py-4">
        <div 
          onClick={() => navigate('/applications')}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-soft border border-blue-200 dark:border-blue-700 p-4 sm:p-5 md:p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-[1.02] sm:hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalApplications}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('applicationsSent')}</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ApplicationsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/applications')}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-soft border border-green-200 dark:border-green-700 p-4 sm:p-5 md:p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-[1.02] sm:hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 dark:text-white">{stats.interviewsScheduled}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('interviewsScheduled')}</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/profile')}
          className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl shadow-soft border border-purple-200 dark:border-purple-700 p-4 sm:p-5 md:p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-[1.02] sm:hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 dark:text-white">{stats.profileCompletion}%</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('profileComplete')}</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/jobs')}
          className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl shadow-soft border border-orange-200 dark:border-orange-700 p-4 sm:p-5 md:p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-[1.02] sm:hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 dark:text-white">{stats.newOpportunities}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('newOpportunities')}</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <StarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8 py-2 sm:py-4">
        {/* Job Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('jobSearch')}</h3>
            <Link to="/jobs" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <Link to="/jobs" className="block w-full text-left px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <div className="font-medium text-primary-700 dark:text-primary-300">{t('browseJobs')}</div>
              <div className="text-sm text-primary-600 dark:text-primary-400">{t('findRemoteOpps')}</div>
            </Link>
            <Link to="/applications" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">{t('myApplications')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('trackApplicationStatus')}</div>
            </Link>
            <Link to="/profile" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">{t('updateProfile')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('improveVisibility')}</div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentActivity')}</h3>
            <Link to="/applications" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
              {t('viewAll')}
            </Link>
          </div>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-600 dark:text-gray-400 mb-2">{t('noRecentActivityYet')}</div>
                <div className="text-sm text-gray-500 dark:text-gray-500 mb-4">{t('applyToJobsAndUpdateProfile')}</div>
                <div className="flex items-center gap-2 justify-center">
                  <Link to="/jobs" className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md text-sm">{t('browseJobs')}</Link>
                  <Link to="/profile" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm">{t('updateProfile')}</Link>
                </div>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status)}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.title}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {activity.description}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('recommendedForYou')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('jobsMatchedToYourProfile')}</p>
            </div>
            <Link 
              to="/jobs" 
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center"
            >
              {t('viewAll')}
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          <JobRecommendations />
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Recommended Courses</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Personalized courses to enhance your skills</p>
            </div>
            <Link 
              to="/learning" 
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center"
            >
              {t('viewAll')}
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          <LearningRecommendations />
        </div>
      </div>
    </DashboardLayout>
  );
}
