'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCreateAutomation, useUpdateAutomation } from '@/hooks/useAutomations';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const schema = yup.object({
  name: yup.string().required('Automation name is required').max(100),
  enabled: yup.boolean(),
  trigger: yup.object({
    type: yup.string().oneOf(['status_change', 'assignment', 'priority_change']).required(),
    condition: yup.object({
      field: yup.string(),
      operator: yup.string().oneOf(['equals', 'not_equals', 'contains']),
      value: yup.string(),
    }),
  }).required(),
  actions: yup.array().of(
    yup.object({
      type: yup.string().oneOf(['update_status', 'assign_user', 'send_notification']).required(),
      params: yup.object(),
    })
  ).min(1, 'At least one action is required'),
}).required();

export default function AutomationForm({ projectId, automation, onCancel }) {
  const createAutomation = useCreateAutomation();
  const updateAutomation = useUpdateAutomation();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: automation?.name || '',
      enabled: automation?.enabled !== undefined ? automation.enabled : true,
      trigger: {
        type: automation?.trigger?.type || 'status_change',
        condition: automation?.trigger?.condition || { field: '', operator: 'equals', value: '' },
      },
      actions: automation?.actions || [{ type: 'send_notification', params: {} }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  });

  const triggerType = watch('trigger.type');

  const onSubmitForm = async (data) => {
    const formattedData = {
      ...data,
      project: projectId,
    };

    if (automation) {
      await updateAutomation.mutateAsync({
        automationId: automation._id,
        updates: formattedData,
      });
    } else {
      await createAutomation.mutateAsync(formattedData);
    }
    
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {automation ? 'Edit Automation' : 'Create New Automation'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Name and Enabled */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
              Automation Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Notify on high priority tasks"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('enabled')}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-900">Enabled</span>
            </label>
          </div>
        </div>

        {/* Trigger Section */}
        <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">When (Trigger)</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="trigger.type" className="block text-sm font-medium text-gray-900 mb-2">
                Trigger Type *
              </label>
              <select
                id="trigger.type"
                {...register('trigger.type')}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
              >
                <option value="status_change">Status Change</option>
                <option value="assignment">Task Assignment</option>
                <option value="priority_change">Priority Change</option>
              </select>
            </div>

            {/* Optional Condition */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Optional Condition</p>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  {...register('trigger.condition.field')}
                  placeholder="Field"
                  className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-400"
                />
                <select
                  {...register('trigger.condition.operator')}
                  className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                >
                  <option value="equals">Equals</option>
                  <option value="not_equals">Not Equals</option>
                  <option value="contains">Contains</option>
                </select>
                <input
                  type="text"
                  {...register('trigger.condition.value')}
                  placeholder="Value"
                  className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Then (Actions)</h3>
            <button
              type="button"
              onClick={() => append({ type: 'send_notification', params: {} })}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Action</span>
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <select
                      {...register(`actions.${index}.type`)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium mb-2"
                    >
                      <option value="update_status">Update Status</option>
                      <option value="assign_user">Assign User</option>
                      <option value="send_notification">Send Notification</option>
                    </select>
                    
                    <div className="text-xs text-gray-600 font-medium">
                      Action parameters can be configured after creation
                    </div>
                  </div>
                  
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {errors.actions && (
            <p className="mt-2 text-sm text-red-600">{errors.actions.message}</p>
          )}
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
          {isSubmitting ? 'Saving...' : automation ? 'Update Automation' : 'Create Automation'}
        </button>
      </div>
    </form>
  );
}
