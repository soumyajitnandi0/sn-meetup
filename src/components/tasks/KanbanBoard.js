'use client';

import { useState, useMemo, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { useQueryClient } from '@tanstack/react-query';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const STATUSES = ['todo', 'in-progress', 'review', 'done'];

export default function KanbanBoard({ projectId, tasks, onTaskEdit }) {
  const [filters, setFilters] = useState({
    assignee: null,
    priority: null,
    dueDate: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const queryClient = useQueryClient();

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = STATUSES.reduce((acc, status) => {
      acc[status] = [];
      return acc;
    }, {});

    // Apply filters
    let filteredTasks = tasks;

    if (filters.assignee) {
      filteredTasks = filteredTasks.filter(
        task => task.assignee?._id === filters.assignee
      );
    }

    if (filters.priority) {
      filteredTasks = filteredTasks.filter(
        task => task.priority === filters.priority
      );
    }

    if (filters.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (filters.dueDate === 'overdue') {
          return dueDate < today && task.status !== 'done';
        } else if (filters.dueDate === 'today') {
          return dueDate.getTime() === today.getTime();
        } else if (filters.dueDate === 'week') {
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          return dueDate >= today && dueDate <= weekFromNow;
        }
        return true;
      });
    }

    // Group by status
    filteredTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    // Sort by order within each status
    Object.keys(grouped).forEach(status => {
      grouped[status].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    return grouped;
  }, [tasks, filters]);

  // Handle drag end
  const handleDragEnd = useCallback((result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const task = tasks.find(t => t._id === draggableId);

    if (!task) return;

    // Update task status
    updateTask.mutate({
      taskId: draggableId,
      updates: { status: newStatus },
    });
  }, [tasks, updateTask]);

  // Handle task deletion
  const handleDeleteTask = useCallback((taskId) => {
    deleteTask.mutate(taskId);
  }, [deleteTask]);

  // Listen to real-time task updates
  useSocketEvent('task_updated', useCallback((data) => {
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
  }, [queryClient, projectId]));

  useSocketEvent('task_created', useCallback((data) => {
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
  }, [queryClient, projectId]));

  useSocketEvent('task_deleted', useCallback((data) => {
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
  }, [queryClient, projectId]));

  useSocketEvent('board_refresh', useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
  }, [queryClient, projectId]));

  // Get unique assignees and priorities for filters
  const uniqueAssignees = useMemo(() => {
    const assignees = tasks
      .filter(task => task.assignee)
      .map(task => task.assignee);
    
    return Array.from(
      new Map(assignees.map(a => [a._id, a])).values()
    );
  }, [tasks]);

  const uniquePriorities = ['low', 'medium', 'high', 'critical'];

  const hasActiveFilters = filters.assignee || filters.priority || filters.dueDate;

  return (
    <div className="flex flex-col h-full">
      {/* Filter Bar */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            hasActiveFilters
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FunnelIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {[filters.assignee, filters.priority, filters.dueDate].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => setFilters({ assignee: null, priority: null, dueDate: null })}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Assignee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                value={filters.assignee || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value || null }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All assignees</option>
                {uniqueAssignees.map(assignee => (
                  <option key={assignee._id} value={assignee._id}>
                    {assignee.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value || null }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All priorities</option>
                {uniquePriorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <select
                value={filters.dueDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dueDate: e.target.value || null }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All dates</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due today</option>
                <option value="week">Due this week</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {STATUSES.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onEditTask={onTaskEdit}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
