import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from '../task/TaskCard.jsx';

const columnStyles = {
  'To Do': 'border-t-4 border-gray-300',
  'In Progress': 'border-t-4 border-amber-400',
  Done: 'border-t-4 border-green-400',
};

const KanbanColumn = ({ status, tasks, onTaskClick, onTaskDelete }) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex flex-col w-full min-w-[260px]">
      <div className={`glass rounded-t-xl px-4 py-3 ${columnStyles[status]}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">{status}</h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 bg-black/[0.02] rounded-b-xl p-3 space-y-3 min-h-[200px]">
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={onTaskClick} onDelete={onTaskDelete} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">Drop tasks here</p>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
