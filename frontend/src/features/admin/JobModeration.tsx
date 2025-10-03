import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  JobsIcon, 
  SearchIcon, 
  FilterIcon,
  EyeIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  StarIcon,
  UsersIcon
} from '../../components/icons';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'pending' | 'approved' | 'rejected';
  postedBy: string;
  postedDate: string;
  salary?: string;
  description: string;
}

export function JobModeration() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would fetch from admin API
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          company: 'TechCorp',
          location: 'Remote',
          type: 'full-time',
          status: 'pending',
          postedBy: 'John Smith',
          postedDate: '2024-01-20',
          salary: '$80,000 - $120,000',
          description: 'We are looking for a senior software engineer to join our team...'
        },
        {
          id: '2',
          title: 'Frontend Developer',
          company: 'StartupXYZ',
          location: 'Kigali, Rwanda',
          type: 'full-time',
          status: 'approved',
          postedBy: 'Jane Doe',
          postedDate: '2024-01-18',
          salary: '$50,000 - $70,000',
          description: 'Join our growing team as a frontend developer...'
        },
        {
          id: '3',
          title: 'Marketing Intern',
          company: 'MarketingPro',
          location: 'Remote',
          type: 'internship',
          status: 'rejected',
          postedBy: 'Mike Johnson',
          postedDate: '2024-01-15',
          description: 'Looking for a marketing intern to help with our campaigns...'
        },
        {
          id: '4',
          title: 'DevOps Engineer',
          company: 'CloudTech',
          location: 'Remote',
          type: 'contract',
          status: 'pending',
          postedBy: 'Sarah Wilson',
          postedDate: '2024-01-22',
          salary: '$60,000 - $90,000',
          description: 'We need a DevOps engineer to help with our infrastructure...'
        }
      ];
      setJobs(mockJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
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

  const handleApprove = (jobId: string) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: 'approved' as const } : job
    ));
  };

  const handleReject = (jobId: string) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: 'rejected' as const } : job
    ));
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesType = filterType === 'all' || job.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Job Moderation</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and approve job postings from employers</p>
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
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {jobs.filter(j => j.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {jobs.filter(j => j.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {jobs.filter(j => j.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
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
                placeholder="Search jobs by title or company..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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

      {/* Jobs List */}
      <div className="space-y-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{job.company} • {job.location}</p>
                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(job.type)}`}>
                        {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                      {job.salary && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">{job.salary}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Posted by {job.postedBy} on {new Date(job.postedDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View Details
                </button>
                
                {job.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(job.id)}
                      className="flex items-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(job.id)}
                      className="flex items-center px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <XIcon className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
