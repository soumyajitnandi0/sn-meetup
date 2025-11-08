import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import { emitNotification } from '../socket/handlers/notificationHandlers.js';

// Create notification for task update
export async function createTaskUpdateNotification(task, updatedFields) {
  try {
    await task.populate('project', 'name');
    
    // Get project to find members
    const project = await Project.findById(task.project._id);
    if (!project) return [];

    // Determine who should be notified (project members except the updater)
    const recipientIds = [
      project.owner.toString(),
      ...project.members.map(m => m.toString()),
    ].filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

    const notifications = [];
    const fieldsChanged = Object.keys(updatedFields).join(', ');

    for (const recipientId of recipientIds) {
      const notification = await Notification.create({
        user: recipientId,
        type: 'task_updated',
        title: 'Task Updated',
        message: `Task "${task.title}" was updated (${fieldsChanged})`,
        relatedTask: task._id,
        relatedProject: task.project._id,
      });

      // Emit real-time notification (delivered within 2 seconds via WebSocket)
      emitNotification(recipientId, notification);
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating task update notifications:', error);
    return [];
  }
}

// Create notification for task status change to all project members
export async function createStatusChangeNotification(task, oldStatus, newStatus) {
  try {
    await task.populate('project', 'name');
    
    // Get project to find members
    const project = await Project.findById(task.project._id);
    if (!project) return [];

    // Notify all project members
    const recipientIds = [
      project.owner.toString(),
      ...project.members.map(m => m.toString()),
    ].filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

    const notifications = [];

    for (const recipientId of recipientIds) {
      const notification = await Notification.create({
        user: recipientId,
        type: 'status_changed',
        title: 'Task Status Changed',
        message: `Task "${task.title}" moved from "${oldStatus}" to "${newStatus}"`,
        relatedTask: task._id,
        relatedProject: task.project._id,
      });

      // Emit real-time notification (delivered within 2 seconds via WebSocket)
      emitNotification(recipientId, notification);
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating status change notifications:', error);
    return [];
  }
}

// Batch create notifications (for efficiency)
export async function batchCreateNotifications(notificationData) {
  try {
    const notifications = await Notification.insertMany(notificationData);
    
    // Emit real-time notifications for each recipient
    for (const notification of notifications) {
      emitNotification(notification.user.toString(), notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error batch creating notifications:', error);
    return [];
  }
}

