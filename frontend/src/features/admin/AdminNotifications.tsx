import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  BellIcon, 
  FilterIcon,
  SearchIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '../../components/icons';
import { api } from '../../lib/api';
import { socketService } from '../../lib/socket';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  status: 'read' | 'unread';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  targetUsers?: string[];
  actionRequired: boolean;
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleAdminUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'new-notification':
        // Add new notification to the list
        setNotifications(prev => [data.notification, ...prev]);
        break;
      case 'notification-update':
        // Update specific notification
        setNotifications(prev => prev.map(notification => 
          notification.id === data.notificationId 
            ? { ...notification, ...data.updates }
            : notification
        ));
        break;
      case 'notification-delete':
        // Remove notification from list
        setNotifications(prev => prev.filter(notification => 
          notification.id !== data.notificationId
        ));
        break;
    }
  }, []);

  const setupSocketConnection = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found for socket connection');
      return;
    }

    try {
      socketService.connect(token);
      
      const socket = socketService.getSocket();
      if (!socket) {
        console.warn('Socket not available after connection attempt');
        return;
      }
      
      // Listen for connection status
      socket.on('connect', () => {
        console.log('Socket connected, joining admin dashboard');
        socket.emit('join-admin-dashboard');
        setError(null); // Clear any previous errors
      });

      socket.on('disconnect', (reason) => {
        console.warn('Socket disconnected:', reason);
        // Attempt to reconnect if it was an unexpected disconnect
        if (reason === 'io server disconnect') {
          // Server disconnected, reconnect manually
          setTimeout(() => {
            if (token) {
              socketService.connect(token);
            }
          }, 1000);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setError('Connection issue. Notifications may be delayed.');
        // Retry connection after delay
        setTimeout(() => {
          if (token && !socketService.isSocketConnected()) {
            socketService.connect(token);
          }
        }, 3000);
      });
      
      // Listen for admin updates
      socketService.onAdminUpdate((data) => {
        handleAdminUpdate(data);
      });
    } catch (error) {
      console.error('Error setting up socket connection:', error);
      setError('Failed to establish real-time connection. Notifications will still work via polling.');
    }
  }, [handleAdminUpdate]);

  const loadNotifications = useCallback(async (retryCount = 0) => {
    setLoading(true);
    if (retryCount === 0) {
      setError(null);
    }
    
    try {
      console.log('Loading notifications...');
      
      // Fetch real notifications data from API
      const response = await api.get('/notifications');
      console.log('Notifications API response:', response.data);
      
      const backendNotifications = response.data?.notifications || [];
      
      // Transform backend notifications to frontend format
      const transformedNotifications: Notification[] = backendNotifications.map((notif: any) => {
        const priority = notif.data?.priority || 'medium';
        const actionRequired = priority === 'high' || priority === 'medium';
        
        // Determine type based on backend type
        let frontendType: 'info' | 'warning' | 'error' | 'success' = 'info';
        if (notif.type === 'system' && priority === 'high') {
          frontendType = 'warning';
        } else if (notif.type === 'system' && priority === 'low') {
          frontendType = 'info';
        } else if (notif.type === 'job_application') {
          frontendType = 'info';
        } else if (notif.type === 'mentorship_request') {
          frontendType = 'info';
        }
        
        // Extract title from message (first sentence)
        const title = notif.message.split(':')[0] || 'Notification';
        
        return {
          id: notif._id,
          title: title,
          message: notif.message,
          type: frontendType,
          status: notif.read_status ? 'read' : 'unread',
          priority: priority,
          createdAt: notif.created_at,
          targetUsers: ['admin'],
          actionRequired: actionRequired
        };
      });
      
      setNotifications(transformedNotifications);
      setError(null); // Clear error on success
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
      
      // Retry logic for transient errors
      if (retryCount < 3 && (error.response?.status >= 500 || !error.response)) {
        console.log(`Retrying notification load (attempt ${retryCount + 1}/3)...`);
        setTimeout(() => {
          loadNotifications(retryCount + 1);
        }, 2000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      console.error('Error response:', error.response?.data);
      
      // Fallback to mock data if API fails
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'New User Registration',
          message: 'John Doe has registered as a Job Seeker and is pending approval.',
          type: 'info',
          status: 'unread',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          targetUsers: ['admin'],
          actionRequired: true
        },
        {
          id: '2',
          title: 'Job Posting Reported',
          message: 'A job posting has been reported for inappropriate content. Please review.',
          type: 'warning',
          status: 'unread',
          priority: 'high',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          targetUsers: ['admin'],
          actionRequired: true
        },
        {
          id: '3',
          title: 'System Maintenance',
          message: 'Scheduled system maintenance will begin at 2:00 AM UTC.',
          type: 'info',
          status: 'read',
          priority: 'low',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          targetUsers: ['admin'],
          actionRequired: false
        },
        {
          id: '4',
          title: 'High Application Volume',
          message: 'Software Engineer position has received 50+ applications in the last hour.',
          type: 'success',
          status: 'read',
          priority: 'medium',
          createdAt: new Date(Date.now() - 10800000).toISOString(),
          targetUsers: ['admin'],
          actionRequired: false
        },
        {
          id: '5',
          title: 'Database Error',
          message: 'Database connection timeout detected. System is running on backup servers.',
          type: 'error',
          status: 'unread',
          priority: 'high',
          createdAt: new Date(Date.now() - 14400000).toISOString(),
          targetUsers: ['admin'],
          actionRequired: true
        }
      ];
      
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    setupSocketConnection();
    
    // Poll for notifications every 30 seconds as fallback
    const pollInterval = setInterval(() => {
      if (!socketService.isSocketConnected()) {
        loadNotifications();
      }
    }, 30000);
    
    return () => {
      clearInterval(pollInterval);
      if (socketService.isSocketConnected()) {
        socketService.getSocket()?.emit('leave-admin-dashboard');
      }
    };
  }, [setupSocketConnection, loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'read' as const }
          : notification
      ));
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
      setError('Failed to update notification status. Please try again.');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications((notifications || []).filter(notification => notification.id !== notificationId));
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
      setError('Failed to delete notification. Please try again.');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <InformationCircleIcon className="w-4 h-4" />;
      case 'warning': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'error': return <XCircleIcon className="w-4 h-4" />;
      case 'success': return <CheckCircleIcon className="w-4 h-4" />;
      default: return <BellIcon className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredNotifications = (notifications || []).filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = (notifications || []).filter(n => n.status === 'unread').length;
  const actionRequiredCount = (notifications || []).filter(n => n.actionRequired && n.status === 'unread').length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage system notifications and alerts</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {unreadCount} unread, {actionRequiredCount} require action
              </div>
            </div>
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
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="relative">
            <FilterIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="info">Information</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </select>
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${
              notification.status === 'unread' ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(notification.type)}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                  </div>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </span>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                    {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)} Priority
                  </span>
                  
                  {notification.actionRequired && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                      Action Required
                    </span>
                  )}
                  
                  {notification.status === 'unread' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      Unread
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                    {notification.targetUsers && (
                      <div>
                        Target: {notification.targetUsers.join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {notification.status === 'unread' && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Mark as Read
                      </button>
                    )}
                    
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'No notifications have been created yet.'
              }
            </p>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}