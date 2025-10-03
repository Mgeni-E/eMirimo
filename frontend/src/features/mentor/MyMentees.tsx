import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  UsersIcon, 
  SearchIcon, 
  FilterIcon,
  EyeIcon,
  MessageIcon,
  CalendarIcon,
  StarIcon,
  CheckIcon,
  ClockIcon
} from '../../components/icons';

interface Mentee {
  id: string;
  name: string;
  email: string;
  role: 'seeker';
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastActive: string;
  goals: string[];
  progress: number;
  sessionsCompleted: number;
  nextSession?: string;
}

export function MyMentees() {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadMentees();
  }, []);

  const loadMentees = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would fetch from mentor API
      const mockMentees: Mentee[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          role: 'seeker',
          status: 'active',
          joinDate: '2024-01-15',
          lastActive: '2 hours ago',
          goals: ['Career transition', 'Technical skills', 'Interview prep'],
          progress: 75,
          sessionsCompleted: 8,
          nextSession: '2024-01-25'
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          role: 'seeker',
          status: 'active',
          joinDate: '2024-01-10',
          lastActive: '1 day ago',
          goals: ['Resume building', 'Networking', 'Job search strategy'],
          progress: 60,
          sessionsCompleted: 6,
          nextSession: '2024-01-26'
        },
        {
          id: '3',
          name: 'Carol Williams',
          email: 'carol@example.com',
          role: 'seeker',
          status: 'pending',
          joinDate: '2024-01-20',
          lastActive: '3 days ago',
          goals: ['Industry knowledge', 'Leadership skills'],
          progress: 30,
          sessionsCompleted: 2
        },
        {
          id: '4',
          name: 'David Brown',
          email: 'david@example.com',
          role: 'seeker',
          status: 'inactive',
          joinDate: '2024-01-05',
          lastActive: '1 week ago',
          goals: ['Technical interview prep'],
          progress: 45,
          sessionsCompleted: 4
        }
      ];
      setMentees(mockMentees);
    } catch (error) {
      console.error('Failed to load mentees:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredMentees = mentees.filter(mentee => {
    const matchesSearch = mentee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || mentee.status === filterStatus;
    return matchesSearch && matchesStatus;
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Mentees</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and track your mentees' progress and development</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{mentees.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Mentees</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {mentees.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Mentees</div>
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
                {mentees.reduce((sum, m) => sum + m.sessionsCompleted, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {mentees.filter(m => m.nextSession).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming Sessions</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
                placeholder="Search mentees by name or email..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mentees List */}
      <div className="space-y-6">
        {filteredMentees.map((mentee) => (
          <div key={mentee.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {mentee.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{mentee.email}</p>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(mentee.status)}`}>
                          {mentee.status.charAt(0).toUpperCase() + mentee.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {mentee.sessionsCompleted} sessions completed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{mentee.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${mentee.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goals:</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentee.goals.map((goal, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
                
                {mentee.nextSession && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    Next session: {new Date(mentee.nextSession).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View Profile
                </button>
                <button className="flex items-center px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  <MessageIcon className="w-4 h-4 mr-1" />
                  Message
                </button>
                <button className="flex items-center px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  Schedule Session
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
