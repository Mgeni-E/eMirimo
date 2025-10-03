import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  JobsIcon, 
  PlusIcon, 
  SearchIcon,
  FilterIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  UsersIcon,
  MapPinIcon
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

export function PostJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would fetch from employer API
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          company: 'TechCorp Rwanda',
          location: 'Kigali, Rwanda',
          type: 'full-time',
          status: 'published',
          salary: '2,500,000 - 3,500,000 RWF',
          description: 'We are looking for an experienced software engineer to join our growing team...',
          requirements: [
            '5+ years of software development experience',
            'Proficiency in React.js and Node.js',
            'Experience with cloud platforms (AWS, Azure)',
            'Strong problem-solving skills'
          ],
          benefits: [
            'Competitive salary',
            'Health insurance',
            'Flexible working hours',
            'Professional development budget'
          ],
          postedDate: '2024-01-20',
          applicationDeadline: '2024-02-20',
          applicationsCount: 23,
          views: 156
        },
        {
          id: '2',
          title: 'Frontend Developer Intern',
          company: 'TechCorp Rwanda',
          location: 'Remote',
          type: 'internship',
          status: 'published',
          salary: '500,000 - 800,000 RWF',
          description: 'Join our team as a frontend developer intern and gain hands-on experience...',
          requirements: [
            'Basic knowledge of HTML, CSS, JavaScript',
            'Familiarity with React.js preferred',
            'Strong communication skills',
            'Eagerness to learn'
          ],
          benefits: [
            'Mentorship program',
            'Certificate of completion',
            'Potential full-time offer',
            'Learning resources'
          ],
          postedDate: '2024-01-18',
          applicationDeadline: '2024-02-15',
          applicationsCount: 45,
          views: 234
        },
        {
          id: '3',
          title: 'DevOps Engineer',
          company: 'TechCorp Rwanda',
          location: 'Kigali, Rwanda',
          type: 'contract',
          status: 'draft',
          salary: '3,000,000 - 4,000,000 RWF',
          description: 'We need a DevOps engineer to help us scale our infrastructure...',
          requirements: [
            '3+ years of DevOps experience',
            'Experience with Docker and Kubernetes',
            'CI/CD pipeline setup',
            'AWS or Azure certification preferred'
          ],
          benefits: [
            'Competitive contract rate',
            'Flexible schedule',
            'Remote work options'
          ],
          postedDate: '2024-01-22',
          applicationsCount: 0,
          views: 0
        },
        {
          id: '4',
          title: 'Marketing Manager',
          company: 'TechCorp Rwanda',
          location: 'Kigali, Rwanda',
          type: 'full-time',
          status: 'closed',
          salary: '2,000,000 - 2,800,000 RWF',
          description: 'Lead our marketing efforts and drive brand awareness...',
          requirements: [
            'Bachelor\'s degree in Marketing or related field',
            '3+ years of marketing experience',
            'Digital marketing expertise',
            'Team leadership skills'
          ],
          benefits: [
            'Performance bonuses',
            'Health insurance',
            'Annual leave',
            'Professional development'
          ],
          postedDate: '2024-01-10',
          applicationDeadline: '2024-01-25',
          applicationsCount: 67,
          views: 345
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
  const draftJobs = jobs.filter(job => job.status === 'draft');
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Post Jobs</h1>
            <p className="text-gray-600 dark:text-gray-400">Create and manage job postings to attract top talent</p>
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
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Posted {new Date(job.postedDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        {job.applicationsCount} applications
                      </div>
                      <div className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {job.views} views
                      </div>
                    </div>
                    {job.applicationDeadline && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Application deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View
                </button>
                
                {job.status === 'draft' && (
                  <>
                    <button className="flex items-center px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                      <EditIcon className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Publish
                    </button>
                  </>
                )}
                
                {job.status === 'published' && (
                  <>
                    <button className="flex items-center px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                      <EditIcon className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Pause
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                      <XIcon className="w-4 h-4 mr-1" />
                      Close
                    </button>
                  </>
                )}
                
                <button className="flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Job Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Post New Job</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Job creation form would go here...</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              >
                Post Job
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
