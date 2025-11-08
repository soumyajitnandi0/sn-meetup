'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { XMarkIcon } from '@heroicons/react/24/outline';

const schema = yup.object({
  title: yup.string().required('Task title is required').max(200, 'Title must be less than 200 characters'),
  description: yup.string(),
  status: yup.string().oneOf(['todo', 'in-progress', 'review', 'done']).required(),
  priority: yup.string().oneOf(['low', 'medium', 'high', 'critical']).required(),
  assignee: yup.string().nullable(),
  dueDate: yup.date().nullable().transform((value, originalValue) => {
    return originalValue === '' ? null : value;
  }),
}).required();

export default function TaskForm({ task, projectId, projectMembers = [], onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      priority: task?.priority || 'medium',
      assignee: task?.assignee?._id || '',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    },
  });

  const onSubmitForm = async (data) => {
    const formattedData = {
      ...data,
      project: projectId,
      assignee: data.assignee || null,
      dueDate: data.dueDate || null,
    };
    await onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Task Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter task title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter task description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Status and Priority Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              {...register('status')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.status ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <select
              id="priority"
              {...register('priority')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.priority ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>
        </div>

        {/* Assignee and Due Date Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Assignee */}
          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
              Assignee
            </label>
            <select
              id="assignee"
              {...register('assignee')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.assignee ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Unassigned</option>
              {projectMembers.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
            {errors.assignee && (
              <p className="mt-1 text-sm text-red-600">{errors.assignee.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              {...register('dueDate')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.dueDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
