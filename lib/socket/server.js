import { Server } from 'socket.io';
import { verifyToken } from '../utils/auth.js';
import dbConnect from '../db.js';
import Project from '../models/Project.js';

let io;

export function initSocketServer(httpServer) {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL 
        : 'http://localhost:3000',
      credentials: true,
    },
  });

  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    // Authenticate socket connection
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('No token provided, disconnecting:', socket.id);
      socket.disconnect();
      return;
    }

    try {
      const decoded = verifyToken(token);
      
      if (!decoded || !decoded.id) {
        console.log('Invalid token, disconnecting:', socket.id);
        socket.disconnect();
        return;
      }

      // Store user ID in socket
      socket.userId = decoded.id;
      console.log('User authenticated:', socket.userId);

      // Join user's personal room
      socket.join(`user:${socket.userId}`);

      // Handle joining project rooms
      socket.on('join_project', async (projectId) => {
        try {
          await dbConnect();
          
          // Verify user has access to project
          const project = await Project.findById(projectId);
          
          if (!project) {
            socket.emit('error', { message: 'Project not found' });
            return;
          }

          const isOwner = project.owner.toString() === socket.userId;
          const isMember = project.members.some(
            member => member.toString() === socket.userId
          );

          if (!isOwner && !isMember) {
            socket.emit('error', { message: 'Access denied to project' });
            return;
          }

          // Join project room
          socket.join(`project:${projectId}`);
          console.log(`User ${socket.userId} joined project ${projectId}`);
          
          socket.emit('joined_project', { projectId });
        } catch (error) {
          console.error('Error joining project:', error);
          socket.emit('error', { message: 'Failed to join project' });
        }
      });

      // Handle leaving project rooms
      socket.on('leave_project', (projectId) => {
        socket.leave(`project:${projectId}`);
        console.log(`User ${socket.userId} left project ${projectId}`);
        socket.emit('left_project', { projectId });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.disconnect();
    }
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function emitToProject(projectId, event, data) {
  if (io) {
    io.to(`project:${projectId}`).emit(event, data);
  }
}

export function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

