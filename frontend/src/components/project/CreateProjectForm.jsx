import { useState } from 'react';
import { X } from 'lucide-react';

const CreateProjectForm = ({ onCreate, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Project title is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onCreate(title.trim(), description.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div className="glass w-full max-w-md rounded-2xl p-6 shadow-glass relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={18} />
        </button>
        <h3 className="font-semibold text-gray-800 mb-4">New Project Workspace</h3>

        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Project Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Food Delivery App"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-gradient text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectForm;
