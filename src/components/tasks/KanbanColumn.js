'use client';

import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-gray-100' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100' },
  review: { label: 'Review', color: 'bg-yellow-100' },
  done: { label: 'Done', color: 'bg-green-100' },
};

export default function KanbanColumn({ status, tasks, onEditTask, onDeleteTask }) {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100' };

  return (
    <div className="flex flex-col h-full min-w-[300px] bg-gray-50 rounded-lg">
      {/* Column Header */}
      <div className={`${config.color} px-4 py-3 rounded-t-lg border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{config.label}</h3>
          <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-600">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 space-y-3 overflow-y-auto ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
            style={{ minHeight: '200px' }}
          >
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? 'opacity-50' : ''}
                  >
                    <TaskCard
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No tasks
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
