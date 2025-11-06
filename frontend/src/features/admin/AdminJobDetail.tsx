import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { api } from '../../lib/api';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  EditIcon,
  TrashIcon
} from '../../components/icons';

interface JobDetail {
  id: string;
  _id?: string;
  title: string;
  company_name?: string;
  company?: string; // Legacy support
  employer_id?: {
    name: string;
    email: string;
  };
  location: string | {
    city?: string;
    country?: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'active' | 'inactive' | 'pending' | 'expired';
  salary?: string | {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  postedBy?: string;
  employer_id?: {
    name: string;
  };
  createdAt: string;
  created_at?: string;
  expiresAt?: string;
  expiry_date?: string;
  applicationsCount?: number;
  applications_count?: number;
  viewsCount?: number;
  views_count?: number;
}

export function AdminJobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadJobDetail(id);
    }
  }, [id]);

  const loadJobDetail = async (jobId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use public jobs endpoint - admins can access any job
      const response = await api.get(`/jobs/${jobId}`);
      const jobData = response.data;
      
      if (!jobData) {
        setError('Job not found');
        return;
      }
      
      // Transform backend data to match frontend interface
      const transformedJob: JobDetail = {
        id: jobData._id || jobId,
        _id: jobData._id,
        title: jobData.title,
        company_name: jobData.company_name,
        company: jobData.company_name || jobData.company || jobData.employer_id?.name || 'Unknown Company',
        employer_id: jobData.employer_id,
        location: typeof jobData.location === 'string' 
          ? jobData.location 
          : `${jobData.location?.city || ''}${jobData.location?.city && jobData.location?.country ? ', ' : ''}${jobData.location?.country || ''}`,
        type: jobData.job_type || jobData.type || 'full-time',
        status: jobData.is_active === false ? 'inactive' : (jobData.status || 'active'),
        salary: jobData.salary,
        description: jobData.description || '',
        requirements: Array.isArray(jobData.requirements) 
          ? jobData.requirements.map((r: any) => typeof r === 'string' ? r : (r.description || r.type || '')) 
          : [],
        benefits: Array.isArray(jobData.benefits) 
          ? jobData.benefits.map((b: any) => typeof b === 'string' ? b : (b.name || b.category || '')) 
          : [],
        postedBy: jobData.employer_id?.name,
        createdAt: jobData.created_at || jobData.createdAt || new Date().toISOString(),
        expiresAt: jobData.expiry_date || jobData.expiresAt || jobData.application_deadline,
        applicationsCount: jobData.applications_count || jobData.applicationsCount || jobData.application_count || 0,
        viewsCount: jobData.views_count || jobData.viewsCount || jobData.views || 0
      };
      
      setJob(transformedJob);
    } catch (error: any) {
      console.error('Failed to load job detail:', error);
      setError(error.response?.data?.error || 'Failed to load job details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (status: 'active' | 'inactive') => {
    try {
      await api.patch(`/admin/jobs/${id}`, { 
        is_active: status === 'active',
        status: status === 'active' ? 'active' : 'paused'
      });
      setJob(prev => prev ? { ...prev, status } : null);
    } catch (error: any) {
      console.error('Failed to update job status:', error);
      setError('Failed to update job status. Please try again.');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'part-time': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'contract': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'internship': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading job details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Job not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'The requested job could not be found.'}
          </p>
          <Link 
            to="/admin/jobs"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/admin/jobs"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">{job.company_name || job.company || job.employer_id?.name || 'Unknown Company'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
              {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Job Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Information</h2>
            
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Location</span>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{job.location || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Salary</span>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {job.salary 
                      ? (typeof job.salary === 'string' 
                          ? job.salary 
                          : `${job.salary.currency || 'RWF'} ${job.salary.min?.toLocaleString() || ''}${job.salary.max ? ` - ${job.salary.max.toLocaleString()}` : ''}`)
                      : 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{job.description || 'No description provided'}</p>
              </div>
              
              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    {job.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Benefits</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    {job.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Stats and Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Applications</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{job.applicationsCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{job.viewsCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Posted</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Employer</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {job.employer_id?.name || job.postedBy || job.company_name || job.company || 'Unknown'}
                </span>
              </div>
              
              {job.expiresAt && (() => {
                const deadlineDate = new Date(job.expiresAt);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                deadlineDate.setHours(0, 0, 0, 0);
                const isPassed = deadlineDate < today;
                
                return (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Application Deadline</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isPassed 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                      }`}>
                        {new Date(job.expiresAt).toLocaleDateString()}
                      </span>
                      {isPassed && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-xs font-semibold">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
            
            <div className="space-y-3">
              {job.status === 'active' ? (
                <button 
                  onClick={() => updateJobStatus('inactive')}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <XCircleIcon className="w-4 h-4 mr-2" />
                  Deactivate Job
                </button>
              ) : (
                <button 
                  onClick={() => updateJobStatus('active')}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Activate Job
                </button>
              )}
              
              <button className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <EditIcon className="w-4 h-4 mr-2" />
                Edit Job
              </button>
              
              <button className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
