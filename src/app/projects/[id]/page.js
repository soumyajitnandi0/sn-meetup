'use client';

import { useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useProject, useProjectTasks, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useProjectRoom } from '@/hooks/useProjectRoom';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import TaskForm from '@/components/tasks/TaskForm';
import TaskDetail from '@/components/tasks/TaskDetail';
import AutomationList from '@/components/automations/AutomationList';
import ProjectForm from '@/components/projects/ProjectForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  PlusIcon, 
  Cog6ToothIcon, 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';

export default function ProjectDetailPage({ params }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(null);
  const [showAutomations, setShowAutomations] = useState(false);
  const [showProjectEdit, setShowProjectEdit] = useState(false);

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useProjectTasks(projectId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  // Join project room for real-time updates
  useProjectRoom(projectId);

  const handleCreateTask = async (taskData) => {
    await createTask.mutateAsync(taskData);
    setShowTaskForm(false);
  };

  const handleUpdateTask = async (taskData) => {
    await updateTask.mutateAsync({
      taskId: editingTask._id,
      updates: taskData,
    });
    setEditingTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleUpdateProject = async (projectData) => {
    await updateProject.mutateAsync({
      projectId,
      updates: projectData,
    });
    setShowProjectEdit(false);
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? All tasks will be deleted.')) return;
    
    await deleteProject.mutateAsync(projectId);
    router.push('/projects');
  };

  if (projectLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (projectError || tasksError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg p-6 max-w-md">
          <p className="font-medium text-red-700">Error loading project</p>
          <p className="text-sm text-red-600 mt-1">
            {projectError?.message || tasksError?.message}
          </p>
          <button
            onClick={() => router.push('/projects')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // Get all project members (owner + members)
  const allMembers = project ? [
    project.owner,
    ...(project.members || [])
  ] : [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm">Back to Projects</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project?.name}</h1>
              {project?.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAutomations(!showAutomations)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showAutomations
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Cog6ToothIcon className="w-5 h-5" />
                <span>Automations</span>
              </button>

              <button
                onClick={() => setShowTaskForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>New Task</span>
              </button>

              <button
                onClick={() => setShowProjectEdit(true)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Edit project"
              >
                <PencilIcon className="w-5 h-5" />
              </button>

              <button
                onClick={handleDeleteProject}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Delete project"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Automations Section */}
        {showAutomations && (
          <div className="mb-6">
            <AutomationList projectId={projectId} />
          </div>
        )}

        {/* Kanban Board */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-6">
          <KanbanBoard
            projectId={projectId}
            tasks={tasks || []}
            onTaskEdit={handleEditTask}
          />
        </div>
      </div>

      {/* Task Form Modal */}
      {(showTaskForm || editingTask) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <TaskForm
              task={editingTask}
              projectId={projectId}
              projectMembers={allMembers}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && (
        <TaskDetail
          task={showTaskDetail}
          onClose={() => setShowTaskDetail(null)}
          onEdit={handleEditTask}
        />
      )}

      {/* Project Edit Modal */}
      {showProjectEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProjectForm
              project={project}
              onSubmit={handleUpdateProject}
              onCancel={() => setShowProjectEdit(false)}
            />
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
