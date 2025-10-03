import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  CalendarIcon, 
  ClockIcon, 
  UsersIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  EditIcon,
  CheckIcon,
  XIcon,
  VideoIcon,
  MapPinIcon
} from '../../components/icons';

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'phone' | 'video' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  location?: string;
  meetingLink?: string;
  interviewer: string;
  notes?: string;
  rating?: number;
}

export function Interviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would fetch from employer API
      const mockInterviews: Interview[] = [
        {
          id: '1',
          candidateName: 'Alice Johnson',
          candidateEmail: 'alice@example.com',
          jobTitle: 'Senior Software Engineer',
          date: '2024-01-25',
          time: '10:00',
          duration: 60,
          type: 'video',
          status: 'scheduled',
          meetingLink: 'https://zoom.us/j/123456789',
          interviewer: 'John Smith (HR Manager)',
          notes: 'Initial screening interview'
        },
        {
          id: '2',
          candidateName: 'Bob Smith',
          candidateEmail: 'bob@example.com',
          jobTitle: 'Frontend Developer Intern',
          date: '2024-01-26',
          time: '14:00',
          duration: 45,
          type: 'phone',
          status: 'scheduled',
          interviewer: 'Jane Doe (Tech Lead)',
          notes: 'Technical interview'
        },
        {
          id: '3',
          candidateName: 'Carol Williams',
          candidateEmail: 'carol@example.com',
          jobTitle: 'Senior Software Engineer',
          date: '2024-01-20',
          time: '16:00',
          duration: 90,
          type: 'in-person',
          status: 'completed',
          location: 'TechCorp Office, Kigali',
          interviewer: 'John Smith (HR Manager) & Jane Doe (Tech Lead)',
          notes: 'Final interview with panel',
          rating: 4.5
        },
        {
          id: '4',
          candidateName: 'David Brown',
          candidateEmail: 'david@example.com',
          jobTitle: 'DevOps Engineer',
          date: '2024-01-28',
          time: '11:00',
          duration: 75,
          type: 'video',
          status: 'scheduled',
          meetingLink: 'https://teams.microsoft.com/l/meetup-join/123',
          interviewer: 'Mike Johnson (DevOps Lead)',
          notes: 'Technical assessment interview'
        },
        {
          id: '5',
          candidateName: 'Eve Davis',
          candidateEmail: 'eve@example.com',
          jobTitle: 'Marketing Manager',
          date: '2024-01-15',
          time: '15:00',
          duration: 60,
          type: 'in-person',
          status: 'completed',
          location: 'TechCorp Office, Kigali',
          interviewer: 'Sarah Wilson (Marketing Director)',
          notes: 'Final interview',
          rating: 4.8
        }
      ];
      setInterviews(mockInterviews);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'phone': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'video': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-person': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <UsersIcon className="w-4 h-4" />;
      case 'video': return <VideoIcon className="w-4 h-4" />;
      case 'in-person': return <MapPinIcon className="w-4 h-4" />;
      default: return <UsersIcon className="w-4 h-4" />;
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || interview.status === filterStatus;
    const matchesType = filterType === 'all' || interview.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const upcomingInterviews = interviews.filter(interview => 
    interview.status === 'scheduled' && new Date(interview.date + 'T' + interview.time) > new Date()
  );
  const completedInterviews = interviews.filter(interview => interview.status === 'completed');
  const todayInterviews = interviews.filter(interview => {
    const today = new Date().toISOString().split('T')[0];
    return interview.date === today && interview.status === 'scheduled';
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Interviews</h1>
            <p className="text-gray-600 dark:text-gray-400">Schedule and manage candidate interviews</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{interviews.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Interviews</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingInterviews.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{todayInterviews.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedInterviews.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
                placeholder="Search interviews by candidate name or job title..."
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
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="phone">Phone</option>
              <option value="video">Video</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interviews List */}
      <div className="space-y-6">
        {filteredInterviews.map((interview) => (
          <div key={interview.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {interview.candidateName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">{interview.candidateEmail}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Position: {interview.jobTitle}</p>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(interview.status)}`}>
                          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(interview.type)}`}>
                          {interview.type.charAt(0).toUpperCase() + interview.type.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {new Date(interview.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {interview.time} ({interview.duration} min)
                    </div>
                    <div className="flex items-center">
                      {getTypeIcon(interview.type)}
                      <span className="ml-1">{interview.interviewer}</span>
                    </div>
                  </div>
                  
                  {interview.location && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {interview.location}
                    </div>
                  )}
                  
                  {interview.meetingLink && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Meeting Link:</strong> {interview.meetingLink}
                    </div>
                  )}
                  
                  {interview.notes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      <strong>Notes:</strong> {interview.notes}
                    </p>
                  )}
                  
                  {interview.rating && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <strong>Rating:</strong> {interview.rating}/5.0
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View Details
                </button>
                
                {interview.status === 'scheduled' && (
                  <>
                    <button className="flex items-center px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                      <EditIcon className="w-4 h-4 mr-1" />
                      Reschedule
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Complete
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                      <XIcon className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </>
                )}
                
                {interview.status === 'completed' && (
                  <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                    <CheckIcon className="w-4 h-4 mr-1" />
                    View Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Interview Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule Interview</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Interview scheduling form would go here...</p>
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
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
