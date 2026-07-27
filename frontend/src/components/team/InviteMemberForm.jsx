import { useState } from 'react';
import { UserPlus } from 'lucide-react';

const InviteMemberForm = ({ onInvite }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError('Enter an email to invite');
      return;
    }
    setSubmitting(true);
    try {
      await onInvite(email.trim());
      setSuccess(`${email} added to the team`);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not invite this user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="teammate@example.com"
        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 bg-brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 whitespace-nowrap"
      >
        <UserPlus size={16} />
        {submitting ? 'Inviting...' : 'Invite'}
      </button>
      {error && <p className="text-sm text-red-600 sm:ml-2">{error}</p>}
      {success && <p className="text-sm text-green-600 sm:ml-2">{success}</p>}
    </form>
  );
};

export default InviteMemberForm;
