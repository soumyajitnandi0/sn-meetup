import { emitToProject } from '../server.js';

export function emitTaskCreated(task) {
  if (task.project) {
    emitToProject(task.project.toString(), 'task_created', {
      task,
      timestamp: new Date().toISOString(),
    });
  }
}

export function emitTaskUpdated(task) {
  if (task.project) {
    emitToProject(task.project.toString(), 'task_updated', {
      task,
      timestamp: new Date().toISOString(),
    });
  }
}

export function emitTaskDeleted(taskId, projectId) {
  if (projectId) {
    emitToProject(projectId.toString(), 'task_deleted', {
      taskId,
      timestamp: new Date().toISOString(),
    });
  }
}

export function emitBoardRefresh(projectId) {
  if (projectId) {
    emitToProject(projectId.toString(), 'board_refresh', {
      timestamp: new Date().toISOString(),
    });
  }
}

