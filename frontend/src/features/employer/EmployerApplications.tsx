import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  ApplicationsIcon, 
  SearchIcon, 
  FilterIcon,
  EyeIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  MessageIcon
} from '../../components/icons';

interface Application {
  id: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'rejected' | 'hired';
  appliedDate: string;
  experience: string;
  skills: string[];
  coverLetter: string;
  resumeUrl: string;
  rating?: number;
  notes?: string;
}

export function EmployerApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterJob, setFilterJob] = useState<string>('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would fetch from employer API
      const mockApplications: Application[] = [
        {
          id: '1',
          jobTitle: 'Senior Software Engineer',
          applicantName: 'Alice Johnson',
          applicantEmail: 'alice@example.com',
          status: 'pending',
          appliedDate: '2024-01-22',
          experience: '5 years in software development',
          skills: ['React.js', 'Node.js', 'AWS', 'MongoDB'],
          coverLetter: 'I am excited to apply for the Senior Software Engineer position...',
          resumeUrl: '/resumes/alice-johnson.pdf',
          rating: 4.5
        },
        {
          id: '2',
          jobTitle: 'Frontend Developer Intern',
          applicantName: 'Bob Smith',
          applicantEmail: 'bob@example.com',
          status: 'shortlisted',
          appliedDate: '2024-01-21',
          experience: '1 year in web development',
          skills: ['HTML', 'CSS', 'JavaScript', 'React.js'],
          coverLetter: 'As a recent graduate with a passion for frontend development...',
          resumeUrl: '/resumes/bob-smith.pdf',
          rating: 4.0
        },
        {
          id: '3',
          jobTitle: 'Senior Software Engineer',
          applicantName: 'Carol Williams',
          applicantEmail: 'carol@example.com',
          status: 'interview',
          appliedDate: '2024-01-20',
          experience: '6 years in full-stack development',
          skills: ['Python', 'Django', 'React.js', 'PostgreSQL'],
          coverLetter: 'I have extensive experience in building scalable web applications...',
          resumeUrl: '/resumes/carol-williams.pdf',
          rating: 4.8
        },
        {
          id: '4',
          jobTitle: 'Frontend Developer Intern',
          applicantName: 'David Brown',
          applicantEmail: 'david@example.com',
          status: 'rejected',
          appliedDate: '2024-01-19',
          experience: '6 months in web development',
          skills: ['HTML', 'CSS', 'JavaScript'],
          coverLetter: 'I am a self-taught developer looking for my first professional opportunity...',
          resumeUrl: '/resumes/david-brown.pdf',
          rating: 3.2
        },
        {
          id: '5',
          jobTitle: 'DevOps Engineer',
          applicantName: 'Eve Davis',
          applicantEmail: 'eve@example.com',
          status: 'hired',
          appliedDate: '2024-01-18',
          experience: '4 years in DevOps and cloud infrastructure',
          skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'],
          coverLetter: 'I specialize in automating deployment pipelines and managing cloud infrastructure...',
          resumeUrl: '/resumes/eve-davis.pdf',
          rating: 4.9
        }
      ];
      setApplications(mockApplications);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'reviewed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'shortlisted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'interview': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'hired': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleStatusUpdate = (applicationId: string, newStatus: Application['status']) => {
    setApplications(applications.map(app => 
      app.id === applicationId ? { ...app, status: newStatus } : app
    ));
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || application.status === filterStatus;
    const matchesJob = filterJob === 'all' || application.jobTitle === filterJob;
    return matchesSearch && matchesStatus && matchesJob;
  });

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const shortlistedApplications = applications.filter(app => app.status === 'shortlisted');
  const interviewApplications = applications.filter(app => app.status === 'interview');
  const hiredApplications = applications.filter(app => app.status === 'hired');

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Applications</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and manage job applications from candidates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Applications</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <ApplicationsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{pendingApplications.length}</div>
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
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{shortlistedApplications.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Shortlisted</div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{hiredApplications.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hired</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                placeholder="Search applications by candidate name, job title, or skills..."
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
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
            
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Jobs</option>
              <option value="Senior Software Engineer">Senior Software Engineer</option>
              <option value="Frontend Developer Intern">Frontend Developer Intern</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {filteredApplications.map((application) => (
          <div key={application.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {application.applicantName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">{application.applicantEmail}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Applied for: {application.jobTitle}</p>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        {application.rating && (
                          <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{application.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Experience:</strong> {application.experience}
                  </p>
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {application.skills.map((skill, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Cover Letter:</strong> {application.coverLetter.substring(0, 150)}...
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Applied {new Date(application.appliedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View Resume
                </button>
                <button className="flex items-center px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  <MessageIcon className="w-4 h-4 mr-1" />
                  Contact
                </button>
                
                {application.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(application.id, 'shortlisted')}
                      className="flex items-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Shortlist
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(application.id, 'rejected')}
                      className="flex items-center px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <XIcon className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </>
                )}
                
                {application.status === 'shortlisted' && (
                  <button 
                    onClick={() => handleStatusUpdate(application.id, 'interview')}
                    className="flex items-center px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Schedule Interview
                  </button>
                )}
                
                {application.status === 'interview' && (
                  <button 
                    onClick={() => handleStatusUpdate(application.id, 'hired')}
                    className="flex items-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <CheckIcon className="w-4 h-4 mr-1" />
                    Hire
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
