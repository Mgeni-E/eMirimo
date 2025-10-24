import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  UserIcon,
  ArrowLeftIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeIcon,
  EyeIcon,
  EditIcon
} from '../../components/icons';
import { api } from '../../lib/api';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: 'seeker' | 'employer' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
  profileComplete: boolean;
  phone?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  linkedin?: string;
  website?: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
  profile_image?: string;
  is_verified?: boolean;
  status_reason?: string;
}

interface JobApplication {
  id: string;
  job_title: string;
  company_name: string;
  status: string;
  applied_at: string;
}

interface JobPosting {
  id: string;
  title: string;
  status: string;
  created_at: string;
  applications_count: number;
}

export function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadUserDetail();
    }
  }, [id]);

  const loadUserDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading user detail for ID:', id);
      const response = await api.get(`/admin/users/${id}`);
      console.log('User detail response:', response.data);
      setUser(response.data.user);
      
      // Load additional data based on user role
      if (response.data.user.role === 'seeker') {
        const applicationsResponse = await api.get(`/admin/users/${id}/applications`);
        setApplications(applicationsResponse.data.applications || []);
      } else if (response.data.user.role === 'employer') {
        const jobsResponse = await api.get(`/admin/users/${id}/jobs`);
        setJobPostings(jobsResponse.data.jobs || []);
      }
    } catch (error: any) {
      console.error('Failed to load user detail:', error);
      setError('Failed to load user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (status: 'active' | 'inactive', reason?: string) => {
    if (!user) return;
    
    setActionLoading('status');
    try {
      const response = await api.patch(`/admin/users/${user.id}`, { 
        status, 
        reason 
      });
      
      if (response.data.success) {
        setUser(prev => prev ? { ...prev, status } : null);
        console.log('User status updated successfully');
      }
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      setError('Failed to update user status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async () => {
    if (!user) return;
    
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return;
    }

    setActionLoading('delete');
    try {
      const response = await api.delete(`/admin/users/${user.id}`);
      
      if (response.data.success) {
        navigate('/admin/users');
      }
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      setError('Failed to delete user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'employer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'seeker': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'inactive': return <XCircleIcon className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error || 'User not found'}</p>
          <button 
            onClick={() => navigate('/admin/users')}
            className="mt-4 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            ← Back to Users
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/admin/users')}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage user account and permissions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {user.status === 'active' ? (
              <button 
                onClick={() => updateUserStatus('inactive')}
                disabled={actionLoading === 'status'}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === 'status' ? 'Updating...' : 'Deactivate'}
              </button>
            ) : (
              <button 
                onClick={() => updateUserStatus('active')}
                disabled={actionLoading === 'status'}
                className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === 'status' ? 'Updating...' : 'Activate'}
              </button>
            )}
            
            <button 
              onClick={deleteUser}
              disabled={actionLoading === 'delete'}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
            >
              {actionLoading === 'delete' ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              {user.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role === 'seeker' ? 'Job Seeker' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {getStatusIcon(user.status)}
                  <span className="ml-1">{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <MailIcon className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{user.address}, {user.city}, {user.country}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center space-x-2">
                    <GlobeIcon className="w-4 h-4" />
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                      {user.website}
                    </a>
                  </div>
                )}
                {user.linkedin && (
                  <div className="flex items-center space-x-2">
                    <GlobeIcon className="w-4 h-4" />
                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
              
              {user.bio && (
                <div className="mt-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company Information (for employers) */}
        {user.role === 'employer' && (user.company_name || user.industry) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {user.company_name && (
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Company:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{user.company_name}</span>
                </div>
              )}
              {user.industry && (
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Industry:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{user.industry}</span>
                </div>
              )}
              {user.company_size && (
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Size:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{user.company_size}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Last Login:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Profile Complete:</span>
              <span className={`font-medium ${user.profileComplete ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {user.profileComplete ? 'Yes' : 'No'}
              </span>
            </div>
            {user.is_verified !== undefined && (
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Verified:</span>
                <span className={`font-medium ${user.is_verified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {user.is_verified ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          </div>
          {user.status_reason && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                <strong>Status Reason:</strong> {user.status_reason}
              </p>
            </div>
          )}
        </div>

        {/* Job Applications (for seekers) */}
        {user.role === 'seeker' && applications.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Applications ({applications.length})</h3>
            <div className="space-y-3">
              {applications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{application.job_title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{application.company_name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      application.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(application.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Postings (for employers) */}
        {user.role === 'employer' && jobPostings.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Postings ({jobPostings.length})</h3>
            <div className="space-y-3">
              {jobPostings.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.applications_count} applications</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      job.status === 'closed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
