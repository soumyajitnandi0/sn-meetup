'use client';

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
}

export function KanbanBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="flex flex-col h-full min-w-[300px] bg-gray-50 rounded-lg">
          <div className="bg-gray-200 px-4 py-3 rounded-t-lg animate-pulse">
            <div className="h-5 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="flex-1 p-3 space-y-3">
            {[1, 2].map((task) => (
              <TaskCardSkeleton key={task} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
