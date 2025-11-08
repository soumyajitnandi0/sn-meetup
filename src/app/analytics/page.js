'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ChartBarIcon, FolderIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const { data: analytics, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg p-6">
              <p className="font-medium text-red-700">Error loading analytics</p>
              <p className="text-sm text-red-600 mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const stats = [
    { name: 'Total Projects', value: analytics?.stats.totalProjects || 0, icon: FolderIcon, color: 'bg-blue-500' },
    { name: 'Completed Tasks', value: analytics?.stats.doneTasks || 0, icon: CheckCircleIcon, color: 'bg-green-500' },
    { name: 'In Progress', value: analytics?.stats.inProgressTasks || 0, icon: ClockIcon, color: 'bg-yellow-500' },
    { name: 'Total Tasks', value: analytics?.stats.totalTasks || 0, icon: ChartBarIcon, color: 'bg-purple-500' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-lg text-gray-600">Track your productivity and project insights</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-4 rounded-xl`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Status</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Active</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {analytics?.stats.activeProjects || 0} ({analytics?.projectPercentages.active || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${analytics?.projectPercentages.active || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {analytics?.stats.completedProjects || 0} ({analytics?.projectPercentages.completed || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${analytics?.projectPercentages.completed || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Archived</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {analytics?.stats.archivedProjects || 0} ({analytics?.projectPercentages.archived || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gray-500 h-3 rounded-full" style={{ width: `${analytics?.projectPercentages.archived || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Completion Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Task Status</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Done</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {analytics?.stats.doneTasks || 0} ({analytics?.taskPercentages.done || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${analytics?.taskPercentages.done || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">In Progress</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {analytics?.stats.inProgressTasks || 0} ({analytics?.taskPercentages.inProgress || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${analytics?.taskPercentages.inProgress || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">To Do</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {analytics?.stats.todoTasks || 0} ({analytics?.taskPercentages.todo || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-400 h-3 rounded-full" style={{ width: `${analytics?.taskPercentages.todo || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Review</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {analytics?.stats.reviewTasks || 0} ({analytics?.taskPercentages.review || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full" style={{ width: `${analytics?.taskPercentages.review || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentActivity.map((activity, index) => {
                  const statusColors = {
                    'todo': 'bg-blue-500',
                    'in-progress': 'bg-yellow-500',
                    'review': 'bg-purple-500',
                    'done': 'bg-green-500',
                  };
                  
                  const timeAgo = (date) => {
                    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
                    if (seconds < 60) return 'just now';
                    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
                    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
                    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
                    return new Date(date).toLocaleDateString();
                  };
                  
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 ${statusColors[activity.status] || 'bg-gray-500'} rounded-full`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {activity.project} • {timeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
