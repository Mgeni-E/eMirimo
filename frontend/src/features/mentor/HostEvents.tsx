import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  CalendarIcon, 
  PlusIcon, 
  SearchIcon,
  FilterIcon,
  EyeIcon,
  UsersIcon,
  ClockIcon,
  MapPinIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  XIcon
} from '../../components/icons';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number; // in minutes
  location: string;
  type: 'workshop' | 'seminar' | 'networking' | 'webinar';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  maxAttendees: number;
  registeredAttendees: number;
  price: number;
  tags: string[];
}

export function HostEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would fetch from mentor API
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'React.js Workshop for Beginners',
          description: 'Learn the fundamentals of React.js with hands-on coding exercises',
          date: '2024-02-05',
          time: '10:00',
          duration: 180,
          location: 'Online (Zoom)',
          type: 'workshop',
          status: 'upcoming',
          maxAttendees: 25,
          registeredAttendees: 18,
          price: 0,
          tags: ['react', 'javascript', 'frontend', 'workshop']
        },
        {
          id: '2',
          title: 'Career Networking Mixer',
          description: 'Connect with industry professionals and expand your network',
          date: '2024-02-10',
          time: '18:00',
          duration: 120,
          location: 'Tech Hub Kigali',
          type: 'networking',
          status: 'upcoming',
          maxAttendees: 50,
          registeredAttendees: 32,
          price: 5000,
          tags: ['networking', 'career', 'professional']
        },
        {
          id: '3',
          title: 'Technical Interview Preparation',
          description: 'Master the art of technical interviews with mock sessions',
          date: '2024-01-25',
          time: '14:00',
          duration: 240,
          location: 'Online (Teams)',
          type: 'seminar',
          status: 'upcoming',
          maxAttendees: 15,
          registeredAttendees: 12,
          price: 0,
          tags: ['interview', 'technical', 'preparation']
        },
        {
          id: '4',
          title: 'Startup Funding Strategies Webinar',
          description: 'Learn about different funding options and investor relations',
          date: '2024-01-20',
          time: '16:00',
          duration: 90,
          location: 'Online (Zoom)',
          type: 'webinar',
          status: 'completed',
          maxAttendees: 100,
          registeredAttendees: 87,
          price: 0,
          tags: ['startup', 'funding', 'entrepreneurship']
        },
        {
          id: '5',
          title: 'Resume Building Workshop',
          description: 'Create compelling resumes that stand out to employers',
          date: '2024-02-15',
          time: '11:00',
          duration: 150,
          location: 'Online (Zoom)',
          type: 'workshop',
          status: 'upcoming',
          maxAttendees: 20,
          registeredAttendees: 15,
          price: 0,
          tags: ['resume', 'career', 'workshop']
        }
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workshop': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'seminar': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'networking': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'webinar': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesType = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const completedEvents = events.filter(event => event.status === 'completed');
  const totalAttendees = events.reduce((sum, event) => sum + event.registeredAttendees, 0);

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Host Events</h1>
            <p className="text-gray-600 dark:text-gray-400">Create and manage events to share knowledge with your mentees</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Events</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingEvents.length}</div>
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
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedEvents.length}</div>
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
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalAttendees}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Attendees</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
                placeholder="Search events by title, description, or tags..."
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
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="workshop">Workshops</option>
              <option value="seminar">Seminars</option>
              <option value="networking">Networking</option>
              <option value="webinar">Webinars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{event.description}</p>
                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(event.type)}`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {event.time} ({event.duration} min)
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {event.location}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        {event.registeredAttendees}/{event.maxAttendees} attendees
                      </div>
                      {event.price > 0 && (
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.price.toLocaleString()} RWF
                        </div>
                      )}
                      {event.price === 0 && (
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          Free
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {event.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {event.tags.length > 4 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                          +{event.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View Details
                </button>
                
                {event.status === 'upcoming' && (
                  <>
                    <button className="flex items-center px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                      <EditIcon className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Start Event
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                      <XIcon className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </>
                )}
                
                {event.status === 'completed' && (
                  <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    View Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Event</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Event creation form would go here...</p>
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
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
