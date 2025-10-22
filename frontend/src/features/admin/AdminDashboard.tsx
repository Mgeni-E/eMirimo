import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ArrowRightIcon,
  RefreshIcon
} from '../../components/icons';
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
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadDashboardData();
    setupSocketConnection();
    
    return () => {
      if (socketService.isConnected()) {
        socketService.getSocket()?.emit('leave-admin-dashboard');
      }
    };
  }, []);

  const setupSocketConnection = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
      
      // Listen for connection status
      socketService.getSocket()?.on('connect', () => {
        setIsConnected(true);
        socketService.getSocket()?.emit('join-admin-dashboard');
      });

      socketService.getSocket()?.on('disconnect', () => {
        setIsConnected(false);
      });

      socketService.getSocket()?.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });
      
      // Listen for admin updates
      socketService.onAdminUpdate((data) => {
        handleAdminUpdate(data);
      });
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
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch comprehensive dashboard data
      const dashboardResponse = await api.get('/admin/dashboard');
      const activityResponse = await api.get('/admin/activity?limit=10');

      if (dashboardResponse.data) {
        const { stats: dashboardStats, recentActivity } = dashboardResponse.data;
        
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
              title: 'New User Registration',
              description: `${user.name} registered as ${user.role}`,
              timestamp: user.created_at,
              user: user.name
            })),
            ...(recentActivity.jobs || []).map((job: any) => ({
              id: job._id,
              type: 'job' as const,
              title: 'New Job Posted',
              description: `${job.title} by ${job.employer_id?.name || 'Unknown'}`,
              timestamp: job.created_at,
              user: job.employer_id?.name || 'Unknown'
            })),
            ...(recentActivity.applications || []).map((app: any) => ({
              id: app._id,
              type: 'application' as const,
              title: 'New Application',
              description: `${app.user_id?.name || 'Unknown'} applied for ${app.job_id?.title || 'Unknown'}`,
              timestamp: app.created_at,
              user: app.user_id?.name || 'Unknown'
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
  };

  const handleRefresh = async () => {
    await loadDashboardData();
  };

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
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name || 'Admin'}. Here's your platform overview.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/admin/users')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
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
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/jobs')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
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
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <JobsIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/jobs')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
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
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <ApplicationsIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/notifications')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notifications</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalNotifications.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Pending review</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <Link 
              to="/admin/users" 
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Manage Users</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View and manage all users</p>
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
                  <p className="font-medium text-gray-900 dark:text-white">Manage Jobs</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Review and manage job postings</p>
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
                  <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage system notifications</p>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <Link to="/admin/activity" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
              View All
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
    </DashboardLayout>
  );
}