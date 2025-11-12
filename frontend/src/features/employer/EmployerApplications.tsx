import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { api } from '../../lib/api';
import { 
  ApplicationsIcon, 
  ClockIcon,
  CheckIcon,
  XIcon,
  EyeIcon,
  CalendarIcon,
  SearchIcon,
  SortAscendingIcon
} from '../../components/icons';

interface Application {
  _id: string;
  id?: string;
  seeker_id: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    skills: string[];
    work_experience: any[];
  };
  job_id: {
    _id: string;
    title: string;
    company: string;
    location: string;
  };
  status: 'applied' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected' | 'under_review' | 'interview_scheduled' | 'interview_completed' | 'offer_made' | 'withdrawn';
  applied_at: string;
  cover_letter?: string;
  resume_url?: string;
  notes?: string;
  interview_date?: string;
  interview_location?: string;
  salary_offered?: {
    amount: number;
    currency: string;
  };
  rejection_reason?: string;
}

interface ApplicationStats {
  total: number;
  pending: number;
  reviewed: number;
  shortlisted: number;
  interviews: number;
  offers: number;
  hired: number;
  rejected: number;
}

export function EmployerApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    interviews: 0,
    offers: 0,
    hired: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/applications/employer');
      // Handle both response formats: { success: true, applications: [] } or direct array
      const data = response.data?.success 
        ? (response.data.applications || [])
        : (Array.isArray(response.data) ? response.data : []);
      
      setApplications(data);
      
      // Calculate stats from real database data
      const stats = {
        total: data.length,
        pending: data.filter((app: Application) => app.status === 'applied').length,
        reviewed: data.filter((app: Application) => app.status === 'under_review').length,
        shortlisted: data.filter((app: Application) => app.status === 'shortlisted').length,
        interviews: data.filter((app: Application) => app.status === 'interview_scheduled' || app.status === 'interview_completed').length,
        offers: data.filter((app: Application) => app.status === 'offer_made').length,
        hired: data.filter((app: Application) => app.status === 'hired').length,
        rejected: data.filter((app: Application) => app.status === 'rejected').length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Failed to load applications:', error);
      // Set empty state on error
      setApplications([]);
      setStats({
        total: 0,
        pending: 0,
        reviewed: 0,
        shortlisted: 0,
        interviews: 0,
        offers: 0,
        hired: 0,
        rejected: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      const response = await api.patch(`/applications/${applicationId}/status`, {
        status,
        notes
      });
      
      if (response.data.success) {
        // Reload applications to get updated data
        loadApplications();
        alert('Application status updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update application status:', error);
      alert('Failed to update application status');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <ClockIcon className="w-4 h-4" />;
      case 'under_review': return <EyeIcon className="w-4 h-4" />;
      case 'shortlisted': return <CheckIcon className="w-4 h-4" />;
      case 'interview_scheduled': return <CalendarIcon className="w-4 h-4" />;
      case 'interview_completed': return <CalendarIcon className="w-4 h-4" />;
      case 'offer_made': return <CheckIcon className="w-4 h-4" />;
      case 'hired': return <CheckIcon className="w-4 h-4" />;
      case 'rejected': return <XIcon className="w-4 h-4" />;
      case 'withdrawn': return <XIcon className="w-4 h-4" />;
      default: return <ApplicationsIcon className="w-4 h-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const seekerName = (app.seeker_id as any)?.name || '';
    const jobTitle = (app.job_id as any)?.title || '';
    const matchesSearch = seekerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
      case 'oldest':
        return new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime();
      case 'name':
        return ((a.seeker_id as any)?.name || '').localeCompare((b.seeker_id as any)?.name || '');
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

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
              Applications Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and manage job applications from candidates
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Applications</div>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <ApplicationsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
            </div>
            <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.interviews}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Interviews</div>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.hired}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hired</div>
            </div>
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search candidates or jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="interview_completed">Interview Completed</option>
              <option value="offer_made">Offer Made</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
          
          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAscendingIcon className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Applications ({sortedApplications.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedApplications.length === 0 ? (
            <div className="p-8 text-center">
              <ApplicationsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Applications will appear here when candidates apply to your jobs'
                }
              </p>
            </div>
          ) : (
            sortedApplications.map((application) => (
              <div key={application._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Candidate Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative overflow-hidden">
                      {(() => {
                        const profileImage = (application.seeker_id as any)?.profile_image;
                        const hasValidImage = profileImage && typeof profileImage === 'string' && profileImage.trim() !== '' && (profileImage.startsWith('http://') || profileImage.startsWith('https://'));
                        
                        if (hasValidImage) {
                          return (
                            <>
                              <img 
                                src={profileImage} 
                                alt={(application.seeker_id as any)?.name || 'Candidate'}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  // Fallback to initial if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = parent.querySelector('.avatar-fallback');
                                    if (fallback) {
                                      (fallback as HTMLElement).style.display = 'flex';
                                    }
                                  }
                                }}
                              />
                              <span className="avatar-fallback hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600">
                                {((application.seeker_id as any)?.name || 'C').charAt(0).toUpperCase()}
                              </span>
                            </>
                          );
                        }
                        return (
                          <span>{((application.seeker_id as any)?.name || 'C').charAt(0).toUpperCase()}</span>
                        );
                      })()}
                    </div>
                    
                    {/* Application Details - Simplified */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {(application.seeker_id as any)?.name || 'Unknown Candidate'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(application.job_id as any)?.title || 'Job'}{' '}
                        {((application.job_id as any)?.company_name || (application.job_id as any)?.company) && (
                          <>at {(application.job_id as any)?.company_name || (application.job_id as any)?.company}</>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                    {/* Application Status */}
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                    </span>
                    
                    {/* View Details Button */}
                    <button 
                      onClick={() => navigate(`/employer/applications/${application._id}`)}
                      className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4 inline mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
