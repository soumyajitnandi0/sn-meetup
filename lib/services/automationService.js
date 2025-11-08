import Automation from '../models/Automation.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { emitNotification } from '../socket/handlers/notificationHandlers.js';

// Evaluate if a trigger condition matches the task changes
function evaluateTriggerCondition(trigger, oldTask, newTask) {
  const { type, condition } = trigger;

  // Check trigger type
  switch (type) {
    case 'status_change':
      if (oldTask.status === newTask.status) return false;
      break;
    case 'assignment':
      if (oldTask.assignee?.toString() === newTask.assignee?.toString()) return false;
      break;
    case 'priority_change':
      if (oldTask.priority === newTask.priority) return false;
      break;
    default:
      return false;
  }

  // If no condition specified, trigger matches
  if (!condition || !condition.field) return true;

  // Evaluate condition
  const { field, operator, value } = condition;
  const fieldValue = newTask[field];

  switch (operator) {
    case 'equals':
      return fieldValue?.toString() === value?.toString();
    case 'not_equals':
      return fieldValue?.toString() !== value?.toString();
    case 'contains':
      return fieldValue?.toString().includes(value?.toString());
    default:
      return false;
  }
}

// Execute automation actions
async function executeActions(actions, task, userId) {
  const results = [];

  for (const action of actions) {
    try {
      switch (action.type) {
        case 'update_status':
          if (action.params?.status) {
            task.status = action.params.status;
            await task.save();
            results.push({ type: 'update_status', success: true });
          }
          break;

        case 'assign_user':
          if (action.params?.userId) {
            task.assignee = action.params.userId;
            await task.save();
            results.push({ type: 'assign_user', success: true });
          }
          break;

        case 'send_notification':
          if (action.params?.userId && action.params?.message) {
            const notification = await Notification.create({
              user: action.params.userId,
              type: 'automation',
              title: action.params.title || 'Automation Notification',
              message: action.params.message,
              relatedTask: task._id,
              relatedProject: task.project,
            });

            // Emit real-time notification
            emitNotification(action.params.userId, notification);
            results.push({ type: 'send_notification', success: true });
          }
          break;

        default:
          results.push({ type: action.type, success: false, error: 'Unknown action type' });
      }
    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error);
      results.push({ type: action.type, success: false, error: error.message });
    }
  }

  return results;
}

// Main function to check and execute automations for a task update
export async function executeAutomations(oldTask, newTask, userId) {
  try {
    // Find all enabled automations for the project
    const automations = await Automation.find({
      project: newTask.project,
      enabled: true,
    });

    const executedAutomations = [];

    for (const automation of automations) {
      // Check if trigger condition matches
      if (evaluateTriggerCondition(automation.trigger, oldTask, newTask)) {
        console.log(`Executing automation: ${automation.name}`);
        
        // Execute actions
        const results = await executeActions(automation.actions, newTask, userId);
        
        executedAutomations.push({
          automationId: automation._id,
          automationName: automation.name,
          results,
        });
      }
    }

    return executedAutomations;
  } catch (error) {
    console.error('Error executing automations:', error);
    return [];
  }
}

// Helper to create notification for task assignment
export async function createTaskAssignmentNotification(task, assigneeId) {
  try {
    if (!assigneeId) return null;

    await task.populate('project', 'name');
    await task.populate('createdBy', 'name');

    const notification = await Notification.create({
      user: assigneeId,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned to task "${task.title}" in project "${task.project.name}"`,
      relatedTask: task._id,
      relatedProject: task.project._id,
    });

    // Emit real-time notification
    emitNotification(assigneeId, notification);

    return notification;
  } catch (error) {
    console.error('Error creating task assignment notification:', error);
    return null;
  }
}

// Helper to create notification for task status change
export async function createTaskStatusChangeNotification(task, projectMembers) {
  try {
    await task.populate('project', 'name');
    await task.populate('assignee', 'name');

    const notifications = [];

    for (const memberId of projectMembers) {
      const notification = await Notification.create({
        user: memberId,
        type: 'status_changed',
        title: 'Task Status Updated',
        message: `Task "${task.title}" status changed to "${task.status}"`,
        relatedTask: task._id,
        relatedProject: task.project._id,
      });

      // Emit real-time notification
      emitNotification(memberId, notification);
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating status change notifications:', error);
    return [];
  }
}

