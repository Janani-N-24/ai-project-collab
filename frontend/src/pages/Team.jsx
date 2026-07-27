import { useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import CreateTeamForm from '../components/team/CreateTeamForm.jsx';
import InviteMemberForm from '../components/team/InviteMemberForm.jsx';
import MemberList from '../components/team/MemberList.jsx';
import { teamService } from '../services/teamService.js';
import { useAuth } from '../context/AuthContext.jsx';

const Team = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamService.getMine();
      setTeams(data);
      // Keep the currently active team selected if it still exists, else default to the first
      setActiveTeam((prev) => data.find((t) => t._id === prev?._id) || data[0] || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateTeam = async (name) => {
    const team = await teamService.create(name);
    setTeams((prev) => [team, ...prev]);
    setActiveTeam(team);
  };

  const handleInvite = async (email) => {
    const updatedTeam = await teamService.inviteMember(activeTeam._id, email);
    setActiveTeam(updatedTeam);
    setTeams((prev) => prev.map((t) => (t._id === updatedTeam._id ? updatedTeam : t)));
  };

  const isOwner = activeTeam?.members?.some((m) => m.user._id === user?._id && m.role === 'owner');

  return (
    <DashboardLayout title="Team">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Team switcher / list */}
        <div className="glass rounded-2xl p-5 w-full lg:w-64 shrink-0 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm">Your Teams</h3>
            <button
              onClick={() => setShowCreate(true)}
              className="p-1.5 rounded-lg bg-brand-gradient text-white hover:opacity-90"
              aria-label="Create team"
            >
              <Plus size={16} />
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : teams.length === 0 ? (
            <p className="text-sm text-gray-500">No teams yet. Create one to get started.</p>
          ) : (
            <ul className="space-y-1">
              {teams.map((team) => (
                <li key={team._id}>
                  <button
                    onClick={() => setActiveTeam(team)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                      activeTeam?._id === team._id
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Users size={14} />
                    {team.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Active team detail */}
        <div className="glass rounded-2xl p-6 flex-1">
          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {!activeTeam ? (
            <p className="text-gray-500 text-sm">Select or create a team to see its members.</p>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">{activeTeam.name}</h2>
              <p className="text-sm text-gray-500 mb-5">
                {activeTeam.members.length} member{activeTeam.members.length !== 1 ? 's' : ''}
              </p>

              {isOwner && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Invite a member</p>
                  <InviteMemberForm onInvite={handleInvite} />
                  <p className="text-xs text-gray-400 mt-1">
                    They must already have an account on the platform.
                  </p>
                </div>
              )}

              <p className="text-sm font-medium text-gray-700 mb-2">Members</p>
              <MemberList members={activeTeam.members} />
            </>
          )}
        </div>
      </div>

      {showCreate && <CreateTeamForm onCreate={handleCreateTeam} onClose={() => setShowCreate(false)} />}
    </DashboardLayout>
  );
};

export default Team;
