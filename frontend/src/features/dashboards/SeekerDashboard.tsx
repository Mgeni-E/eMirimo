import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../lib/store';
import { api } from '../../lib/api';
import { 
  ApplicationsIcon, 
  ClockIcon, 
  CheckIcon, 
  StarIcon,
  ArrowRightIcon,
  DocumentIcon,
  LightBulbIcon,
  BookOpenIcon
} from '../../components/icons';
import { JobRecommendations } from '../jobs/JobRecommendations';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    interviewsScheduled: 0,
    profileCompletion: 0,
    newOpportunities: 0
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobRecommendations, setJobRecommendations] = useState<any[]>([]);
  const [learningRecommendations, setLearningRecommendations] = useState<any[]>([]);
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
          const { stats, applications, recentActivity, jobRecommendations, learningRecommendations } = dashboardResponse.data.data;
          
          setStats({
            totalApplications: stats.totalApplications,
            interviewsScheduled: stats.interviewsScheduled,
            profileCompletion: stats.profileCompletion,
            newOpportunities: stats.newOpportunities
          });

          // Set real recent activities
          setActivities(recentActivity || []);
          setApplications(applications || []);
          setJobRecommendations(jobRecommendations || []);
          setLearningRecommendations(learningRecommendations || []);
          
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
      // Load applications data
      const applicationsResponse = await api.get('/applications/me');
      const applications = Array.isArray(applicationsResponse.data) ? applicationsResponse.data : [];
      
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

      setApplications(applications);

      // Mock recent activities
      setActivities([
        {
          id: '1',
          type: 'application',
          title: t('appliedToSoftwareEngineer'),
          description: t('applicationSubmittedSuccessfully'),
          timestamp: t('hoursAgo', { count: 2 }),
          status: 'success'
        },
        {
          id: '2',
          type: 'interview',
          title: t('interviewScheduledTomorrow'),
          description: t('frontendDeveloperPosition'),
          timestamp: t('daysAgo', { count: 1 }),
          status: 'pending'
        },
        {
          id: '3',
          type: 'profile',
          title: t('profileUpdatedSuccessfully'),
          description: t('profileNowComplete'),
          timestamp: t('daysAgo', { count: 3 }),
          status: 'warning'
        }
      ]);
    } catch (error) {
      console.error('Failed to load fallback data:', error);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 py-4">
        <div 
          onClick={() => navigate('/applications')}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-soft border border-blue-200 dark:border-blue-700 p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalApplications}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('applicationsSent')}</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <ApplicationsIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/applications')}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-soft border border-green-200 dark:border-green-700 p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.interviewsScheduled}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('interviewsScheduled')}</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/profile')}
          className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl shadow-soft border border-purple-200 dark:border-purple-700 p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.profileCompletion}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('profileComplete')}</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/jobs')}
          className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl shadow-soft border border-orange-200 dark:border-orange-700 p-6 hover:shadow-medium transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.newOpportunities}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('newOpportunities')}</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 py-4">
        {/* Job Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentActivity')}</h3>
            <Link to="/applications" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
              {t('viewAll')}
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

      {/* AI-Powered Job Recommendations */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700 p-8 my-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recommendedForYou')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('aiPoweredMatches')}</p>
            </div>
          </div>
          <Link to="/jobs" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
            {t('viewAllJobs')}
          </Link>
        </div>
        <JobRecommendations />
      </div>

      {/* Learning Resources Quick Access */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 my-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('learningResources')}</h3>
          <Link to="/learning" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
            {t('viewAllResources')}
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('boostYourSkills')}</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('accessPersonalizedLearning')}</p>
          <Link 
            to="/learning" 
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('exploreLearningResources')}
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-sm border border-purple-200 dark:border-purple-700 p-8 my-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <LightBulbIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('aiRecommendations')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('personalizedForProfile')}</p>
            </div>
          </div>
          <Link to="/recommendations" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
            {t('viewAll')}
          </Link>
        </div>
        <div className="text-center py-8">
          <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-4">{t('getPersonalizedRecommendations')}</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('aiPoweredJobCourse')}</p>
          <Link 
            to="/recommendations" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
          >
            <LightBulbIcon className="w-5 h-5 mr-2" />
            {t('viewAiRecommendations')}
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Learning & Development */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg shadow-sm border border-green-200 dark:border-green-700 p-8 my-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('learningDevelopment')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('enhanceSkillsCurated')}</p>
            </div>
          </div>
          <Link to="/learning" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
            {t('viewAll')}
          </Link>
        </div>
        <div className="text-center py-8">
          <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-4">{t('upskillForSuccess')}</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('accessCoursesTutorials')}</p>
          <Link 
            to="/learning" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
          >
            <BookOpenIcon className="w-5 h-5 mr-2" />
            {t('startLearning')}
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
