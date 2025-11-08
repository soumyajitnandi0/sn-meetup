'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { XMarkIcon } from '@heroicons/react/24/outline';

const schema = yup.object({
  name: yup.string().required('Project name is required').max(100, 'Name must be less than 100 characters'),
  description: yup.string().max(500, 'Description must be less than 500 characters'),
  status: yup.string().oneOf(['active', 'completed', 'archived']).required(),
  members: yup.array().of(yup.string()),
}).required();

export default function ProjectForm({ project, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || 'active',
      members: project?.members?.map(m => m._id) || [],
    },
  });

  const onSubmitForm = async (data) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {project ? 'Edit Project' : 'Create New Project'}
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
        {/* Project Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
            Project Name *
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter project name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-400 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter project description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">
            Status *
          </label>
          <select
            id="status"
            {...register('status')}
            className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium ${
              errors.status ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Note about members */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Member management will be available after project creation. 
            You can add team members from the project detail page.
          </p>
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
          {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
