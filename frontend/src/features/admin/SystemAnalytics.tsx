import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  ChartBarIcon, 
  UsersIcon, 
  JobsIcon, 
  ApplicationsIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  StarIcon,
  EyeIcon
} from '../../components/icons';

interface AnalyticsData {
  totalUsers: number;
  activeJobs: number;
  totalApplications: number;
  activeMentors: number;
  userGrowth: number;
  jobGrowth: number;
  applicationGrowth: number;
  mentorGrowth: number;
}

interface ActivityData {
  date: string;
  users: number;
  jobs: number;
  applications: number;
}

export function SystemAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeJobs: 0,
    totalApplications: 0,
    activeMentors: 0,
    userGrowth: 0,
    jobGrowth: 0,
    applicationGrowth: 0,
    mentorGrowth: 0
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would fetch from analytics API
      setAnalytics({
        totalUsers: 1247,
        activeJobs: 89,
        totalApplications: 342,
        activeMentors: 156,
        userGrowth: 12.5,
        jobGrowth: 8.3,
        applicationGrowth: 15.2,
        mentorGrowth: 6.7
      });

      setActivityData([
        { date: '2024-01-15', users: 45, jobs: 12, applications: 28 },
        { date: '2024-01-16', users: 52, jobs: 15, applications: 35 },
        { date: '2024-01-17', users: 38, jobs: 8, applications: 22 },
        { date: '2024-01-18', users: 61, jobs: 18, applications: 42 },
        { date: '2024-01-19', users: 47, jobs: 14, applications: 31 },
        { date: '2024-01-20', users: 55, jobs: 16, applications: 38 },
        { date: '2024-01-21', users: 43, jobs: 11, applications: 29 }
      ]);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUpIcon className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDownIcon className="w-4 h-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">System Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor platform performance, user engagement, and system health</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
              <div className="flex items-center mt-1">
                {getGrowthIcon(analytics.userGrowth)}
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(analytics.userGrowth)}`}>
                  {analytics.userGrowth > 0 ? '+' : ''}{analytics.userGrowth}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.activeJobs}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</div>
              <div className="flex items-center mt-1">
                {getGrowthIcon(analytics.jobGrowth)}
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(analytics.jobGrowth)}`}>
                  {analytics.jobGrowth > 0 ? '+' : ''}{analytics.jobGrowth}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <JobsIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalApplications}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Applications</div>
              <div className="flex items-center mt-1">
                {getGrowthIcon(analytics.applicationGrowth)}
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(analytics.applicationGrowth)}`}>
                  {analytics.applicationGrowth > 0 ? '+' : ''}{analytics.applicationGrowth}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <ApplicationsIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.activeMentors}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Mentors</div>
              <div className="flex items-center mt-1">
                {getGrowthIcon(analytics.mentorGrowth)}
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(analytics.mentorGrowth)}`}>
                  {analytics.mentorGrowth > 0 ? '+' : ''}{analytics.mentorGrowth}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activityData.slice(-5).map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(data.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {data.users} new users, {data.jobs} jobs posted, {data.applications} applications
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{data.users}</span>
                  <UsersIcon className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Server Status</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600 dark:text-green-400">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Response</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600 dark:text-green-400">Fast</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="text-sm text-gray-900 dark:text-white">99.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Engagement</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Daily Active Users</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">342</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Active Users</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">1,156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Active Users</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">1,247</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Jobs Posted Today</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Applications/Job</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">3.8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">78%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Page Views</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">45,678</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">32%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Session</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">4m 32s</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
