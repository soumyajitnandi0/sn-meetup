'use client';

import { XMarkIcon, CalendarIcon, UserIcon, FlagIcon, ClockIcon } from '@heroicons/react/24/outline';

const priorityColors = {
  low: 'text-gray-700 bg-gray-100',
  medium: 'text-blue-700 bg-blue-100',
  high: 'text-orange-700 bg-orange-100',
  critical: 'text-red-700 bg-red-100',
};

const statusColors = {
  todo: 'text-gray-700 bg-gray-100',
  'in-progress': 'text-blue-700 bg-blue-100',
  review: 'text-yellow-700 bg-yellow-100',
  done: 'text-green-700 bg-green-100',
};

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

export default function TaskDetail({ task, onClose, onEdit }) {
  if (!task) return null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {task.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                  {statusLabels[task.status]}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Assignee */}
            <div className="flex items-start gap-3">
              <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Assignee</p>
                {task.assignee ? (
                  <div className="flex items-center gap-2 mt-1">
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
                    <span className="text-sm text-gray-900">{task.assignee.name}</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">Unassigned</p>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Due Date</p>
                {task.dueDate ? (
                  <p className={`text-sm mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {isOverdue && ' (Overdue)'}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">No due date</p>
                )}
              </div>
            </div>

            {/* Created By */}
            <div className="flex items-start gap-3">
              <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Created By</p>
                <p className="text-sm text-gray-900 mt-1">{task.createdBy?.name || 'Unknown'}</p>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start gap-3">
              <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Created</p>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Project Info */}
          {task.project && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Project</p>
              <p className="text-sm text-gray-900">{task.project.name}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onEdit(task);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
