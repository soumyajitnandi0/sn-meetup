import { emitToUser } from '../server.js';

export function emitNotification(userId, notification) {
  if (userId) {
    emitToUser(userId.toString(), 'notification', {
      notification,
      timestamp: new Date().toISOString(),
    });
  }
}

export function emitNotificationRead(userId, notificationIds) {
  if (userId) {
    emitToUser(userId.toString(), 'notifications_read', {
      notificationIds,
      timestamp: new Date().toISOString(),
    });
  }
}

