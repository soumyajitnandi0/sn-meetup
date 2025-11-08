'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const API_BASE = '/api/tasks';

// Fetch single task
async function fetchTask(taskId) {
  const res = await fetch(`${API_BASE}/${taskId}`);
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch task');
  }
  
  return data.data;
}

// Create task
async function createTask(taskData) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to create task');
  }
  
  return data.data;
}

// Update task
async function updateTask({ taskId, updates }) {
  const res = await fetch(`${API_BASE}/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to update task');
  }
  
  return data.data;
}

// Delete task
async function deleteTask(taskId) {
  const res = await fetch(`${API_BASE}/${taskId}`, {
    method: 'DELETE',
  });
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete task');
  }
  
  return data;
}

// Hook to get single task
export function useTask(taskId) {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => fetchTask(taskId),
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to create task
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // Invalidate project tasks query
      queryClient.invalidateQueries({ 
        queryKey: ['projects', newTask.project._id || newTask.project, 'tasks'] 
      });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
}

// Hook to update task
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTask,
    onMutate: async ({ taskId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks', taskId] });
      
      // Snapshot previous value
      const previousTask = queryClient.getQueryData(['tasks', taskId]);
      
      // Optimistically update task detail
      queryClient.setQueryData(['tasks', taskId], (old) => ({
        ...old,
        ...updates,
      }));
      
      // Optimistically update in project tasks list
      const projectId = previousTask?.project?._id || previousTask?.project;
      if (projectId) {
        queryClient.setQueryData(['projects', projectId, 'tasks'], (old) => {
          if (!old) return old;
          return old.map(task => 
            task._id === taskId ? { ...task, ...updates } : task
          );
        });
      }
      
      return { previousTask, projectId };
    },
    onSuccess: (updatedTask, { taskId }) => {
      queryClient.setQueryData(['tasks', taskId], updatedTask);
      
      // Invalidate project tasks to ensure consistency
      const projectId = updatedTask.project?._id || updatedTask.project;
      if (projectId) {
        queryClient.invalidateQueries({ 
          queryKey: ['projects', projectId, 'tasks'] 
        });
      }
    },
    onError: (error, { taskId }, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', taskId], context.previousTask);
        
        if (context.projectId) {
          queryClient.invalidateQueries({ 
            queryKey: ['projects', context.projectId, 'tasks'] 
          });
        }
      }
      toast.error(error.message || 'Failed to update task');
    },
  });
}

// Hook to delete task
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (taskId) => {
      // Get task to know which project to invalidate
      const task = queryClient.getQueryData(['tasks', taskId]);
      return { task };
    },
    onSuccess: (_, taskId, context) => {
      queryClient.removeQueries({ queryKey: ['tasks', taskId] });
      
      // Invalidate project tasks
      if (context?.task?.project) {
        const projectId = context.task.project._id || context.task.project;
        queryClient.invalidateQueries({ 
          queryKey: ['projects', projectId, 'tasks'] 
        });
      }
      
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });
}
