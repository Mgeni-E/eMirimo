import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  CalendarIcon, 
  ClockIcon, 
  UsersIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  XIcon
} from '../../components/icons';

interface Session {
  id: string;
  title: string;
  mentee: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'one-on-one' | 'group' | 'workshop';
  description: string;
  location: string;
}

export function ScheduleSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would fetch from mentor API
      const mockSessions: Session[] = [
        {
          id: '1',
          title: 'Career Guidance Session',
          mentee: 'Alice Johnson',
          date: '2024-01-25',
          time: '10:00',
          duration: 60,
          status: 'scheduled',
          type: 'one-on-one',
          description: 'Discuss career transition strategies and next steps',
          location: 'Online (Zoom)'
        },
        {
          id: '2',
          title: 'Technical Skills Workshop',
          mentee: 'Bob Smith',
          date: '2024-01-26',
          time: '14:00',
          duration: 90,
          status: 'scheduled',
          type: 'workshop',
          description: 'React.js fundamentals and best practices',
          location: 'Online (Teams)'
        },
        {
          id: '3',
          title: 'Resume Review Session',
          mentee: 'Carol Williams',
          date: '2024-01-20',
          time: '16:00',
          duration: 45,
          status: 'completed',
          type: 'one-on-one',
          description: 'Review and improve resume structure',
          location: 'Online (Zoom)'
        },
        {
          id: '4',
          title: 'Group Networking Session',
          mentee: 'Multiple Mentees',
          date: '2024-01-28',
          time: '18:00',
          duration: 120,
          status: 'scheduled',
          type: 'group',
          description: 'Networking strategies and LinkedIn optimization',
          location: 'Online (Zoom)'
        }
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'one-on-one': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'group': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'workshop': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredSessions = sessions.filter(session => 
    session.date === selectedDate || selectedDate === ''
  );

  const upcomingSessions = sessions.filter(session => 
    new Date(session.date + 'T' + session.time) > new Date()
  );

  const completedSessions = sessions.filter(session => session.status === 'completed');

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Schedule Sessions</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your mentoring sessions and schedule new ones</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Schedule Session
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{sessions.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingSessions.length}</div>
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
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedSessions.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {sessions.reduce((sum, s) => sum + s.duration, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => setSelectedDate('')}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          >
            Show All
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-6">
        {filteredSessions.map((session) => (
          <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {session.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{session.mentee}</p>
                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(session.type)}`}>
                        {session.type.charAt(0).toUpperCase() + session.type.slice(1).replace('-', ' ')}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {session.description}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {session.time} ({session.duration} min)
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        {session.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                {session.status === 'scheduled' && (
                  <>
                    <button className="flex items-center px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                      <EditIcon className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Complete
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                      <XIcon className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </>
                )}
                {session.status === 'completed' && (
                  <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View Notes
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Session Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule New Session</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Session creation form would go here...</p>
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
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
