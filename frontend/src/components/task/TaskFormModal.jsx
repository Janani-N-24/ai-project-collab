import { useState, useEffect } from 'react';
import { X, Trash2, Paperclip } from 'lucide-react';
import { taskService } from '../../services/taskService.js';

const STATUSES = ['To Do', 'In Progress', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

// task === null means "create mode", otherwise "edit mode"
const TaskFormModal = ({ task, members = [], defaultStatus = 'To Do', onSave, onDelete, onClose }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'Medium',
    assignee: '',
    dueDate: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'To Do',
        priority: task.priority || 'Medium',
        assignee: task.assignee?._id || '',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    }
  }, [task]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFileError('');
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError('Only images (jpg, png, gif, webp) and PDF files are allowed');
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError('File exceeds the 5MB limit');
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Task title is required');
      return;
    }
    if (fileError) return;

    setSubmitting(true);
    setError('');
    try {
      const savedTask = await onSave({
        ...form,
        assignee: form.assignee || null,
        dueDate: form.dueDate || null,
      });

      // Upload the attachment only after the task exists (create needs an id first)
      if (file) {
        const taskId = savedTask?._id || task?._id;
        if (taskId) {
          setUploading(true);
          try {
            await taskService.uploadAttachment(taskId, file);
          } catch (uploadErr) {
            // Task itself saved fine; surface the upload failure without blocking the close
            setError(uploadErr.response?.data?.message || 'Task saved, but the file upload failed');
            setUploading(false);
            setSubmitting(false);
            return;
          }
          setUploading(false);
        }
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div className="glass w-full max-w-lg rounded-2xl p-6 shadow-glass relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={18} />
        </button>
        <h3 className="font-semibold text-gray-800 mb-4">{task ? 'Edit Task' : 'New Task'}</h3>

        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Assignee</label>
              <select
                name="assignee"
                value={form.assignee}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Unassigned</option>
                {members.map(({ user }) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Attachment (image or PDF, max 5MB)</label>
            {task?.fileUrl && !file && (
              <a
                href={task.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-2 text-sm text-primary-600 hover:underline"
              >
                <Paperclip size={14} />
                {task.fileName || 'View current attachment'}
              </a>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              onChange={handleFileChange}
              className="mt-1 w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700 file:text-sm hover:file:bg-primary-200"
            />
            {fileError && <p className="text-xs text-red-600 mt-1">{fileError}</p>}
            {file && <p className="text-xs text-gray-500 mt-1">Selected: {file.name}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !!fileError}
              className="flex-1 bg-brand-gradient text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {uploading ? 'Uploading file...' : submitting ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
            </button>
            {task && (
              <button
                type="button"
                onClick={() => {
                  onDelete(task._id);
                  onClose();
                }}
                className="p-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                aria-label="Delete task"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
