import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../lib/store';
import { 
  UsersIcon, 
  JobsIcon, 
  ApplicationsIcon, 
  BellIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowRightIcon
} from '../../components/icons';
import { PlatformAnalyticsChart } from '../../components/PlatformAnalyticsChart';
import { api } from '../../lib/api';
import { socketService } from '../../lib/socket';

interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalNotifications: number;
  userGrowth: number;
  jobGrowth: number;
  applicationGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'job' | 'application';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

export function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalNotifications: 0,
    userGrowth: 0,
    jobGrowth: 0,
    applicationGrowth: 0
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    setupSocketConnection();
    
    return () => {
      if (socketService.isSocketConnected()) {
        socketService.leaveAdminDashboard();
        socketService.offAdminUpdate();
      }
    };
  }, []);

  const setupSocketConnection = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
      
      // Listen for connection status
      socketService.getSocket()?.on('connect', () => {
        socketService.joinAdminDashboard();
      });

      socketService.getSocket()?.on('disconnect', () => {
        // Connection lost
      });

      socketService.getSocket()?.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      // Listen for admin updates
      socketService.onAdminUpdate((data) => {
        handleAdminUpdate(data);
      });
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch comprehensive dashboard data
      const dashboardResponse = await api.get('/dashboard/admin');
      const activityResponse = await api.get('/admin/activity?limit=10');

      if (dashboardResponse.data && dashboardResponse.data.success) {
        const { stats: dashboardStats, recentActivity } = dashboardResponse.data.data;
        
        setStats({
          totalUsers: dashboardStats.totalUsers || 0,
          totalJobs: dashboardStats.totalJobs || 0,
          totalApplications: dashboardStats.totalApplications || 0,
          totalNotifications: dashboardStats.totalNotifications || 0,
          userGrowth: dashboardStats.userGrowth || 0,
          jobGrowth: dashboardStats.jobGrowth || 0,
          applicationGrowth: dashboardStats.applicationGrowth || 0
        });

        // Set recent activities from the dashboard data
        if (recentActivity) {
          const formattedActivities = [
            ...(recentActivity.users || []).map((user: any) => ({
              id: user._id,
              type: 'user' as const,
              title: t('newUserRegistration'),
              description: t('registeredAs', { name: user.name, role: user.role }),
              timestamp: user.created_at,
              user: user.name
            })),
            ...(recentActivity.jobs || []).map((job: any) => ({
              id: job._id,
              type: 'job' as const,
              title: t('newJobPosted'),
              description: t('jobByEmployer', { title: job.title, employer: job.employer_id?.name || 'Unknown' }),
              timestamp: job.created_at,
              user: job.employer_id?.name || 'Unknown'
            })),
            ...(recentActivity.applications || []).map((app: any) => ({
              id: app._id,
              type: 'application' as const,
              title: t('newApplication'),
              description: t('appliedForJob', { name: app.seeker_id?.name || 'Unknown', job: app.job_id?.title || 'Unknown' }),
              timestamp: app.applied_at,
              user: app.seeker_id?.name || 'Unknown'
            }))
          ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
           .slice(0, 10);

          setActivities(formattedActivities);
        }
      }

      // Also load activity feed for more comprehensive data
      if (activityResponse.data?.activities) {
        const activityFeed = activityResponse.data.activities.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          timestamp: activity.timestamp,
          user: activity.user
        }));
        
        setActivities(activityFeed);
      }
      
      setLastUpdated(new Date().toISOString());
      
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdminUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'stats-update':
        setStats(prev => ({ ...prev, ...data.data }));
        break;
      case 'new-activity':
        setActivities(prev => [data.data, ...prev.slice(0, 9)]);
        break;
      case 'user-status-change':
      case 'job-status-change':
        // Refresh data when status changes
        loadDashboardData();
        break;
    }
    setLastUpdated(new Date().toISOString());
  }, [loadDashboardData]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <UsersIcon className="w-4 h-4" />;
      case 'job': return <JobsIcon className="w-4 h-4" />;
      case 'application': return <ApplicationsIcon className="w-4 h-4" />;
      default: return <ChartBarIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t('loadingDashboard')}</p>
          </div>
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
              {t('adminDashboard')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('platformOverview', { name: user?.name || 'Admin' })}
            </p>
          </div>
        </div>
        
        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t('lastUpdated', { date: new Date(lastUpdated).toLocaleString() })}
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{t('failedToLoadDashboardData')}</p>
        </div>
      )}

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 py-4">
        <div 
          onClick={() => navigate('/admin/users')}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalUsers')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {stats.userGrowth >= 0 ? (
                  <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${stats.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.userGrowth > 0 ? '+' : ''}{stats.userGrowth}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/jobs')}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalJobs')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalJobs.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {stats.jobGrowth >= 0 ? (
                  <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${stats.jobGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.jobGrowth > 0 ? '+' : ''}{stats.jobGrowth}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <JobsIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/jobs')}
          className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalApplications')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalApplications.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {stats.applicationGrowth >= 0 ? (
                  <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${stats.applicationGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.applicationGrowth > 0 ? '+' : ''}{stats.applicationGrowth}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
              <ApplicationsIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/notifications')}
          className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalNotifications')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalNotifications.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('pendingReview')}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('quickActions')}</h3>
          </div>
          <div className="space-y-3">
            <Link 
              to="/admin/users" 
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('manageUsers')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('viewManageAllUsers')}</p>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link 
              to="/admin/jobs" 
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <JobsIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('manageJobs')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('reviewManageJobPostings')}</p>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link 
              to="/admin/notifications" 
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <BellIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('notifications')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('manageSystemNotifications')}</p>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentActivity')}</h3>
            <Link to="/admin/activity" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
              {t('viewAll')}
            </Link>
          </div>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Analytics Charts */}
      <PlatformAnalyticsChart />
    </DashboardLayout>
  );
}