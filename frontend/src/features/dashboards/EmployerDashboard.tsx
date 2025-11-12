import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../components/DashboardLayout';
import { api } from '../../lib/api';
import { 
  JobsIcon, 
  ApplicationsIcon, 
  UsersIcon,
  ArrowRightIcon,
  UserIcon
} from '../../components/icons';
import { PlatformAnalyticsChart } from '../../components/PlatformAnalyticsChart';

interface EmployerStats {
  activeJobs: number;
  totalApplications: number;
  interviewsScheduled: number;
  hiredCandidates: number;
}

interface RecentActivity {
  id: string;
  type: 'job' | 'application' | 'interview' | 'hire';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning';
}

export function EmployerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<EmployerStats>({
    activeJobs: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    hiredCandidates: 0
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployerData();
  }, []);

  const loadEmployerData = async () => {
    setLoading(true);
    try {
      // Try to load comprehensive dashboard data first
      try {
        const dashboardResponse = await api.get('/dashboard/employer');
        
        if (dashboardResponse.data.success) {
          const { stats, jobs, applications, recentActivity, topJobs } = dashboardResponse.data.data;
          
          setStats({
            activeJobs: stats?.activeJobs || 0,
            totalApplications: stats?.totalApplications || 0,
            interviewsScheduled: stats?.interviewsScheduled || 0,
            hiredCandidates: stats?.hiredCandidates || 0
          });
          
          // Format recent activity timestamps
          const formatTimestamp = (timestamp: string | Date) => {
            if (!timestamp) return t('recently');
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return t('recently');
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) return t('justNow');
            if (diffMins < 60) return diffMins === 1 ? t('minuteAgo', { count: diffMins }) : t('minutesAgoPlural', { count: diffMins });
            if (diffHours < 24) return diffHours === 1 ? t('hourAgo', { count: diffHours }) : t('hoursAgoPlural', { count: diffHours });
            if (diffDays < 7) return diffDays === 1 ? t('dayAgo', { count: diffDays }) : t('daysAgoPlural', { count: diffDays });
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
          };
          
          const formattedActivities = (recentActivity || []).map((activity: any) => ({
            ...activity,
            timestamp: formatTimestamp(activity.timestamp)
          }));
          
          setActivities(formattedActivities);
          
          return; // Success, exit early
        }
      } catch (dashboardError) {
        console.log('Dashboard endpoint not available, using fallback');
      }
      
      // Fallback to individual API calls
      await loadFallbackData();
    } catch (error) {
      console.error('Failed to load employer data:', error);
      await loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = async () => {
    try {
      // Load employer statistics from database using correct endpoints
      const [jobsResponse, applicationsResponse] = await Promise.all([
        api.get('/jobs/my/jobs').catch(() => ({ data: [] })),
        api.get('/applications/employer').catch(() => ({ data: [] }))
      ]);

      const jobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];
      const applications = Array.isArray(applicationsResponse.data) ? applicationsResponse.data : [];

      // Calculate stats from real data
      const activeJobs = jobs.filter((j: any) => j.is_active !== false && (j.status === 'active' || j.status === 'published')).length;
      const totalApplications = applications.length;
      const interviewsScheduled = applications.filter((app: any) => 
        app.status === 'interview_scheduled' || app.status === 'shortlisted' || app.status === 'under_review'
      ).length;
      const hiredCandidates = applications.filter((app: any) => app.status === 'hired').length;

      setStats({
        activeJobs,
        totalApplications,
        interviewsScheduled,
        hiredCandidates
      });

      setJobs(jobs);
      setApplications(applications);

      // Format timestamp helper
      const formatTimestamp = (timestamp: string | Date) => {
        if (!timestamp) return t('recently');
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return t('recently');
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return t('justNow');
        if (diffMins < 60) return diffMins === 1 ? t('minuteAgo', { count: diffMins }) : t('minutesAgoPlural', { count: diffMins });
        if (diffHours < 24) return diffHours === 1 ? t('hourAgo', { count: diffHours }) : t('hoursAgoPlural', { count: diffHours });
        if (diffDays < 7) return diffDays === 1 ? t('dayAgo', { count: diffDays }) : t('daysAgoPlural', { count: diffDays });
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
      };

      // Get real recent activities from database
      const recentActivities = [
        ...jobs.slice(0, 5).map((job: any) => ({
          id: job.id || job._id,
          type: 'job' as const,
          title: t('postedJob', { title: job.title }),
          description: job.is_active !== false ? t('jobIsNowLiveAccepting') : t('jobIsInactive'),
          timestamp: formatTimestamp(job.created_at || job.createdAt || job.posted_at),
          status: job.is_active !== false ? 'success' : 'pending'
        })),
        ...applications.slice(0, 5).map((app: any) => ({
          id: app.id || app._id,
          type: 'application' as const,
          title: t('newApplicationFor', { job: app.job_id?.title || app.job?.title || 'Job' }),
          description: t('applicationFrom', { name: app.seeker_id?.name || app.seeker?.name || 'Unknown User' }),
          timestamp: formatTimestamp(app.applied_at || app.created_at),
          status: app.status === 'hired' ? 'success' : app.status === 'rejected' ? 'warning' : 'pending'
        }))
      ].sort((a, b) => {
        // Sort by original timestamp for proper ordering
        const aTime = jobs.find((j: any) => (j.id || j._id) === a.id)?.created_at || 
                     applications.find((app: any) => (app.id || app._id) === a.id)?.applied_at || 
                     new Date(0);
        const bTime = jobs.find((j: any) => (j.id || j._id) === b.id)?.created_at || 
                     applications.find((app: any) => (app.id || app._id) === b.id)?.applied_at || 
                     new Date(0);
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      }).slice(0, 5);

      setActivities(recentActivities);
    } catch (error) {
      console.error('Failed to load fallback data:', error);
      // Set empty state instead of mock data
      setStats({
        activeJobs: 0,
        totalApplications: 0,
        interviewsScheduled: 0,
        hiredCandidates: 0
      });
      setActivities([]);
    }
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
      case 'job': return <JobsIcon className="w-4 h-4" />;
      case 'application': return <ApplicationsIcon className="w-4 h-4" />;
      case 'interview': return <UsersIcon className="w-4 h-4" />;
      case 'hire': return <UserIcon className="w-4 h-4" />;
      default: return <JobsIcon className="w-4 h-4" />;
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('employerDashboard')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('manageJobPostings')}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/employer/jobs"
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              {t('postNewJob')}
            </Link>
          </div>
        </div>
      </div>

            {/* Employer Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 py-2 sm:py-4">
        <div 
          onClick={() => navigate('/employer/jobs')}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-soft border border-blue-200 dark:border-blue-700 p-4 sm:p-5 md:p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-[1.02] sm:hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeJobs}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('activeJobs')}</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <JobsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/employer/applications')}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-soft border border-green-200 dark:border-green-700 p-4 sm:p-5 md:p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-[1.02] sm:hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalApplications}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('totalApplications')}</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ApplicationsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/employer/interviews')}
          className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl shadow-soft border border-purple-200 dark:border-purple-700 p-4 sm:p-5 md:p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-[1.02] sm:hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 dark:text-white">{stats.interviewsScheduled}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('interviewsScheduled')}</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/employer/pipeline')}
          className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl shadow-soft border border-orange-200 dark:border-orange-700 p-4 sm:p-5 md:p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-[1.02] sm:hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 dark:text-white">{stats.hiredCandidates}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('hiredCandidates')}</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Employer Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Job Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('jobManagement')}</h3>
            <Link to="/employer/jobs" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <Link to="/employer/jobs" className="block w-full text-left px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <div className="font-medium text-primary-700 dark:text-primary-300">{t('postNewJob')}</div>
              <div className="text-sm text-primary-600 dark:text-primary-400">{t('createNewJobListing')}</div>
            </Link>
            <Link to="/employer/jobs" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">{t('listOfJobs')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('viewAndManageJobPostings')}</div>
            </Link>
          </div>
        </div>

        {/* Recent Hiring Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentHiringActivity')}</h3>
            <Link to="/employer/applications" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
              {t('viewAll')}
            </Link>
          </div>
          <div className="space-y-4">
            {activities.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">{t('noRecentActivity')}</p>
                <p className="text-xs mt-1">{t('yourHiringActivityWillAppear')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applications and Hiring Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Applications Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('applications')}</h3>
            <Link to="/employer/applications" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <Link to="/employer/applications" className="block w-full text-left px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <div className="font-medium text-primary-700 dark:text-primary-300">{t('reviewApplications')}</div>
              <div className="text-sm text-primary-600 dark:text-primary-400">{t('screenAndEvaluateCandidates')}</div>
            </Link>
            <Link to="/employer/applications" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">{t('scheduleInterviews')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('setUpCandidateInterviews')}</div>
            </Link>
            <Link to="/profile" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">{t('updateProfile')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('manageYourEmployerProfile')}</div>
            </Link>
          </div>
        </div>

        {/* Hiring Pipeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('hiringPipeline')}</h3>
            <Link to="/employer/pipeline" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <Link to="/employer/pipeline" className="block w-full text-left px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <div className="font-medium text-primary-700 dark:text-primary-300">{t('managePipeline')}</div>
              <div className="text-sm text-primary-600 dark:text-primary-400">{t('trackCandidatesThroughStages')}</div>
            </Link>
            <Link to="/employer/pipeline" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">{t('interviewSchedule')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('viewUpcomingInterviews')}</div>
            </Link>
            <Link to="/employer/pipeline" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">{t('makeHiringDecisions')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('finalizeCandidateSelections')}</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Analytics Charts */}
      <PlatformAnalyticsChart />
    </DashboardLayout>
  );
}
