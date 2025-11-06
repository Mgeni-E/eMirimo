import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { api } from '../../lib/api';
import { 
  ApplicationsIcon, 
  FilterIcon,
  SearchIcon,
  EyeIcon,
  UserIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  CalendarIcon
} from '../../components/icons';

interface Application {
  _id: string;
  id?: string;
  seeker_id: {
    _id: string;
    name: string;
    email: string;
    skills?: any[];
    work_experience?: any[];
    education?: any[];
  };
  job_id: {
    _id: string;
    title: string;
    company_name?: string;
    location: string | {
      city?: string;
      country?: string;
    };
  };
  employer_id: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'applied' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'interview_completed' | 'offer_made' | 'hired' | 'rejected' | 'withdrawn';
  applied_at: string;
  cover_letter?: string;
  resume_url?: string;
  company_name?: string;
}

interface ApplicationStats {
  total: number;
  applied: number;
  under_review: number;
  shortlisted: number;
  interviews: number;
  offers: number;
  hired: number;
  rejected: number;
}

export function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    applied: 0,
    under_review: 0,
    shortlisted: 0,
    interviews: 0,
    offers: 0,
    hired: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await api.get('/admin/applications', { params });
      const data = response.data?.success 
        ? (response.data.applications || [])
        : (Array.isArray(response.data) ? response.data : []);
      
      setApplications(data);
      
      // Calculate stats
      const stats = {
        total: data.length,
        applied: data.filter((app: Application) => app.status === 'applied').length,
        under_review: data.filter((app: Application) => app.status === 'under_review').length,
        shortlisted: data.filter((app: Application) => app.status === 'shortlisted').length,
        interviews: data.filter((app: Application) => app.status === 'interview_scheduled' || app.status === 'interview_completed').length,
        offers: data.filter((app: Application) => app.status === 'offer_made').length,
        hired: data.filter((app: Application) => app.status === 'hired').length,
        rejected: data.filter((app: Application) => app.status === 'rejected').length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setApplications([]);
      setStats({
        total: 0,
        applied: 0,
        under_review: 0,
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

  const formatLocation = (location: string | { city?: string; country?: string } | undefined): string => {
    if (!location) return 'Remote';
    if (typeof location === 'string') return location;
    const city = location.city || '';
    const country = location.country || '';
    return city && country ? `${city}, ${country}` : city || country || 'Remote';
  };

  const filteredApplications = applications.filter(app => {
    const seekerName = (app.seeker_id as any)?.name || '';
    const jobTitle = (app.job_id as any)?.title || '';
    const companyName = app.company_name || (app.job_id as any)?.company_name || '';
    const matchesSearch = seekerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         companyName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
              All Applications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage all job applications across the platform
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
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.applied}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">New Applications</div>
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
                placeholder="Search by candidate name, job title, or company..."
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
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Applications ({filteredApplications.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <ApplicationsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Applications will appear here when candidates apply to jobs'
                }
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application._id || application.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Candidate Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {(application.seeker_id as any)?.profile_image ? (
                        <img 
                          src={(application.seeker_id as any).profile_image} 
                          alt={(application.seeker_id as any)?.name || 'Candidate'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        ((application.seeker_id as any)?.name || 'C').charAt(0).toUpperCase()
                      )}
                    </div>
                    
                    {/* Application Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {(application.seeker_id as any)?.name || 'Unknown Candidate'}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {formatStatus(application.status)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Applied for <span className="font-medium">{(application.job_id as any)?.title || 'Job'}</span> at {application.company_name || (application.job_id as any)?.company_name || 'Company'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-4 h-4" />
                          {(application.employer_id as any)?.name || 'Employer'}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          Applied {new Date(application.applied_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {formatLocation((application.job_id as any)?.location)}
                        </span>
                      </div>
                      
                      {/* Skills */}
                      {(application.seeker_id as any)?.skills && ((application.seeker_id as any).skills || []).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {((application.seeker_id as any).skills || []).slice(0, 5).map((skill: any, index: number) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                            >
                              {typeof skill === 'string' ? skill : skill?.name || skill}
                            </span>
                          ))}
                          {((application.seeker_id as any).skills || []).length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                              +{((application.seeker_id as any).skills || []).length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/admin/users/${(application.seeker_id as any)?._id || application.seeker_id}`}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                    >
                      <UserIcon className="w-4 h-4" />
                      View Candidate
                    </Link>
                    <Link
                      to={`/admin/jobs/${(application.job_id as any)?._id || application.job_id}`}
                      className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Job
                    </Link>
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

