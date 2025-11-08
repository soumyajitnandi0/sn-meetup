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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 p-10 hover:shadow-xl hover:border-blue-300 hover:scale-[1.02] transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-lg text-gray-600 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
          {/* Status Badge */}
          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full ${config.color}`}>
            <StatusIcon className="w-6 h-6" />
            <span className="text-base font-semibold">{config.label}</span>
          </div>

          {/* Members Count */}
          <div className="flex items-center gap-2.5 text-gray-500">
            <UsersIcon className="w-6 h-6" />
            <span className="text-lg font-semibold">
              {(project.members?.length || 0) + 1} {/* +1 for owner */}
            </span>
          </div>
        </div>

        {/* Owner Info */}
        <div className="mt-5 flex items-center gap-3 text-base text-gray-500">
          <span className="font-medium">Owner:</span>
          <div className="flex items-center gap-2.5">
            {project.owner?.avatar ? (
              <img
                src={project.owner.avatar}
                alt={project.owner.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                {project.owner?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-gray-700">{project.owner?.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
