import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  UsersIcon, 
  JobsIcon, 
  ApplicationsIcon, 
  UsersIcon as MentorsIcon,
  ArrowRightIcon,
  SettingsIcon,
  ChartBarIcon,
  CheckIcon,
  ClockIcon,
  StarIcon
} from '../../components/icons';

interface AdminStats {
  totalUsers: number;
  activeJobs: number;
  totalApplications: number;
  activeMentors: number;
}

interface SystemActivity {
  id: string;
  type: 'user' | 'job' | 'application' | 'mentor';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning';
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeJobs: 0,
    totalApplications: 0,
    activeMentors: 0
  });
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would fetch from admin API
      setStats({
        totalUsers: 1247,
        activeJobs: 89,
        totalApplications: 342,
        activeMentors: 156
      });

      setActivities([
        {
          id: '1',
          type: 'user',
          title: 'New user registration: John Doe (Seeker)',
          description: 'User completed registration process',
          timestamp: '2 hours ago',
          status: 'success'
        },
        {
          id: '2',
          type: 'job',
          title: 'Job posting approved: Software Engineer at TechCorp',
          description: 'Job posting has been reviewed and approved',
          timestamp: '4 hours ago',
          status: 'success'
        },
        {
          id: '3',
          type: 'mentor',
          title: 'Mentor profile updated: Jane Smith',
          description: 'Mentor updated their profile information',
          timestamp: '1 day ago',
          status: 'warning'
        }
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
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
      case 'user': return <UsersIcon className="w-4 h-4" />;
      case 'job': return <JobsIcon className="w-4 h-4" />;
      case 'application': return <ApplicationsIcon className="w-4 h-4" />;
      case 'mentor': return <MentorsIcon className="w-4 h-4" />;
      default: return <CheckIcon className="w-4 h-4" />;
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
      {/* Admin Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeJobs}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <JobsIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Applications</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <ApplicationsIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeMentors}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mentors</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <MentorsIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
            <Link to="/admin/users" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <Link to="/admin/users" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">View All Users</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Manage user accounts and permissions</div>
            </Link>
            <Link to="/admin/analytics" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">User Analytics</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">View user engagement and activity</div>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Management</h3>
            <Link to="/admin/jobs" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <Link to="/admin/jobs" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Job Moderation</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Review and approve job postings</div>
            </Link>
            <Link to="/admin/settings" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">System Settings</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Configure platform settings</div>
            </Link>
          </div>
        </div>
      </div>

      {/* System Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Activity</h3>
          <Link to="/admin/analytics" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
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
    </DashboardLayout>
  );
}
