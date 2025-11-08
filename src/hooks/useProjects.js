'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const API_BASE = '/api/projects';

// Fetch all projects
async function fetchProjects() {
  const res = await fetch(API_BASE);
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch projects');
  }
  
  return data.data;
}

// Fetch single project
async function fetchProject(projectId) {
  const res = await fetch(`${API_BASE}/${projectId}`);
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch project');
  }
  
  return data.data;
}

// Fetch project tasks
async function fetchProjectTasks(projectId) {
  const res = await fetch(`${API_BASE}/${projectId}/tasks`);
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch tasks');
  }
  
  return data.data;
}

// Create project
async function createProject(projectData) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  });
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to create project');
  }
  
  return data.data;
}

// Update project
async function updateProject({ projectId, updates }) {
  const res = await fetch(`${API_BASE}/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to update project');
  }
  
  return data.data;
}

// Delete project
async function deleteProject(projectId) {
  const res = await fetch(`${API_BASE}/${projectId}`, {
    method: 'DELETE',
  });
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete project');
  }
  
  return data;
}

// Hook to get all projects
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get single project
export function useProject(projectId) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get project tasks
export function useProjectTasks(projectId) {
  return useQuery({
    queryKey: ['projects', projectId, 'tasks'],
    queryFn: () => fetchProjectTasks(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to create project
export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create project');
    },
  });
}

// Hook to update project
export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProject,
    onMutate: async ({ projectId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects', projectId] });
      
      // Snapshot previous value
      const previousProject = queryClient.getQueryData(['projects', projectId]);
      
      // Optimistically update
      queryClient.setQueryData(['projects', projectId], (old) => ({
        ...old,
        ...updates,
      }));
      
      return { previousProject };
    },
    onSuccess: (updatedProject, { projectId }) => {
      queryClient.setQueryData(['projects', projectId], updatedProject);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated successfully');
    },
    onError: (error, { projectId }, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(['projects', projectId], context.previousProject);
      }
      toast.error(error.message || 'Failed to update project');
    },
  });
}

// Hook to delete project
export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.removeQueries({ queryKey: ['projects', projectId] });
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete project');
    },
  });
}
