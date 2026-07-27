import { useEffect, useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import KanbanColumn from './KanbanColumn.jsx';
import TaskCard from '../task/TaskCard.jsx';
import TaskFormModal from '../task/TaskFormModal.jsx';
import { taskService } from '../../services/taskService.js';
import { useSocket } from '../../context/SocketContext.jsx';

const STATUSES = ['To Do', 'In Progress', 'Done'];

const KanbanBoard = ({ projectId, members = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTask, setActiveTask] = useState(null); // task currently being dragged
  const [editingTask, setEditingTask] = useState(null); // task open in the edit modal
  const [showCreate, setShowCreate] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState('To Do');
  const { socket, joinProject, leaveProject } = useSocket();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getByProject(projectId);
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Join the project's real-time room and wire up event listeners.
  // Handlers are idempotent (merge by _id) so they're safe even if this
  // client also receives the broadcast for its own optimistic action.
  useEffect(() => {
    if (!socket) return;

    joinProject(projectId);

    const handleTaskCreated = (newTask) => {
      setTasks((prev) => (prev.some((t) => t._id === newTask._id) ? prev : [newTask, ...prev]));
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    };

    socket.on('taskCreated', handleTaskCreated);
    socket.on('taskUpdated', handleTaskUpdated);
    socket.on('taskStatusChanged', handleTaskUpdated);
    socket.on('taskDeleted', handleTaskDeleted);

    return () => {
      leaveProject(projectId);
      socket.off('taskCreated', handleTaskCreated);
      socket.off('taskUpdated', handleTaskUpdated);
      socket.off('taskStatusChanged', handleTaskUpdated);
      socket.off('taskDeleted', handleTaskDeleted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, projectId]);

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTaskItem = tasks.find((t) => t._id === active.id);
    if (!activeTaskItem) return;

    // `over.id` is either a column status (dropped on empty area) or another task's id
    const overTask = tasks.find((t) => t._id === over.id);
    const newStatus = overTask ? overTask.status : over.id;

    if (!STATUSES.includes(newStatus) || newStatus === activeTaskItem.status) return;

    // Optimistic update so the drag feels instant; rolled back on API failure
    const previousTasks = tasks;
    setTasks((prev) => prev.map((t) => (t._id === activeTaskItem._id ? { ...t, status: newStatus } : t)));

    try {
      await taskService.update(activeTaskItem._id, { status: newStatus });
    } catch (err) {
      setTasks(previousTasks);
      setError(err.response?.data?.message || 'Could not update task status');
    }
  };

  const handleCreate = (status) => {
    setCreateDefaultStatus(status);
    setShowCreate(true);
  };

  const handleSaveNewTask = async (formValues) => {
    const newTask = await taskService.create({ projectId, ...formValues });
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const handleSaveEdit = async (formValues) => {
    const updated = await taskService.update(editingTask._id, formValues);
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    return updated;
  };

  const handleDelete = async (taskId) => {
    const previousTasks = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await taskService.remove(taskId);
    } catch (err) {
      setTasks(previousTasks);
      setError(err.response?.data?.message || 'Could not delete task');
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading tasks...</p>;

  return (
    <div>
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUSES.map((status) => (
            <div key={status} className="flex flex-col">
              <KanbanColumn
                status={status}
                tasks={tasksByStatus(status)}
                onTaskClick={setEditingTask}
                onTaskDelete={handleDelete}
              />
              <button
                onClick={() => handleCreate(status)}
                className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 py-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <Plus size={14} />
                Add task
              </button>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onClick={() => {}} onDelete={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      {showCreate && (
        <TaskFormModal
          members={members}
          defaultStatus={createDefaultStatus}
          onSave={handleSaveNewTask}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editingTask && (
        <TaskFormModal
          task={editingTask}
          members={members}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
