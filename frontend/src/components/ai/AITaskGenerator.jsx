import { useState } from 'react';
import { X, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { aiService } from '../../services/aiService.js';
import { taskService } from '../../services/taskService.js';

const PRIORITIES = ['Low', 'Medium', 'High'];

const priorityStyles = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-green-100 text-green-700',
};

const AITaskGenerator = ({ projectId, onSaved, onClose }) => {
  const [description, setDescription] = useState('');
  const [suggestedTasks, setSuggestedTasks] = useState(null); // null = not generated yet
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Describe the project first (e.g. "We are building an online food delivery app")');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const tasks = await aiService.generateBreakdown(projectId, description.trim());
      // Give each suggestion a local, client-side id for stable editing/removal before save
      setSuggestedTasks(tasks.map((t, i) => ({ ...t, _localId: `suggestion-${i}-${Date.now()}` })));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'AI Task Assistant is temporarily unavailable. Please try again, or add tasks manually.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const updateSuggestion = (localId, field, value) => {
    setSuggestedTasks((prev) => prev.map((t) => (t._localId === localId ? { ...t, [field]: value } : t)));
  };

  const removeSuggestion = (localId) => {
    setSuggestedTasks((prev) => prev.filter((t) => t._localId !== localId));
  };

  const handleSaveAll = async () => {
    if (!suggestedTasks || suggestedTasks.length === 0) return;
    setSaving(true);
    setError('');
    try {
      // Sequentially create each task so ordering + Kanban card order stays predictable
      const created = [];
      for (const t of suggestedTasks) {
        // eslint-disable-next-line no-await-in-loop
        const task = await taskService.create({
          projectId,
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: 'To Do',
        });
        created.push(task);
      }
      onSaved(created);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Some tasks could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div className="glass w-full max-w-2xl rounded-2xl p-6 shadow-glass relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <h3 className="font-semibold text-gray-800">AI Task Assistant</h3>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {!suggestedTasks ? (
          <form onSubmit={handleGenerate} className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Describe your project</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='e.g. "We are building an online food delivery application."'
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-brand-gradient text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating tasks...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Tasks
                </>
              )}
            </button>
          </form>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">
              Review, edit, or remove suggestions below before saving them to your board.
            </p>

            <div className="space-y-3 mb-5">
              {suggestedTasks.map((t) => (
                <div key={t._localId} className="border border-gray-200 rounded-xl p-3 bg-white/70">
                  <div className="flex items-start gap-2">
                    <input
                      type="text"
                      value={t.title}
                      onChange={(e) => updateSuggestion(t._localId, 'title', e.target.value)}
                      className="flex-1 text-sm font-medium text-gray-800 border-b border-transparent hover:border-gray-200 focus:border-primary-400 focus:outline-none py-1"
                    />
                    <button
                      onClick={() => removeSuggestion(t._localId)}
                      className="text-gray-400 hover:text-red-500 shrink-0"
                      aria-label="Remove suggestion"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <textarea
                    value={t.description}
                    onChange={(e) => updateSuggestion(t._localId, 'description', e.target.value)}
                    rows={2}
                    className="w-full text-xs text-gray-600 mt-1 border-none focus:outline-none focus:ring-1 focus:ring-primary-300 rounded resize-none bg-transparent"
                  />
                  <select
                    value={t.priority}
                    onChange={(e) => updateSuggestion(t._localId, 'priority', e.target.value)}
                    className={`mt-2 text-[11px] font-medium px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-primary-300 ${priorityStyles[t.priority]}`}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {suggestedTasks.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  All suggestions removed. Regenerate or close this dialog.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSuggestedTasks(null)}
                className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving || suggestedTasks.length === 0}
                className="flex-1 bg-brand-gradient text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {saving ? 'Saving...' : `Save ${suggestedTasks.length} Task${suggestedTasks.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AITaskGenerator;
