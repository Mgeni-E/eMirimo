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
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [topJobs, setTopJobs] = useState<any[]>([]);
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
            activeJobs: stats.activeJobs,
            totalApplications: stats.totalApplications,
            interviewsScheduled: stats.interviewsScheduled,
            hiredCandidates: stats.hiredCandidates
          });

          setJobs(jobs || []);
          setApplications(applications || []);
          setTopJobs(topJobs || []);
          setActivities(recentActivity || []);
          
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
      // Load employer statistics
      const [jobsResponse, applicationsResponse] = await Promise.all([
        api.get('/employer/jobs/stats'),
        api.get('/employer/applications/stats')
      ]);

      setStats({
        activeJobs: jobsResponse.data?.active || 0,
        totalApplications: applicationsResponse.data?.total || 0,
        interviewsScheduled: applicationsResponse.data?.interview || 0,
        hiredCandidates: applicationsResponse.data?.hired || 0
      });

      // Mock recent activities
      setActivities([
        {
          id: '1',
          type: 'application',
          title: t('newApplicationSoftwareEngineer'),
          description: t('applicationFromSarahJohnson'),
          timestamp: t('minutesAgo', { count: 30 }),
          status: 'pending'
        },
        {
          id: '2',
          type: 'interview',
          title: t('interviewScheduledMikeChen'),
          description: t('frontendDeveloperPosition'),
          timestamp: t('hoursAgo', { count: 2 }),
          status: 'success'
        },
        {
          id: '3',
          type: 'job',
          title: t('jobPostingProductManager'),
          description: t('jobNowLiveAccepting'),
          timestamp: t('daysAgo', { count: 1 }),
          status: 'success'
        }
      ]);
    } catch (error) {
      console.error('Failed to load fallback data:', error);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 py-4">
        <div 
          onClick={() => navigate('/employer/jobs')}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-soft border border-blue-200 dark:border-blue-700 p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeJobs}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('activeJobs')}</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <JobsIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/employer/applications')}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-soft border border-green-200 dark:border-green-700 p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalApplications}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('totalApplications')}</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <ApplicationsIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/employer/interviews')}
          className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl shadow-soft border border-purple-200 dark:border-purple-700 p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.interviewsScheduled}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('interviewsScheduled')}</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/employer/pipeline')}
          className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl shadow-soft border border-orange-200 dark:border-orange-700 p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.hiredCandidates}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('hiredCandidates')}</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Employer Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Job Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Management</h3>
            <Link to="/employer/jobs" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <Link to="/employer/jobs" className="block w-full text-left px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <div className="font-medium text-primary-700 dark:text-primary-300">Post New Job</div>
              <div className="text-sm text-primary-600 dark:text-primary-400">Create a new job listing</div>
            </Link>
            <Link to="/employer/jobs" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">List of Jobs</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">View and manage your job postings</div>
            </Link>
          </div>
        </div>

        {/* Recent Hiring Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Hiring Activity</h3>
            <Link to="/employer/applications" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {activities.map((activity) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Applications and Hiring Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Applications Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Applications</h3>
            <Link to="/employer/applications" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <Link to="/employer/applications" className="block w-full text-left px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <div className="font-medium text-primary-700 dark:text-primary-300">Review Applications</div>
              <div className="text-sm text-primary-600 dark:text-primary-400">Screen and evaluate candidates</div>
            </Link>
            <Link to="/employer/applications" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Schedule Interviews</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Set up candidate interviews</div>
            </Link>
            <Link to="/profile" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Update Profile</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Manage your employer profile</div>
            </Link>
          </div>
        </div>

        {/* Hiring Pipeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hiring Pipeline</h3>
            <Link to="/employer/pipeline" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <Link to="/employer/pipeline" className="block w-full text-left px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <div className="font-medium text-primary-700 dark:text-primary-300">Manage Pipeline</div>
              <div className="text-sm text-primary-600 dark:text-primary-400">Track candidates through hiring stages</div>
            </Link>
            <Link to="/employer/pipeline" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Interview Schedule</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">View upcoming interviews</div>
            </Link>
            <Link to="/employer/pipeline" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Make Hiring Decisions</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Finalize candidate selections</div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
