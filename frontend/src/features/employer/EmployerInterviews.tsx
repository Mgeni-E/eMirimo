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
  applicationId?: string;
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

interface ShortlistedCandidate {
  applicationId: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  job: {
    id: string;
    title: string;
  };
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
  const [shortlistedCandidates, setShortlistedCandidates] = useState<ShortlistedCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: '60',
    type: 'video' as 'video' | 'phone' | 'in-person',
    location: '',
    meetingUrl: '',
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);

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

  const getAllScheduledInterviews = () => {
    return interviews
      .filter(interview => interview.status === 'scheduled')
      .sort((a, b) => {
        const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
        const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const getUpcomingInterviews = () => {
    const now = new Date();
    return getAllScheduledInterviews()
      .filter(interview => {
        const interviewDateTime = new Date(`${interview.scheduledDate}T${interview.scheduledTime}`);
        return interviewDateTime > now;
      });
  };

  const getTodayInterviews = () => {
    const today = new Date().toDateString();
    return interviews.filter(interview => 
      new Date(interview.scheduledDate).toDateString() === today
    );
  };

  const loadShortlistedCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const response = await api.get('/employer/interviews/shortlisted');
      setShortlistedCandidates(response.data || []);
    } catch (error) {
      console.error('Failed to load shortlisted candidates:', error);
      setError('Failed to load shortlisted candidates');
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleOpenScheduleModal = () => {
    setShowNewInterviewModal(true);
    loadShortlistedCandidates();
    setError(null);
    setScheduleForm({
      applicationId: '',
      scheduledDate: '',
      scheduledTime: '',
      duration: '60',
      type: 'video',
      location: '',
      meetingUrl: '',
      notes: ''
    });
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setScheduling(true);

    try {
      if (!scheduleForm.applicationId || !scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
        setError('Please fill in all required fields');
        setScheduling(false);
        return;
      }

      // Combine date and time into ISO string
      const scheduledAt = new Date(`${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}`).toISOString();

      await api.post('/employer/interviews/schedule', {
        applicationId: scheduleForm.applicationId,
        scheduledAt,
        duration: parseInt(scheduleForm.duration),
        type: scheduleForm.type,
        location: scheduleForm.location || undefined,
        meetingUrl: scheduleForm.meetingUrl || undefined,
        notes: scheduleForm.notes || undefined
      });

      setShowNewInterviewModal(false);
      loadInterviews(); // Refresh interviews list
    } catch (err: any) {
      console.error('Failed to schedule interview:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  const updateInterviewStatus = async (interviewId: string, applicationId: string, newStatus: string) => {
    try {
      await api.put(`/employer/interviews/${applicationId}/status`, { 
        interviewId,
        status: newStatus 
      });
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
            onClick={handleOpenScheduleModal}
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
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg relative overflow-hidden">
                      {(() => {
                        const profileImage = interview.candidate.avatar || interview.candidate.profile_image;
                        const hasValidImage = profileImage && typeof profileImage === 'string' && profileImage.trim() !== '' && (profileImage.startsWith('http://') || profileImage.startsWith('https://'));
                        
                        if (hasValidImage) {
                          return (
                            <>
                              <img 
                                src={profileImage} 
                                alt={interview.candidate.name}
                                className="w-12 h-12 rounded-full object-cover"
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
                                {interview.candidate.name.charAt(0).toUpperCase()}
                              </span>
                            </>
                          );
                        }
                        return (
                          <span>{interview.candidate.name.charAt(0).toUpperCase()}</span>
                        );
                      })()}
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
                          onClick={() => updateInterviewStatus(interview.id, interview.applicationId || '', 'completed')}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                        <button 
                          onClick={() => updateInterviewStatus(interview.id, interview.applicationId || '', 'cancelled')}
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

      {/* All Scheduled Interviews */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Scheduled Interviews ({getAllScheduledInterviews().length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {getAllScheduledInterviews().length === 0 ? (
            <div className="p-8 text-center">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No scheduled interviews</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Schedule interviews with shortlisted candidates
              </p>
              <button
                onClick={handleOpenScheduleModal}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Schedule Interview
              </button>
            </div>
          ) : (
            getAllScheduledInterviews().map((interview) => (
              <div key={interview.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg relative overflow-hidden">
                      {(() => {
                        const profileImage = interview.candidate.avatar || interview.candidate.profile_image;
                        const hasValidImage = profileImage && typeof profileImage === 'string' && profileImage.trim() !== '' && (profileImage.startsWith('http://') || profileImage.startsWith('https://'));
                        
                        if (hasValidImage) {
                          return (
                            <>
                              <img 
                                src={profileImage} 
                                alt={interview.candidate.name}
                                className="w-12 h-12 rounded-full object-cover"
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
                                {interview.candidate.name.charAt(0).toUpperCase()}
                              </span>
                            </>
                          );
                        }
                        return (
                          <span>{interview.candidate.name.charAt(0).toUpperCase()}</span>
                        );
                      })()}
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
                        onClick={() => updateInterviewStatus(interview.id, interview.applicationId || '', 'cancelled')}
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

      {/* Schedule Interview Modal */}
      {showNewInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Schedule Interview
                </h2>
                <button
                  onClick={() => setShowNewInterviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleScheduleInterview} className="space-y-4">
                {/* Select Candidate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Candidate *
                  </label>
                  {loadingCandidates ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  ) : shortlistedCandidates.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                      No shortlisted candidates available. Please shortlist candidates from the Applications page first.
                    </p>
                  ) : (
                    <select
                      required
                      value={scheduleForm.applicationId}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, applicationId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a candidate...</option>
                      {shortlistedCandidates.map((candidate) => (
                        <option key={candidate.applicationId} value={candidate.applicationId}>
                          {candidate.candidate.name} - {candidate.job.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={scheduleForm.scheduledDate}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={scheduleForm.scheduledTime}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Duration and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (minutes) *
                    </label>
                    <select
                      required
                      value={scheduleForm.duration}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Interview Type *
                    </label>
                    <select
                      required
                      value={scheduleForm.type}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="video">Video Call</option>
                      <option value="phone">Phone Call</option>
                      <option value="in-person">In-Person</option>
                    </select>
                  </div>
                </div>

                {/* Location or Meeting URL */}
                {scheduleForm.type === 'in-person' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.location}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Office Address, Building Name, Room Number"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meeting URL
                    </label>
                    <input
                      type="url"
                      value={scheduleForm.meetingUrl}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, meetingUrl: e.target.value }))}
                      placeholder="e.g., https://meet.google.com/xxx-xxxx-xxx or Zoom link"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any additional information or instructions for the candidate..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewInterviewModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={scheduling || !scheduleForm.applicationId || !scheduleForm.scheduledDate || !scheduleForm.scheduledTime}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {scheduling ? 'Scheduling...' : 'Schedule Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
