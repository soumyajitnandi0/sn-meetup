'use client';

import { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';

/**
 * Hook to automatically join/leave a project room
 * @param {string} projectId - The project ID to join
 */
export function useProjectRoom(projectId) {
  const { socket, isConnected, joinProject, leaveProject } = useSocket();

  useEffect(() => {
    if (!projectId || !socket || !isConnected) return;

    // Join project room
    joinProject(projectId);

    // Leave project room on cleanup
    return () => {
      leaveProject(projectId);
    };
  }, [projectId, socket, isConnected, joinProject, leaveProject]);
}
