'use client';

import { useState } from 'react';
import { useAutomations, useUpdateAutomation, useDeleteAutomation } from '@/hooks/useAutomations';
import { PlusIcon, BoltIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import AutomationForm from './AutomationForm';

const triggerLabels = {
  status_change: 'Status Change',
  assignment: 'Task Assignment',
  priority_change: 'Priority Change',
};

const actionLabels = {
  update_status: 'Update Status',
  assign_user: 'Assign User',
  send_notification: 'Send Notification',
};

export default function AutomationList({ projectId }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);

  const { data: automations, isLoading, error } = useAutomations(projectId);
  const updateAutomation = useUpdateAutomation();
  const deleteAutomation = useDeleteAutomation();

  const handleToggleEnabled = async (automation) => {
    await updateAutomation.mutateAsync({
      automationId: automation._id,
      updates: { enabled: !automation.enabled },
    });
  };

  const handleDelete = async (automationId) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;
    await deleteAutomation.mutateAsync(automationId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error loading automations</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Automations</h2>
          <p className="text-sm text-gray-600 mt-1">
            Automate repetitive tasks with workflow rules
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Automation</span>
        </button>
      </div>

      {/* Automations List */}
      {automations && automations.length > 0 ? (
        <div className="space-y-3">
          {automations.map(automation => (
            <div
              key={automation._id}
              className={`bg-white rounded-lg border p-4 transition-all ${
                automation.enabled
                  ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Name and Status */}
                  <div className="flex items-center gap-3 mb-2">
                    <BoltIcon className={`w-5 h-5 ${automation.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                    <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={automation.enabled}
                        onChange={() => handleToggleEnabled(automation)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Trigger */}
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">When:</span>{' '}
                    <span className="text-gray-900">{triggerLabels[automation.trigger.type]}</span>
                    {automation.trigger.condition?.field && (
                      <span>
                        {' '}({automation.trigger.condition.field} {automation.trigger.condition.operator} {automation.trigger.condition.value})
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Then:</span>{' '}
                    {automation.actions.map((action, index) => (
                      <span key={index}>
                        {index > 0 && ', '}
                        <span className="text-gray-900">{actionLabels[action.type]}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setEditingAutomation(automation)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit automation"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(automation._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete automation"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BoltIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No automations yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first automation to streamline your workflow
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Automation</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateForm || editingAutomation) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <AutomationForm
              projectId={projectId}
              automation={editingAutomation}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingAutomation(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
