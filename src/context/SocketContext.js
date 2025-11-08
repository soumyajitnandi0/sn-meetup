'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    // Get token from cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    // Initialize socket connection
    const socketInstance = io({
      path: '/api/socket',
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      setReconnectAttempts(0);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setReconnectAttempts(prev => prev + 1);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const joinProject = useCallback((projectId) => {
    if (socket && isConnected) {
      socket.emit('join_project', projectId);
    }
  }, [socket, isConnected]);

  const leaveProject = useCallback((projectId) => {
    if (socket && isConnected) {
      socket.emit('leave_project', projectId);
    }
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    reconnectAttempts,
    joinProject,
    leaveProject,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
