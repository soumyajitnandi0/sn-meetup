'use client';

import { useState } from 'react';
import { TrashIcon, PencilIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default function TaskCard({ task, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(task._id);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 flex-1 line-clamp-2">
          {task.title}
        </h3>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit task"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete task"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        {/* Priority Badge */}
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>

        <div className="flex items-center gap-2">
          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>
                {new Date(task.dueDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}

          {/* Assignee */}
          {task.assignee ? (
            <div className="flex items-center gap-1" title={task.assignee.name}>
              {task.assignee.avatar ? (
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center" title="Unassigned">
              <UserIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
