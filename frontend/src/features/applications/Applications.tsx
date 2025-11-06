import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/store';
import { DashboardLayout } from '../../components/DashboardLayout';

export function Applications(){
  const { t } = useTranslation();
  const { user } = useAuth();
  const [apps,setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ 
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/applications/me');
      // Handle both response formats: { success: true, applications: [] } or direct array
      const applications = response.data?.success
        ? (response.data.applications || [])
        : (Array.isArray(response.data) ? response.data : []);
      setApps(applications);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApps([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'under_review': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300';
      case 'shortlisted': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'interview_scheduled': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'interview_completed': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'offer_made': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'hired': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'withdrawn': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatLocation = (location: any): string => {
    if (!location) return 'Remote';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      const parts: string[] = [];
      if (location.city) parts.push(location.city);
      if (location.country) parts.push(location.country);
      if (location.address) parts.push(location.address);
      if (parts.length > 0) return parts.join(', ');
      if (location.is_remote || location.remote_allowed) return 'Remote';
      return 'Location not specified';
    }
    return 'Remote';
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('myApplications')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track the status of your job applications and stay updated on your progress.
        </p>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">{t('loading')}</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Applications Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">Start applying for jobs to see them here</p>
          <a 
            href="/jobs" 
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {t('browseJobs')}
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map(app => (
            <div key={app._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {app.job_id?.title || 'Job Title Not Available'}
                  </h3>
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {formatLocation(app.job_id?.location)}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Date not available'}
                    </span>
                  </div>
                </div>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(app.status)}`}>
                  {formatStatus(app.status)}
                </span>
              </div>
              
              {app.job_id?.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
                  {app.job_id.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}