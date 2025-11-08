'use client';

import { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useUnreadCount } from '@/hooks/useNotifications';
import NotificationPanel from './NotificationPanel';

export default function NotificationBell() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { data: unreadCount } = useUnreadCount();

  return (
    <>
      <button
        onClick={() => setIsPanelOpen(true)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        title="Notifications"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
}
