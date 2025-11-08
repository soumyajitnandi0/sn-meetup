'use client';

import { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';

/**
 * Hook to listen to socket events
 * @param {string} event - The event name to listen to
 * @param {function} handler - The callback function to handle the event
 * @param {array} dependencies - Dependencies array for the handler
 */
export function useSocketEvent(event, handler, dependencies = []) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, isConnected, event, handler, ...dependencies]);
}

/**
 * Hook to listen to multiple socket events
 * @param {object} events - Object with event names as keys and handlers as values
 * @param {array} dependencies - Dependencies array for the handlers
 */
export function useSocketEvents(events, dependencies = []) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Register all event listeners
    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // Cleanup all event listeners
    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, isConnected, events, ...dependencies]);
}
