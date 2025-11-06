import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  JobsIcon, 
  PlusIcon, 
  SearchIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  ClockIcon,
  UsersIcon,
} from '../../components/icons';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'draft' | 'published' | 'paused' | 'closed';
  salary?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  applicationDeadline?: string;
  applicationsCount: number;
  views: number;
}

export function MyJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    type: 'full-time',
    skills: [] as string[],
    location: '',
    salary: '',
    job_category: '',
    experience_level: '',
    expiry_date: '',
    work_location: 'onsite' as 'remote' | 'hybrid' | 'onsite',
    requirements: [] as string[],
    benefits: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editJobData, setEditJobData] = useState({
    title: '',
    description: '',
    type: 'full-time',
    skills: [] as string[],
    location: '',
    salary: '',
    job_category: '',
    experience_level: '',
    expiry_date: '',
    work_location: 'onsite' as 'remote' | 'hybrid' | 'onsite',
    requirements: [] as string[],
    benefits: [] as string[]
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/jobs/my/jobs');
      const data = response.data || [];
      
      // Transform backend data to match frontend interface
      const transformedJobs: Job[] = data.map((job: any) => ({
        id: job._id,
        title: job.title,
        company: job.company_name || job.employer_id?.name || 'Your Company',
        location: typeof job.location === 'string' ? job.location : `${job.location?.city || ''}${job.location?.city && job.location?.country ? ', ' : ''}${job.location?.country || ''}`,
        type: job.job_type || job.type,
        status: job.is_active === false ? 'draft' : (job.status === 'active' ? 'published' : job.status || 'published'),
        salary: job.salary,
        description: job.description,
        requirements: Array.isArray(job.requirements) ? job.requirements.map((r: any) => typeof r === 'string' ? r : r.description) : [],
        benefits: Array.isArray(job.benefits) ? job.benefits.map((b: any) => typeof b === 'string' ? b : b.name) : [],
        postedDate: job.created_at || job.createdAt,
        applicationDeadline: job.expiry_date || job.application_deadline,
        applicationsCount: job.applications_count || job.applicationsCount || 0,
        views: job.views_count || job.views || 0
      }));
      
      setJobs(transformedJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (job: Job) => {
    try {
      // Fetch full job details from backend to get all fields
      const response = await api.get(`/jobs/${job.id}`);
      const jobData = response.data;
      
      setEditingJob(job);
      
      // Format salary for display
      let salaryStr = '';
      if (jobData.salary) {
        if (typeof jobData.salary === 'string') {
          salaryStr = jobData.salary;
        } else if (typeof jobData.salary === 'object' && jobData.salary.min && jobData.salary.max) {
          salaryStr = `${jobData.salary.min} - ${jobData.salary.max} ${jobData.salary.currency || 'RWF'}`;
        }
      }
      
      // Format expiry date
      let expiryDate = '';
      if (jobData.expiry_date || jobData.application_deadline) {
        const date = new Date(jobData.expiry_date || jobData.application_deadline);
        if (!isNaN(date.getTime())) {
          expiryDate = date.toISOString().split('T')[0];
        }
      }
      
      // Format location
      let locationStr = '';
      if (jobData.location) {
        if (typeof jobData.location === 'string') {
          locationStr = jobData.location;
        } else if (typeof jobData.location === 'object') {
          const parts: string[] = [];
          if (jobData.location.city) parts.push(jobData.location.city);
          if (jobData.location.country) parts.push(jobData.location.country);
          locationStr = parts.join(', ') || jobData.location.address || '';
        }
      }
      
      setEditJobData({
        title: jobData.title || '',
        description: jobData.description || '',
        type: jobData.job_type || jobData.type || 'full-time',
        skills: [],
        location: locationStr,
        salary: salaryStr,
        job_category: jobData.category || jobData.job_category || '',
        experience_level: jobData.experience_level || '',
        expiry_date: expiryDate,
        work_location: jobData.work_location || 'onsite',
        requirements: [],
        benefits: []
      });
      setShowEditModal(true);
      setError(null);
      setSuccess(false);
    } catch (err: any) {
      console.error('Failed to load job details:', err);
      setError('Failed to load job details. Please try again.');
    }
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;
    
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Prepare job data for submission
      const jobData: any = {
        ...editJobData,
        // Convert expiry_date to application_deadline if provided
        application_deadline: editJobData.expiry_date ? new Date(editJobData.expiry_date).toISOString() : undefined,
        // Ensure work_location is set
        work_location: editJobData.work_location || 'onsite'
      };
      
      // Remove empty arrays and empty strings
      if (jobData.skills.length === 0) delete jobData.skills;
      if (jobData.requirements.length === 0) delete jobData.requirements;
      if (jobData.benefits.length === 0) delete jobData.benefits;
      if (!jobData.salary) delete jobData.salary;
      
      const response = await api.put(`/jobs/${editingJob.id}`, jobData);
      
      // Success
      setSuccess(true);
      setShowEditModal(false);
      setEditingJob(null);
      
      // Refresh jobs list after a short delay
      setTimeout(() => {
        loadJobs();
        setSuccess(false);
      }, 500);
    } catch (err: any) {
      console.error('Failed to update job:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to update job. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateJob = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Prepare job data for submission
      const jobData: any = {
        ...newJob,
        // Convert expiry_date to application_deadline if provided
        application_deadline: newJob.expiry_date ? new Date(newJob.expiry_date).toISOString() : undefined,
        // Ensure work_location is set
        work_location: newJob.work_location || 'onsite'
      };
      
      // Remove empty arrays and empty strings
      if (jobData.skills.length === 0) delete jobData.skills;
      if (jobData.requirements.length === 0) delete jobData.requirements;
      if (jobData.benefits.length === 0) delete jobData.benefits;
      if (!jobData.salary) delete jobData.salary;
      
      const response = await api.post('/jobs', jobData);
      
      // Success
      setSuccess(true);
      setShowCreateModal(false);
      setNewJob({
        title: '',
        description: '',
        type: 'full-time',
        skills: [],
        location: '',
        salary: '',
        job_category: '',
        experience_level: '',
        expiry_date: '',
        work_location: 'onsite',
        requirements: [],
        benefits: []
      });
      
      // Refresh jobs list after a short delay
      setTimeout(() => {
        loadJobs();
        setSuccess(false);
      }, 500);
    } catch (err: any) {
      console.error('Failed to create job:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to create job. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'paused': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'part-time': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'contract': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'internship': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesType = filterType === 'all' || job.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const publishedJobs = jobs.filter(job => job.status === 'published');
  const totalApplications = jobs.reduce((sum, job) => sum + job.applicationsCount, 0);
  const totalViews = jobs.reduce((sum, job) => sum + job.views, 0);

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Jobs</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your job postings and track their performance</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Post New Job
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <JobsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{publishedJobs.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalApplications}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Applications</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalViews}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <EyeIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List - Small Square Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredJobs.map((job) => (
          <div 
            key={job.id} 
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow duration-200 flex flex-col"
          >
            {/* Job Title */}
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-[3rem]">
              {job.title}
            </h3>
            
            {/* Company */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="truncate">{job.company}</span>
            </div>
            
            {/* Application Deadline */}
            {job.applicationDeadline && (() => {
              const deadlineDate = new Date(job.applicationDeadline);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              deadlineDate.setHours(0, 0, 0, 0);
              const isPassed = deadlineDate < today;
              
              return (
                <div className={`flex items-center text-sm mb-3 ${isPassed 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
                }`}>
                  <ClockIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span className="flex items-center gap-2">
                    <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
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
              {/* View Icon */}
              <Link
                to={`/jobs/${job.id}`}
                className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="View Details"
              >
                <EyeIcon className="w-5 h-5" />
              </Link>
              
              {/* Edit Icon */}
              <button 
                onClick={() => handleEditClick(job)}
                className="p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                title="Edit Job"
              >
                <EditIcon className="w-5 h-5" />
              </button>
              
              {/* Deactivate/Activate Icon */}
              {job.status === 'published' ? (
                <button 
                  onClick={() => {/* TODO: Implement pause */}}
                  className="p-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                  title="Pause"
                >
                  <ClockIcon className="w-5 h-5" />
                </button>
              ) : job.status === 'paused' ? (
                <button 
                  onClick={() => {/* TODO: Implement resume */}}
                  className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Resume"
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
              ) : null}
              
              {/* Delete Icon */}
              <button 
                onClick={() => {/* TODO: Implement delete */}}
                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Post New Job</h3>
              <p className="text-gray-600 dark:text-gray-400">Create a compelling job posting to attract top talent</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Type *
                  </label>
                  <select
                    value={newJob.type}
                    onChange={(e) => setNewJob(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Kigali, Rwanda"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={newJob.salary}
                    onChange={(e) => setNewJob(prev => ({ ...prev, salary: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 2,500,000 - 3,500,000 RWF"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Category *
                  </label>
                  <select
                    value={newJob.job_category}
                    onChange={(e) => setNewJob(prev => ({ ...prev, job_category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select category</option>
                    <option value="technology">Technology</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                    <option value="hr">Human Resources</option>
                    <option value="operations">Operations</option>
                    <option value="design">Design</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience Level *
                  </label>
                  <select
                    value={newJob.experience_level}
                    onChange={(e) => setNewJob(prev => ({ ...prev, experience_level: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select level</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior Level (6-10 years)</option>
                    <option value="lead">Lead/Principal (10+ years)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={newJob.expiry_date}
                    onChange={(e) => setNewJob(prev => ({ ...prev, expiry_date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Work Location *
                  </label>
                  <select
                    value={newJob.work_location}
                    onChange={(e) => setNewJob(prev => ({ ...prev, work_location: e.target.value as 'remote' | 'hybrid' | 'onsite' }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="onsite">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              
              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Describe the role, responsibilities, required skills, requirements, and benefits..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                  <p className="text-green-800 dark:text-green-300 text-sm">Job posted successfully!</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowCreateModal(false);
                    setError(null);
                    setSuccess(false);
                  }}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateJob}
                  disabled={submitting || !newJob.title || !newJob.description || !newJob.location || !newJob.job_category || !newJob.experience_level}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Post Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Edit Job</h3>
              <p className="text-gray-600 dark:text-gray-400">Update job posting details</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={editJobData.title}
                    onChange={(e) => setEditJobData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Type *
                  </label>
                  <select
                    value={editJobData.type}
                    onChange={(e) => setEditJobData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={editJobData.location}
                    onChange={(e) => setEditJobData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Kigali, Rwanda"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={editJobData.salary}
                    onChange={(e) => setEditJobData(prev => ({ ...prev, salary: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 2,500,000 - 3,500,000 RWF"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Category *
                  </label>
                  <select
                    value={editJobData.job_category}
                    onChange={(e) => setEditJobData(prev => ({ ...prev, job_category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select category</option>
                    <option value="technology">Technology</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                    <option value="hr">Human Resources</option>
                    <option value="operations">Operations</option>
                    <option value="design">Design</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience Level *
                  </label>
                  <select
                    value={editJobData.experience_level}
                    onChange={(e) => setEditJobData(prev => ({ ...prev, experience_level: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select level</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior Level (6-10 years)</option>
                    <option value="lead">Lead/Principal (10+ years)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={editJobData.expiry_date}
                    onChange={(e) => setEditJobData(prev => ({ ...prev, expiry_date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Work Location *
                  </label>
                  <select
                    value={editJobData.work_location}
                    onChange={(e) => setEditJobData(prev => ({ ...prev, work_location: e.target.value as 'remote' | 'hybrid' | 'onsite' }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="onsite">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              
              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={editJobData.description}
                  onChange={(e) => setEditJobData(prev => ({ ...prev, description: e.target.value }))}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Describe the role, responsibilities, required skills, requirements, and benefits..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                  <p className="text-green-800 dark:text-green-300 text-sm">Job updated successfully!</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingJob(null);
                    setError(null);
                    setSuccess(false);
                  }}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateJob}
                  disabled={submitting || !editJobData.title || !editJobData.description || !editJobData.location || !editJobData.job_category || !editJobData.experience_level}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Updating...' : 'Update Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
