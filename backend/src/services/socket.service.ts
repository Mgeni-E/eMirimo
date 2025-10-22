import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { createNotification } from '../controllers/notification.controller.js';

// Extend Socket interface to include userId
declare module 'socket.io' {
  interface Socket {
    userId?: string;
  }
}

export class SocketService {
  private io: Server;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(io: Server) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        socket.userId = decoded.uid;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.userId;
      if (userId) {
        this.connectedUsers.set(userId, socket.id);
      }

      console.log(`User ${userId} connected`);

      // Join user to their personal room
      socket.join(`user:${userId}`);

      // Handle admin dashboard subscriptions
      socket.on('join-admin-dashboard', () => {
        socket.join('admin-dashboard');
        console.log(`User ${userId} joined admin dashboard`);
      });

      socket.on('leave-admin-dashboard', () => {
        socket.leave('admin-dashboard');
        console.log(`User ${userId} left admin dashboard`);
      });

      // Handle mentorship chat
      socket.on('join-mentorship', (mentorshipId: string) => {
        socket.join(`mentorship:${mentorshipId}`);
        console.log(`User ${userId} joined mentorship ${mentorshipId}`);
      });

      socket.on('leave-mentorship', (mentorshipId: string) => {
        socket.leave(`mentorship:${mentorshipId}`);
        console.log(`User ${userId} left mentorship ${mentorshipId}`);
      });

      socket.on('send-message', async (data: {
        mentorshipId: string;
        message: string;
        senderId: string;
        senderName: string;
      }) => {
        // Broadcast message to mentorship room
        this.io.to(`mentorship:${data.mentorshipId}`).emit('new-message', {
          id: Date.now().toString(),
          mentorshipId: data.mentorshipId,
          message: data.message,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: new Date().toISOString()
        });

        // Note: Mentorship functionality removed
      });

      socket.on('disconnect', () => {
        if (userId) {
          this.connectedUsers.delete(userId);
        }
        console.log(`User ${userId} disconnected`);
      });
    });
  }

  // Send notification to specific user
  public sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  // Send notification to all users in a room
  public sendNotificationToRoom(room: string, notification: any) {
    this.io.to(room).emit('notification', notification);
  }

  // Send message to mentorship chat
  public sendMessageToMentorship(mentorshipId: string, message: any) {
    this.io.to(`mentorship:${mentorshipId}`).emit('new-message', message);
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is online
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Broadcast admin dashboard updates
  public broadcastAdminUpdate(type: string, data: any) {
    this.io.to('admin-dashboard').emit('admin-update', {
      type,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast user status change
  public broadcastUserStatusChange(userId: string, status: string, reason?: string) {
    this.broadcastAdminUpdate('user-status-change', {
      userId,
      status,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast job status change
  public broadcastJobStatusChange(jobId: string, isActive: boolean, reason?: string) {
    this.broadcastAdminUpdate('job-status-change', {
      jobId,
      isActive,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast new activity
  public broadcastNewActivity(activity: any) {
    this.broadcastAdminUpdate('new-activity', activity);
  }

  // Broadcast stats update
  public broadcastStatsUpdate(stats: any) {
    this.broadcastAdminUpdate('stats-update', stats);
  }
}
