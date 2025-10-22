import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(_token: string) {
    if (this.socket?.connected) {
      return;
    }

    // Extract base URL from API URL (remove /api suffix)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const baseUrl = apiUrl.replace('/api', '');
    
    this.socket = io(baseUrl, {
      auth: {
        token: _token
      },
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }


  // Listen for new messages
  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  // Listen for notifications
  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Join admin dashboard
  joinAdminDashboard() {
    if (this.socket) {
      this.socket.emit('join-admin-dashboard');
    }
  }

  // Leave admin dashboard
  leaveAdminDashboard() {
    if (this.socket) {
      this.socket.emit('leave-admin-dashboard');
    }
  }

  // Listen for admin updates
  onAdminUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('admin-update', callback);
    }
  }

  // Remove admin update listener
  offAdminUpdate() {
    if (this.socket) {
      this.socket.off('admin-update');
    }
  }

  // Remove listeners
  offNewMessage() {
    if (this.socket) {
      this.socket.off('new-message');
    }
  }

  offNotification() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
