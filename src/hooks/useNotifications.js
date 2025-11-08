'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const API_BASE = '/api/notifications';

// Fetch notifications
async function fetchNotifications({ page = 1, limit = 20, unreadOnly = false }) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    unreadOnly: unreadOnly.toString(),
  });
  
  const res = await fetch(`${API_BASE}?${params}`);
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch notifications');
  }
  
  return data.data;
}

// Mark notifications as read
async function markNotificationsAsRead({ notificationIds, markAll = false }) {
  const res = await fetch(API_BASE, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notificationIds, markAll }),
  });
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to mark notifications as read');
  }
  
  return data;
}

// Hook to get notifications
export function useNotifications({ page = 1, limit = 20, unreadOnly = false } = {}) {
  return useQuery({
    queryKey: ['notifications', { page, limit, unreadOnly }],
    queryFn: () => fetchNotifications({ page, limit, unreadOnly }),
    staleTime: 1 * 60 * 1000, // 1 minute (shorter for notifications)
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// Hook to get unread count
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const data = await fetchNotifications({ page: 1, limit: 1, unreadOnly: false });
      return data.unreadCount;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// Hook to mark notifications as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markNotificationsAsRead,
    onMutate: async ({ notificationIds, markAll }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      
      // Snapshot previous values
      const previousNotifications = queryClient.getQueriesData({ queryKey: ['notifications'] });
      
      // Optimistically update
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          notifications: old.notifications.map(notification => {
            if (markAll || notificationIds?.includes(notification._id)) {
              return { ...notification, read: true };
            }
            return notification;
          }),
          unreadCount: markAll ? 0 : Math.max(0, old.unreadCount - (notificationIds?.length || 0)),
        };
      });
      
      // Update unread count
      if (markAll) {
        queryClient.setQueryData(['notifications', 'unread-count'], 0);
      } else if (notificationIds) {
        queryClient.setQueryData(['notifications', 'unread-count'], (old) => 
          Math.max(0, (old || 0) - notificationIds.length)
        );
      }
      
      return { previousNotifications };
    },
    onSuccess: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error.message || 'Failed to mark notifications as read');
    },
  });
}
