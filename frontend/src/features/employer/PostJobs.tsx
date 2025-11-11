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
  XIcon,
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
    location: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'RWF',
    job_category: '',
    experience_level: '',
    expiry_date: '',
    work_location: 'onsite' as 'remote' | 'hybrid' | 'onsite',
    required_skills: [] as string[],
    key_responsibilities: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [editJobData, setEditJobData] = useState({
    title: '',
    description: '',
    type: 'full-time',
    location: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'RWF',
    job_category: '',
    experience_level: '',
    expiry_date: '',
    work_location: 'onsite' as 'remote' | 'hybrid' | 'onsite',
    required_skills: [] as string[],
    key_responsibilities: [] as string[],
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
      
      // Extract skills from required_skills and preferred_skills
      const allSkills: string[] = [];
      if (jobData.required_skills && Array.isArray(jobData.required_skills)) {
        allSkills.push(...jobData.required_skills.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean));
      }
      if (jobData.preferred_skills && Array.isArray(jobData.preferred_skills)) {
        allSkills.push(...jobData.preferred_skills.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean));
      }
      
      // Extract requirements
      const requirements: string[] = [];
      if (jobData.requirements && Array.isArray(jobData.requirements)) {
        requirements.push(...jobData.requirements.map((r: any) => typeof r === 'string' ? r : r.description).filter(Boolean));
      }
      
      // Extract benefits
      const benefits: string[] = [];
      if (jobData.benefits && Array.isArray(jobData.benefits)) {
        benefits.push(...jobData.benefits.map((b: any) => typeof b === 'string' ? b : b.name).filter(Boolean));
      }
      
      // Parse salary
      let salaryMin = '';
      let salaryMax = '';
      let salaryCurrency = 'RWF';
      if (jobData.salary) {
        if (typeof jobData.salary === 'object') {
          salaryMin = jobData.salary.min?.toString() || '';
          salaryMax = jobData.salary.max?.toString() || '';
          salaryCurrency = jobData.salary.currency || 'RWF';
        }
      }
      
      setEditJobData({
        title: jobData.title || '',
        description: jobData.description || jobData.short_description || '',
        type: jobData.job_type || jobData.type || 'full-time',
        location: locationStr,
        salary_min: salaryMin,
        salary_max: salaryMax,
        salary_currency: salaryCurrency,
        job_category: jobData.category || jobData.job_category || '',
        experience_level: jobData.experience_level || '',
        expiry_date: expiryDate,
        work_location: jobData.work_location || 'onsite',
        required_skills: allSkills,
        key_responsibilities: jobData.key_responsibilities || [],
        requirements: requirements,
        benefits: benefits
      });
      setShowEditModal(true);
      setError(null);
      setSuccess(false);
    } catch (err: any) {
      console.error('Failed to load job details:', err);
      setError('Failed to load job details. Please try again.');
    }
  };

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    
    setDeletingJobId(jobToDelete.id);
    setError(null);
    
    try {
      await api.delete(`/jobs/${jobToDelete.id}`);
      
      // Remove job from list
      setJobs(prev => prev.filter(job => job.id !== jobToDelete.id));
      
      // Close confirmation dialog
      setShowDeleteConfirm(false);
      setJobToDelete(null);
      
      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to delete job:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to delete job. Please try again.';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeletingJobId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setJobToDelete(null);
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;
    
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Prepare job data for submission
      const jobData: any = {
        title: editJobData.title,
        description: editJobData.description,
        job_type: editJobData.type,
        location: editJobData.location,
        job_category: editJobData.job_category,
        experience_level: editJobData.experience_level,
        work_location: editJobData.work_location || 'onsite',
        application_deadline: editJobData.expiry_date ? new Date(editJobData.expiry_date).toISOString() : undefined,
        // Convert string arrays to required format for backend
        required_skills: editJobData.required_skills
          .filter(s => s.trim() !== '')
          .map(name => ({ name: name.trim(), level: 'intermediate', is_mandatory: true })),
        requirements: editJobData.requirements
          .filter(r => r.trim() !== '')
          .map(description => ({ type: 'other', description: description.trim(), is_mandatory: true })),
        benefits: editJobData.benefits
          .filter(b => b.trim() !== '')
          .map(name => ({ category: 'work_life', name: name.trim(), description: '' })),
      };
      
      // Handle salary
      if (editJobData.salary_min && editJobData.salary_max) {
        jobData.salary = {
          min: parseFloat(editJobData.salary_min.replace(/,/g, '')),
          max: parseFloat(editJobData.salary_max.replace(/,/g, '')),
          currency: editJobData.salary_currency || 'RWF',
          period: 'monthly'
        };
      }
      
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

  // Helper function to reset new job form
  const resetNewJobForm = () => ({
    title: '',
    description: '',
    type: 'full-time',
    location: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'RWF',
    job_category: '',
    experience_level: '',
    expiry_date: '',
    work_location: 'onsite' as 'remote' | 'hybrid' | 'onsite',
    required_skills: [] as string[],
    key_responsibilities: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[]
  });

  const handleCreateJob = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Prepare job data for submission
      const jobData: any = {
        title: newJob.title,
        description: newJob.description,
        job_type: newJob.type,
        location: newJob.location,
        job_category: newJob.job_category,
        experience_level: newJob.experience_level,
        work_location: newJob.work_location || 'onsite',
        application_deadline: newJob.expiry_date ? new Date(newJob.expiry_date).toISOString() : undefined,
        // Convert string arrays to required format for backend
        required_skills: newJob.required_skills
          .filter(s => s.trim() !== '')
          .map(name => ({ name: name.trim(), level: 'intermediate', is_mandatory: true })),
        requirements: newJob.requirements
          .filter(r => r.trim() !== '')
          .map(description => ({ type: 'other', description: description.trim(), is_mandatory: true })),
        benefits: newJob.benefits
          .filter(b => b.trim() !== '')
          .map(name => ({ category: 'work_life', name: name.trim(), description: '' })),
      };
      
      // Handle salary
      if (newJob.salary_min && newJob.salary_max) {
        jobData.salary = {
          min: parseFloat(newJob.salary_min.replace(/,/g, '')),
          max: parseFloat(newJob.salary_max.replace(/,/g, '')),
          currency: newJob.salary_currency || 'RWF',
          period: 'monthly'
        };
      }

      // Build description with structured content
      let fullDescription = newJob.description;

      if (newJob.key_responsibilities.length > 0) {
        fullDescription += '\n\n**Key Responsibilities:**\n';
        newJob.key_responsibilities.forEach(resp => {
          fullDescription += `- ${resp}\n`;
        });
      }

      if (newJob.required_skills.length > 0) {
        fullDescription += '\n\n**Required Skills:**\n';
        newJob.required_skills.forEach(skill => {
          fullDescription += `- ${skill}\n`;
        });
      }

      if (newJob.benefits.length > 0) {
        fullDescription += '\n\n**What We Offer:**\n';
        newJob.benefits.forEach(benefit => {
          fullDescription += `- ${benefit}\n`;
        });
      }

      jobData.description = fullDescription;
      
      const response = await api.post('/jobs', jobData);
      
      // Success
      setSuccess(true);
      setShowCreateModal(false);
      setNewJob(resetNewJobForm());
      
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
                <div className={`flex items-center text-sm mb-2 ${isPassed 
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
            
            {/* Stats Row */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <UsersIcon className="w-3.5 h-3.5" />
                <span>{job.applicationsCount || 0} {job.applicationsCount === 1 ? 'application' : 'applications'}</span>
              </div>
              <div className="flex items-center gap-1">
                <EyeIcon className="w-3.5 h-3.5" />
                <span>{job.views || 0} {job.views === 1 ? 'view' : 'views'}</span>
              </div>
            </div>
            
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
                onClick={() => handleDeleteClick(job)}
                disabled={deletingJobId === job.id}
                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Salary Range
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                      value={newJob.salary_min}
                      onChange={(e) => setNewJob(prev => ({ ...prev, salary_min: e.target.value }))}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="text"
                      value={newJob.salary_max}
                      onChange={(e) => setNewJob(prev => ({ ...prev, salary_max: e.target.value }))}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <select
                      value={newJob.salary_currency}
                      onChange={(e) => setNewJob(prev => ({ ...prev, salary_currency: e.target.value }))}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="RWF">RWF</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
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
                />
              </div>

              {/* Key Responsibilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Responsibilities (One per line - paste all at once)
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-2"
                  onBlur={(e) => {
                    const text = e.target.value;
                    if (text.trim()) {
                      const items = text.split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0);
                      setNewJob(prev => ({ ...prev, key_responsibilities: items }));
                    }
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {newJob.key_responsibilities.length} responsibility(ies) added
                </p>
                {newJob.key_responsibilities.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {newJob.key_responsibilities.map((resp, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded">
                        <span className="flex-1 text-gray-700 dark:text-gray-300">{resp}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newJob.key_responsibilities.filter((_, i) => i !== index);
                            setNewJob(prev => ({ ...prev, key_responsibilities: updated }));
                          }}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Required Skills (One per line - paste all at once)
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-2"
                  onBlur={(e) => {
                    const text = e.target.value;
                    if (text.trim()) {
                      const items = text.split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0);
                      setNewJob(prev => ({ ...prev, required_skills: items }));
                    }
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {newJob.required_skills.length} skill(s) added
                </p>
                {newJob.required_skills.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {newJob.required_skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded">
                        <span className="flex-1 text-gray-700 dark:text-gray-300">{skill}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newJob.required_skills.filter((_, i) => i !== index);
                            setNewJob(prev => ({ ...prev, required_skills: updated }));
                          }}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Requirements (Education, Experience, Certifications, Languages) - One per line
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-2"
                  onBlur={(e) => {
                    const text = e.target.value;
                    if (text.trim()) {
                      const items = text.split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0);
                      setNewJob(prev => ({ ...prev, requirements: items }));
                    }
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {newJob.requirements.length} requirement(s) added
                </p>
                {newJob.requirements.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {newJob.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded">
                        <span className="flex-1 text-gray-700 dark:text-gray-300">{req}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newJob.requirements.filter((_, i) => i !== index);
                            setNewJob(prev => ({ ...prev, requirements: updated }));
                          }}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Benefits & Perks (One per line - paste all at once)
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-2"
                  onBlur={(e) => {
                    const text = e.target.value;
                    if (text.trim()) {
                      const items = text.split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0);
                      setNewJob(prev => ({ ...prev, benefits: items }));
                    }
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {newJob.benefits.length} benefit(s)/offer(s) added
                </p>
                {newJob.benefits.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {newJob.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded">
                        <span className="flex-1 text-gray-700 dark:text-gray-300">{benefit}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newJob.benefits.filter((_, i) => i !== index);
                            setNewJob(prev => ({ ...prev, benefits: updated }));
                          }}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && jobToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Delete Job Posting
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <strong className="text-gray-900 dark:text-white">"{jobToDelete.title}"</strong>? This action cannot be undone.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={deletingJobId === jobToDelete.id}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deletingJobId === jobToDelete.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingJobId === jobToDelete.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
