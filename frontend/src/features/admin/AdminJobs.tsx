import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../lib/store';
import { 
  JobsIcon, 
  FilterIcon,
  SearchIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  TrashIcon
} from '../../components/icons';
import { api } from '../../lib/api';
import { socketService } from '../../lib/socket';

interface Job {
  id: string;
  _id?: string;
  title: string;
  company_name?: string;
  company?: string; // Legacy support
  employer_id?: {
    _id?: string;
    name: string;
    email?: string;
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
  postedBy?: string;
  createdAt: string;
  created_at?: string;
  expiresAt?: string;
  expiry_date?: string;
  applicationsCount?: number;
  applications_count?: number;
}

export function AdminJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
    setupSocketConnection();
    
    return () => {
      if (socketService.isSocketConnected()) {
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
        socketService.getSocket()?.emit('join-admin-dashboard');
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

  const handleAdminUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'job-status-change':
        // Update specific job status
        setJobs(prev => prev.map(job => 
          job.id === data.jobId 
            ? { ...job, status: data.status }
            : job
        ));
        break;
      case 'new-job':
        // Add new job to the list
        setJobs(prev => [data.job, ...prev]);
        break;
      case 'job-update':
        // Refresh jobs list
        loadJobs();
        break;
    }
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading jobs...');
      
      const response = await api.get('/admin/jobs');
      console.log('Jobs API response:', response.data);
      
      // Transform backend data to match frontend interface
      const jobsData = Array.isArray(response.data.jobs) ? response.data.jobs : (Array.isArray(response.data) ? response.data : []);
      const transformedJobs: Job[] = jobsData.map((job: any) => ({
        id: job._id || job.id,
        _id: job._id,
        title: job.title,
        company_name: job.company_name,
        company: job.company_name || job.company || job.employer_id?.name || 'Unknown Company',
        employer_id: job.employer_id,
        location: typeof job.location === 'string' ? job.location : `${job.location?.city || ''}${job.location?.city && job.location?.country ? ', ' : ''}${job.location?.country || ''}`,
        type: job.job_type || job.type,
        status: job.is_active === false ? 'inactive' : (job.status || 'active'),
        salary: job.salary, // Keep original format, format when rendering
        description: job.description,
        requirements: job.requirements || [],
        postedBy: job.employer_id?.name,
        createdAt: job.created_at || job.createdAt,
        expiresAt: job.expiry_date || job.expiresAt,
        applicationsCount: job.applications_count || job.applicationsCount || 0
      }));
      setJobs(transformedJobs);
    } catch (error: any) {
      console.error('Failed to load jobs:', error);
      console.error('Error response:', error.response?.data);
      setError('Failed to load jobs. Please try again.');
      setJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, status: 'active' | 'inactive') => {
    try {
      setError(null);
      await api.patch(`/admin/jobs/${jobId}`, { status });
      setJobs((jobs || []).map(job => 
        job.id === jobId ? { ...job, status } : job
      ));
    } catch (error: any) {
      console.error('Failed to update job status:', error);
      setError(error.response?.data?.error || 'Failed to update job status. Please try again.');
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingJobId(jobId);
      setError(null);
      await api.delete(`/admin/jobs/${jobId}`);
      setJobs((jobs || []).filter(job => job.id !== jobId));
    } catch (error: any) {
      console.error('Failed to delete job:', error);
      setError(error.response?.data?.error || 'Failed to delete job. Please try again.');
    } finally {
      setDeletingJobId(null);
    }
  };

  // Check if user can perform actions on a job
  const canManageJob = (job: Job): boolean => {
    if (!user) return false;
    // Admin can manage all jobs
    if (user.role === 'admin') return true;
    // Employer can only manage their own jobs
    if (user.role === 'employer') {
      const jobEmployerId = job.employer_id?._id || job.employer_id?.name;
      return jobEmployerId === user.id;
    }
    // Job seekers cannot manage any jobs
    return false;
  };


  const filteredJobs = (jobs || []).filter(job => {
    const companyName = job.company_name || job.company || job.employer_id?.name || '';
    const locationStr = typeof job.location === 'string' ? job.location : `${job.location?.city || ''}${job.location?.city && job.location?.country ? ', ' : ''}${job.location?.country || ''}`;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         locationStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Review and manage all job postings on the platform</p>
          </div>
        </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="relative">
            <FilterIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List - Small Square Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredJobs.map((job) => {
          const canManage = canManageJob(job);
          const isDeleting = deletingJobId === job.id;
          
          return (
            <div 
              key={job.id} 
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow duration-200 flex flex-col"
            >
              {/* Job Title */}
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-[3rem]">
                {job.title}
              </h3>
              
              {/* Employer */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <UserIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">
                  {job.company_name || job.company || job.employer_id?.name || 'Unknown Company'}
                </span>
              </div>
              
              {/* Application Deadline */}
              {job.expiresAt && (() => {
                const deadlineDate = new Date(job.expiresAt);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                deadlineDate.setHours(0, 0, 0, 0);
                const isPassed = deadlineDate < today;
                
                return (
                  <div className={`flex items-center text-sm mb-3 ${isPassed 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                  }`}>
                    <CalendarIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="flex items-center gap-2">
                      <span>Deadline: {new Date(job.expiresAt).toLocaleDateString()}</span>
                      {isPassed && (
                        <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-xs font-semibold">
                          Closed
                        </span>
                      )}
                    </span>
                  </div>
                );
              })()}
              
              {/* Action Icons */}
              <div className="flex items-center justify-end gap-2 mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                {/* View Icon - Always visible for all users */}
                <Link
                  to={`/admin/jobs/${job.id}`}
                  className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="View Details"
                >
                  <EyeIcon className="w-5 h-5" />
                </Link>
                
                {/* Management Icons - Only show if user can manage */}
                {canManage && (
                  <>
                    {/* Deactivate/Activate Icon */}
                    {job.status === 'active' ? (
                      <button 
                        onClick={() => updateJobStatus(job.id, 'inactive')}
                        className="p-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        title="Deactivate"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateJobStatus(job.id, 'active')}
                        className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Activate"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                    
                    {/* Delete Icon */}
                    <button 
                      onClick={() => deleteJob(job.id)}
                      disabled={isDeleting}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <JobsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'No jobs have been posted yet.'
              }
            </p>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}