'use client';

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNotifications, useUnreadCount, useMarkAsRead } from '@/hooks/useNotifications';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { useQueryClient } from '@tanstack/react-query';
import NotificationItem from './NotificationItem';
import { XMarkIcon, BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function NotificationPanel({ isOpen, onClose }) {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useNotifications({ page, limit: 20 });
  const { data: unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();

  const notifications = data?.notifications || [];
  const pagination = data?.pagination || {};

  // Listen to real-time notifications
  useSocketEvent('notification', useCallback((data) => {
    // Show toast for new notification
    toast.success(data.notification.title, {
      duration: 4000,
      icon: '🔔',
    });

    // Invalidate queries to refresh notifications
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]));

  useSocketEvent('notifications_read', useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]));

  const handleMarkAsRead = (notificationIds) => {
    markAsRead.mutate({ notificationIds });
  };

  const handleMarkAllAsRead = () => {
    markAsRead.mutate({ markAll: true });
  };

  if (!isOpen) return null;

  const panelContent = (
    <>
      {/* Overlay - very light backdrop, only on mobile */}
      <div
        className="fixed inset-0 bg-black/20 md:bg-transparent transition-colors"
        style={{ zIndex: 9998 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel - right sidebar, fixed width */}
      <div 
        className="fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white/95 backdrop-blur-md shadow-2xl flex flex-col"
        style={{ zIndex: 9999 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Mark all as read"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-medium">Error loading notifications</p>
                <p className="text-sm mt-1">{error.message}</p>
              </div>
            </div>
          ) : notifications.length > 0 ? (
            <>
              {notifications.map(notification => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <BellIcon className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No notifications
              </h3>
              <p className="text-gray-600">
                You're all caught up! We'll notify you when something happens.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Use portal to render at body level, bypassing z-index stacking context
  return typeof document !== 'undefined' 
    ? createPortal(panelContent, document.body)
    : null;
}
