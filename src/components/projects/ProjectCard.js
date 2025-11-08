'use client';

import Link from 'next/link';
import { FolderIcon, UsersIcon, CheckCircleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

const statusConfig = {
  active: { label: 'Active', icon: FolderIcon, color: 'text-blue-600 bg-blue-50' },
  completed: { label: 'Completed', icon: CheckCircleIcon, color: 'text-green-600 bg-green-50' },
  archived: { label: 'Archived', icon: ArchiveBoxIcon, color: 'text-gray-600 bg-gray-50' },
};

export default function ProjectCard({ project }) {
  const config = statusConfig[project.status] || statusConfig.active;
  const StatusIcon = config.icon;

  return (
    <Link href={`/projects/${project._id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-xs font-medium">{config.label}</span>
          </div>

          {/* Members Count */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <UsersIcon className="w-4 h-4" />
            <span className="text-sm">
              {(project.members?.length || 0) + 1} {/* +1 for owner */}
            </span>
          </div>
        </div>

        {/* Owner Info */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <span>Owner:</span>
          <div className="flex items-center gap-1.5">
            {project.owner?.avatar ? (
              <img
                src={project.owner.avatar}
                alt={project.owner.name}
                className="w-5 h-5 rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                {project.owner?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-gray-700">{project.owner?.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
