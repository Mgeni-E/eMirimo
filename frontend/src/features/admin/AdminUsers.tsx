import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  FilterIcon,
  SearchIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '../../components/icons';
import { api } from '../../lib/api';
import { socketService } from '../../lib/socket';

interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'seeker' | 'employer' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  createdAt?: string;
  created_at?: string;
  lastLogin?: string;
  last_login?: string;
  profileComplete?: boolean;
  profile_image?: string;
}

export function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    setupSocketConnection();
    
    return () => {
      if (socketService.isSocketConnected()) {
        socketService.getSocket()?.emit('leave-admin-dashboard');
      }
    };
  }, []);

  const setupSocketConnection = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
      
      // Listen for connection status
      socketService.getSocket()?.on('connect', () => {
        socketService.joinAdminDashboard();
      });

      socketService.getSocket()?.on('disconnect', () => {
        // Connection lost
      });

      socketService.getSocket()?.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      // Listen for admin updates
      socketService.onAdminUpdate((data) => {
        handleAdminUpdate(data);
      });
    }
  }, []);

  const handleAdminUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'user-status-change':
        // Update the specific user in the list - handle both id and _id
        setUsers(prev => prev.map(user => {
          const userIdentifier = user.id || (user as any)._id;
          return userIdentifier === data.data.userId 
            ? { ...user, status: data.data.status }
            : user;
        }));
        break;
      case 'user-deleted':
        // Remove the deleted user from the list
        setUsers(prev => prev.filter(user => {
          const userIdentifier = user.id || (user as any)._id;
          return userIdentifier !== data.data.userId;
        }));
        break;
      case 'new-activity':
        if (data.data.type === 'user') {
          // Refresh users list when new user registers
          loadUsers();
        }
        break;
    }
    setLastUpdated(new Date().toISOString());
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading users...');
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      // First test the admin health endpoint
      try {
        const healthResponse = await api.get('/admin/health');
        console.log('Admin health check:', healthResponse.data);
      } catch (healthError) {
        console.error('Admin health check failed:', healthError);
      }
      
      const response = await api.get('/admin/users');
      console.log('Users API response:', response.data);
      console.log('Response status:', response.status);
      
      // Handle the correct response structure from backend
      const usersData = response.data?.users || [];
      console.log('Users data:', usersData);
      console.log('Users count:', usersData.length);
      
      // Normalize user data to ensure consistent id field
      const normalizedUsers = usersData.map((user: any) => ({
        ...user,
        id: user.id || user._id, // Ensure id field exists
        createdAt: user.createdAt || user.created_at,
        lastLogin: user.lastLogin || user.last_login
      }));
      
      // Debug individual user structure
      if (normalizedUsers.length > 0) {
        console.log('First user structure:', normalizedUsers[0]);
        console.log('First user status:', normalizedUsers[0].status);
        console.log('First user role:', normalizedUsers[0].role);
        console.log('First user ID:', normalizedUsers[0].id);
      }
      
      setUsers(normalizedUsers);
      setLastUpdated(new Date().toISOString());
    } catch (error: any) {
      console.error('Failed to load users:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError('Failed to load users. Please try again.');
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'inactive', reason?: string) => {
    try {
      const response = await api.patch(`/admin/users/${userId}`, { 
        status, 
        reason 
      });
      
      if (response.data.success) {
        // Update the user in the local state - handle both id and _id
        setUsers(prev => prev.map(user => {
          const userIdentifier = user.id || (user as any)._id;
          return userIdentifier === userId ? { ...user, status } : user;
        }));
        
        setLastUpdated(new Date().toISOString());
        console.log('User status updated successfully');
      }
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      setError('Failed to update user status. Please try again.');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null); // Clear any previous errors
      const response = await api.delete(`/admin/users/${userId}`);
      
      if (response.data.success) {
        // Remove the user from the local state - handle both id and _id
        setUsers(prev => prev.filter(user => {
          const userIdentifier = user.id || (user as any)._id;
          return userIdentifier !== userId;
        }));
        
        setLastUpdated(new Date().toISOString());
        console.log('User deleted successfully');
      } else {
        setError('Failed to delete user. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      setError(error.response?.data?.error || 'Failed to delete user. Please try again.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'employer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'seeker': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'inactive': return <XCircleIcon className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage all platform users and their roles</p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="relative">
            <FilterIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="seeker">Job Seekers</option>
              <option value="employer">Employers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Users ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user, index) => {
                // Safety check for user data
                if (!user) {
                  console.warn(`User at index ${index} is undefined`);
                  return null;
                }
                
                return (
                <tr 
                  key={user.id || user._id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => navigate(`/admin/users/${user.id || user._id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.profile_image ? (
                        <img 
                          src={user.profile_image} 
                          alt={user.name || 'User'}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.className = 'w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center';
                              fallback.innerHTML = '<svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                              parent.insertBefore(fallback, target);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role || 'seeker')}`}>
                      {user.role === 'seeker' ? 'Job Seeker' : (user.role || 'seeker').charAt(0).toUpperCase() + (user.role || 'seeker').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status || 'pending')}`}>
                      {getStatusIcon(user.status || 'pending')}
                      <span className="ml-1">{(user.status || 'pending').charAt(0).toUpperCase() + (user.status || 'pending').slice(1)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.profileComplete 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {user.profileComplete ? 'Complete' : 'Incomplete'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const userId = user.id || user._id;
                          if (userId) navigate(`/admin/users/${userId}`);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const userId = user.id || user._id;
                          if (userId) deleteUser(userId);
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      {(user.status || 'pending') === 'active' ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const userId = user.id || user._id;
                            if (userId) updateUserStatus(userId, 'inactive');
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <XCircleIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const userId = user.id || user._id;
                            if (userId) updateUserStatus(userId, 'active');
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}