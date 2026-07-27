import { useState } from 'react';
import { X } from 'lucide-react';

const CreateTeamForm = ({ onCreate, onClose }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Team name is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onCreate(name.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create team');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div className="glass w-full max-w-sm rounded-2xl p-6 shadow-glass relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={18} />
        </button>
        <h3 className="font-semibold text-gray-800 mb-4">Create a new team</h3>

        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Team Falcon"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-gradient text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create Team'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamForm;
