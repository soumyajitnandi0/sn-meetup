'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const API_BASE = '/api/automations';

// Fetch automations for a project
async function fetchAutomations(projectId) {
  const res = await fetch(`${API_BASE}?projectId=${projectId}`);
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch automations');
  }
  
  return data.data;
}

// Fetch single automation
async function fetchAutomation(automationId) {
  const res = await fetch(`${API_BASE}/${automationId}`);
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch automation');
  }
  
  return data.data;
}

// Create automation
async function createAutomation(automationData) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(automationData),
  });
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to create automation');
  }
  
  return data.data;
}

// Update automation
async function updateAutomation({ automationId, updates }) {
  const res = await fetch(`${API_BASE}/${automationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to update automation');
  }
  
  return data.data;
}

// Delete automation
async function deleteAutomation(automationId) {
  const res = await fetch(`${API_BASE}/${automationId}`, {
    method: 'DELETE',
  });
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete automation');
  }
  
  return data;
}

// Hook to get automations for a project
export function useAutomations(projectId) {
  return useQuery({
    queryKey: ['automations', projectId],
    queryFn: () => fetchAutomations(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get single automation
export function useAutomation(automationId) {
  return useQuery({
    queryKey: ['automations', 'detail', automationId],
    queryFn: () => fetchAutomation(automationId),
    enabled: !!automationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to create automation
export function useCreateAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAutomation,
    onSuccess: (newAutomation) => {
      // Invalidate automations list for the project
      queryClient.invalidateQueries({ 
        queryKey: ['automations', newAutomation.project._id || newAutomation.project] 
      });
      toast.success('Automation created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create automation');
    },
  });
}

// Hook to update automation
export function useUpdateAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateAutomation,
    onMutate: async ({ automationId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['automations', 'detail', automationId] });
      
      // Snapshot previous value
      const previousAutomation = queryClient.getQueryData(['automations', 'detail', automationId]);
      
      // Optimistically update
      queryClient.setQueryData(['automations', 'detail', automationId], (old) => ({
        ...old,
        ...updates,
      }));
      
      return { previousAutomation };
    },
    onSuccess: (updatedAutomation, { automationId }) => {
      queryClient.setQueryData(['automations', 'detail', automationId], updatedAutomation);
      
      // Invalidate automations list
      const projectId = updatedAutomation.project?._id || updatedAutomation.project;
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['automations', projectId] });
      }
      
      toast.success('Automation updated successfully');
    },
    onError: (error, { automationId }, context) => {
      // Rollback on error
      if (context?.previousAutomation) {
        queryClient.setQueryData(['automations', 'detail', automationId], context.previousAutomation);
      }
      toast.error(error.message || 'Failed to update automation');
    },
  });
}

// Hook to delete automation
export function useDeleteAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAutomation,
    onMutate: async (automationId) => {
      // Get automation to know which project to invalidate
      const automation = queryClient.getQueryData(['automations', 'detail', automationId]);
      return { automation };
    },
    onSuccess: (_, automationId, context) => {
      queryClient.removeQueries({ queryKey: ['automations', 'detail', automationId] });
      
      // Invalidate automations list
      if (context?.automation?.project) {
        const projectId = context.automation.project._id || context.automation.project;
        queryClient.invalidateQueries({ queryKey: ['automations', projectId] });
      }
      
      toast.success('Automation deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete automation');
    },
  });
}
