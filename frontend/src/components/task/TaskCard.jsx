import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Paperclip, Trash2 } from 'lucide-react';

const priorityStyles = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-green-100 text-green-700',
};

const TaskCard = ({ task, onClick, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{task.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task._id);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity shrink-0"
          aria-label="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {task.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{task.description}</p>}

      <div className="flex items-center flex-wrap gap-2 mt-3">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
        {dueDate && (
          <span
            className={`flex items-center gap-1 text-[11px] ${
              isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
            }`}
          >
            <Calendar size={11} />
            {dueDate}
          </span>
        )}
        {task.fileUrl && (
          <span className="flex items-center gap-1 text-[11px] text-gray-500">
            <Paperclip size={11} />
          </span>
        )}
      </div>

      {task.assignee && (
        <div className="flex items-center gap-1.5 mt-3">
          <div className="w-5 h-5 rounded-full bg-brand-gradient flex items-center justify-center text-white text-[10px] font-semibold">
            {task.assignee.name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-[11px] text-gray-500">{task.assignee.name}</span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
