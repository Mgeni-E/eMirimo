import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { api } from '../../lib/api';
import { 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  VideoIcon,
  PhoneIcon,
  MapPinIcon,
  CheckIcon,
  XIcon,
  PlusIcon,
  EditIcon,
  TrashIcon
} from '../../components/icons';

interface Interview {
  id: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    experience: string;
    skills: string[];
  };
  job: {
    id: string;
    title: string;
    department: string;
  };
  interviewer: {
    id: string;
    name: string;
    email: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // in minutes
  type: 'video' | 'phone' | 'in-person';
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: string;
  rating?: number;
}

interface InterviewStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  today: number;
  thisWeek: number;
}

export function EmployerInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<InterviewStats>({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
    thisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [showNewInterviewModal, setShowNewInterviewModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const response = await api.get('/employer/interviews');
      const data = response.data || [];
      
      setInterviews(data);
      
      // Calculate stats
      const today = new Date();
      const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const stats = {
        total: data.length,
        scheduled: data.filter((interview: Interview) => interview.status === 'scheduled').length,
        completed: data.filter((interview: Interview) => interview.status === 'completed').length,
        cancelled: data.filter((interview: Interview) => interview.status === 'cancelled').length,
        today: data.filter((interview: Interview) => {
          const interviewDate = new Date(interview.scheduledDate);
          return interviewDate.toDateString() === today.toDateString();
        }).length,
        thisWeek: data.filter((interview: Interview) => {
          const interviewDate = new Date(interview.scheduledDate);
          return interviewDate >= today && interviewDate <= thisWeek;
        }).length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'rescheduled': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoIcon className="w-4 h-4" />;
      case 'phone': return <PhoneIcon className="w-4 h-4" />;
      case 'in-person': return <MapPinIcon className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getUpcomingInterviews = () => {
    const now = new Date();
    return interviews
      .filter(interview => {
        const interviewDateTime = new Date(`${interview.scheduledDate}T${interview.scheduledTime}`);
        return interviewDateTime > now && interview.status === 'scheduled';
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
        const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const getTodayInterviews = () => {
    const today = new Date().toDateString();
    return interviews.filter(interview => 
      new Date(interview.scheduledDate).toDateString() === today
    );
  };

  const updateInterviewStatus = async (interviewId: string, newStatus: string) => {
    try {
      await api.put(`/employer/interviews/${interviewId}/status`, { status: newStatus });
      setInterviews(prev => prev.map(interview => 
        interview.id === interviewId ? { ...interview, status: newStatus as any } : interview
      ));
      loadInterviews(); // Refresh stats
    } catch (error) {
      console.error('Failed to update interview status:', error);
    }
  };

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
              Interview Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Schedule and manage candidate interviews
            </p>
          </div>
          <button
            onClick={() => setShowNewInterviewModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Interviews</div>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.scheduled}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Scheduled</div>
            </div>
            <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.today}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
            </div>
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.thisWeek}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Interviews */}
      {getTodayInterviews().length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Interviews ({getTodayInterviews().length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {getTodayInterviews().map((interview) => (
              <div key={interview.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {interview.candidate.avatar ? (
                        <img 
                          src={interview.candidate.avatar} 
                          alt={interview.candidate.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        interview.candidate.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {interview.candidate.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {interview.job.title} • {interview.scheduledTime} ({interview.duration} min)
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getTypeIcon(interview.type)}
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {interview.type === 'in-person' ? 'In-Person' : interview.type}
                        </span>
                        {interview.location && (
                          <>
                            <span>•</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{interview.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                      {interview.status}
                    </span>
                    {interview.status === 'scheduled' && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => updateInterviewStatus(interview.id, 'completed')}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                        <button 
                          onClick={() => updateInterviewStatus(interview.id, 'cancelled')}
                          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Interviews */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Interviews ({getUpcomingInterviews().length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {getUpcomingInterviews().length === 0 ? (
            <div className="p-8 text-center">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming interviews</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Schedule interviews with shortlisted candidates
              </p>
              <button
                onClick={() => setShowNewInterviewModal(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Schedule Interview
              </button>
            </div>
          ) : (
            getUpcomingInterviews().map((interview) => (
              <div key={interview.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {interview.candidate.avatar ? (
                        <img 
                          src={interview.candidate.avatar} 
                          alt={interview.candidate.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        interview.candidate.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {interview.candidate.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {interview.job.title} • {new Date(interview.scheduledDate).toLocaleDateString()} at {interview.scheduledTime}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getTypeIcon(interview.type)}
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {interview.type === 'in-person' ? 'In-Person' : interview.type}
                        </span>
                        <span>•</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {interview.duration} minutes
                        </span>
                        {interview.location && (
                          <>
                            <span>•</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{interview.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                      {interview.status}
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedInterview(interview)}
                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateInterviewStatus(interview.id, 'cancelled')}
                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
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
