import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        (socket as any).userId = decoded.uid;
        (socket as any).userRole = decoded.role;
        
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      console.log(`User ${userId} connected with socket ${socket.id}`);

      // Store user connection
      if (userId) {
        this.connectedUsers.set(userId, socket.id);
      }

      // Handle user joining notification room
      socket.on('join_notifications', () => {
        socket.join(`notifications_${userId}`);
        console.log(`User ${userId} joined notifications room`);
      });

      // Handle user leaving notification room
      socket.on('leave_notifications', () => {
        socket.leave(`notifications_${userId}`);
        console.log(`User ${userId} left notifications room`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
        if (userId) {
          this.connectedUsers.delete(userId);
        }
      });

      // Handle typing indicators (for future chat features)
      socket.on('typing_start', (data: any) => {
        socket.broadcast.to(data.room).emit('user_typing', {
          userId: userId,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data: any) => {
        socket.broadcast.to(data.room).emit('user_typing', {
          userId: userId,
          isTyping: false
        });
      });
    });
  }

  // Send notification to specific user
  sendNotification(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
      console.log(`Notification sent to user ${userId}`);
    } else {
      console.log(`User ${userId} is not connected`);
    }
  }

  // Send notification to user's notification room
  sendNotificationToRoom(userId: string, notification: any) {
    this.io.to(`notifications_${userId}`).emit('notification', notification);
    console.log(`Notification sent to room notifications_${userId}`);
  }

  // Broadcast to all connected users
  broadcastToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Broadcast to users by role
  broadcastToRole(role: string, event: string, data: any) {
    this.io.emit(event, { ...data, targetRole: role });
  }

  // Send application status update
  sendApplicationStatusUpdate(userId: string, application: any) {
    this.sendNotification(userId, {
      type: 'application_status_change',
      data: application,
      message: `Your application status has been updated`
    });
  }

  // Send job recommendation
  sendJobRecommendation(userId: string, job: any, matchScore: number) {
    this.sendNotification(userId, {
      type: 'job_recommendation',
      data: { job, matchScore },
      message: `New job recommendation: ${job.title} (${Math.round(matchScore * 100)}% match)`
    });
  }

  // Send course recommendation
  sendCourseRecommendation(userId: string, course: any, skillsGap: string[]) {
    this.sendNotification(userId, {
      type: 'course_recommendation',
      data: { course, skillsGap },
      message: `New course recommendation: ${course.title}`
    });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get all connected users
  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}

// Global instance
let socketService: SocketService | null = null;

export const initializeSocketService = (server: HTTPServer) => {
  socketService = new SocketService(server);
  (global as any).socketService = socketService;
  return socketService;
};

export const getSocketService = () => {
  if (!socketService) {
    throw new Error('Socket service not initialized');
  }
  return socketService;
};

export { SocketService };