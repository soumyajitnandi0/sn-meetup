'use client';

import { useRouter } from 'next/navigation';
import { 
  BellIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  BoltIcon 
} from '@heroicons/react/24/outline';

const typeIcons = {
  task_assigned: BellIcon,
  task_updated: ExclamationCircleIcon,
  status_changed: CheckCircleIcon,
  automation: BoltIcon,
};

const typeColors = {
  task_assigned: 'text-blue-600 bg-blue-50',
  task_updated: 'text-orange-600 bg-orange-50',
  status_changed: 'text-green-600 bg-green-50',
  automation: 'text-purple-600 bg-purple-50',
};

export default function NotificationItem({ notification, onMarkAsRead }) {
  const router = useRouter();
  const Icon = typeIcons[notification.type] || BellIcon;
  const colorClass = typeColors[notification.type] || 'text-gray-600 bg-gray-50';

  const handleClick = () => {
    // Mark as read if unread
    if (!notification.read) {
      onMarkAsRead([notification._id]);
    }

    // Navigate to related resource
    if (notification.relatedTask) {
      router.push(`/projects/${notification.relatedProject._id || notification.relatedProject}`);
    } else if (notification.relatedProject) {
      router.push(`/projects/${notification.relatedProject._id || notification.relatedProject}`);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 ${
        !notification.read ? 'bg-blue-50/30' : ''
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {timeAgo(notification.createdAt)}
            </p>
          </div>

          {/* Unread Indicator */}
          {!notification.read && (
            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
          )}
        </div>
      </div>
    </div>
  );
}
