import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../lib/store';
import { api } from '../../lib/api';
import { 
  ApplicationsIcon, 
  ClockIcon, 
  CheckIcon, 
  StarIcon,
  ArrowRightIcon,
  UsersIcon,
  DocumentIcon,
  CalendarIcon
} from '../../components/icons';

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
  const { user } = useAuth();
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
      // Load applications data
      const applicationsResponse = await api.get('/applications/me');
      const applications = applicationsResponse.data || [];
      
      // Calculate stats
      const totalApplications = applications.length;
      const interviewsScheduled = applications.filter((app: any) => 
        app.status === 'interview' || app.status === 'shortlisted'
      ).length;
      
      // Mock profile completion calculation
      const profileCompletion = calculateProfileCompletion();
      
      // Mock new opportunities
      const newOpportunities = Math.floor(Math.random() * 10) + 1;

      setStats({
        totalApplications,
        interviewsScheduled,
        profileCompletion,
        newOpportunities
      });

      // Mock recent activities
      setActivities([
        {
          id: '1',
          type: 'application',
          title: 'Applied to Software Engineer at TechCorp',
          description: 'Your application has been submitted successfully',
          timestamp: '2 hours ago',
          status: 'success'
        },
        {
          id: '2',
          type: 'interview',
          title: 'Interview scheduled for tomorrow',
          description: 'Frontend Developer position at StartupXYZ',
          timestamp: '1 day ago',
          status: 'pending'
        },
        {
          id: '3',
          type: 'profile',
          title: 'Profile updated successfully',
          description: 'Your profile is now 95% complete',
          timestamp: '3 days ago',
          status: 'warning'
        }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    // Mock calculation - in real app, this would check profile completeness
    return 95;
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
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Applications Sent</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <ApplicationsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.interviewsScheduled}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Interviews Scheduled</div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.profileCompletion}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Profile Complete</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newOpportunities}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">New Opportunities</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Search</h3>
            <Link to="/jobs" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <Link to="/jobs" className="block w-full text-left px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <div className="font-medium text-primary-700 dark:text-primary-300">Browse Jobs</div>
              <div className="text-sm text-primary-600 dark:text-primary-400">Find remote opportunities</div>
            </Link>
            <Link to="/applications" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">My Applications</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Track application status</div>
            </Link>
            <Link to="/profile" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Update Profile</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Improve your visibility</div>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Career Development</h3>
            <Link to="/resources" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <Link to="/mentors" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Find Mentors</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Connect with industry experts</div>
            </Link>
            <Link to="/resources" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Learning Resources</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Skills development materials</div>
            </Link>
            <Link to="/events" className="block w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Upcoming Events</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Workshops and networking</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          <Link to="/applications" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
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
