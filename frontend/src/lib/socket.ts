import { io, Socket } from 'socket.io-client';
import { useAuth } from './store';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(token: string) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join notifications room
  joinNotifications() {
    if (this.socket) {
      this.socket.emit('join_notifications');
    }
  }

  // Leave notifications room
  leaveNotifications() {
    if (this.socket) {
      this.socket.emit('leave_notifications');
    }
  }

  // Listen for notifications
  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Remove notification listener
  offNotification() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }

  // Listen for application status updates
  onApplicationStatusUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('application_status_update', callback);
    }
  }

  // Listen for job recommendations
  onJobRecommendation(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('job_recommendation', callback);
    }
  }

  // Listen for course recommendations
  onCourseRecommendation(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('course_recommendation', callback);
    }
  }

  // Listen for admin updates
  onAdminUpdate(callback: (data: any) => void) {
    if (this.socket) {
      // Listen for both event name formats for compatibility
      this.socket.on('admin-update', callback);
      this.socket.on('admin_update', callback);
    }
  }

  // Remove admin update listener
  offAdminUpdate() {
    if (this.socket) {
      this.socket.off('admin-update');
      this.socket.off('admin_update');
    }
  }

  // Join admin dashboard room
  joinAdminDashboard() {
    if (this.socket) {
      this.socket.emit('join-admin-dashboard');
    }
  }

  // Leave admin dashboard room
  leaveAdminDashboard() {
    if (this.socket) {
      this.socket.emit('leave-admin-dashboard');
    }
  }

  // Send typing indicator
  sendTypingStart(room: string) {
    if (this.socket) {
      this.socket.emit('typing_start', { room });
    }
  }

  // Stop typing indicator
  sendTypingStop(room: string) {
    if (this.socket) {
      this.socket.emit('typing_stop', { room });
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

// Create singleton instance
export const socketService = new SocketService();

// Hook for using socket in React components
export const useSocket = () => {
  const { user, token } = useAuth();

  const connectSocket = () => {
    if (user && token) {
      socketService.connect(token);
      socketService.joinNotifications();
    }
  };

  const disconnectSocket = () => {
    socketService.leaveNotifications();
    socketService.disconnect();
  };

  return {
    socket: socketService.getSocket(),
    isConnected: socketService.isSocketConnected(),
    connectSocket,
    disconnectSocket,
    onNotification: socketService.onNotification.bind(socketService),
    offNotification: socketService.offNotification.bind(socketService),
    onApplicationStatusUpdate: socketService.onApplicationStatusUpdate.bind(socketService),
    onJobRecommendation: socketService.onJobRecommendation.bind(socketService),
    onCourseRecommendation: socketService.onCourseRecommendation.bind(socketService),
    onAdminUpdate: socketService.onAdminUpdate.bind(socketService),
    offAdminUpdate: socketService.offAdminUpdate.bind(socketService),
    joinAdminDashboard: socketService.joinAdminDashboard.bind(socketService),
    leaveAdminDashboard: socketService.leaveAdminDashboard.bind(socketService)
  };
};