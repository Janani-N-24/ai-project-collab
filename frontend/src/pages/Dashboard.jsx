import { useEffect, useState } from 'react';
import { ListTodo, Clock, CheckCircle2, CircleDashed } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import DashboardCharts from '../components/dashboard/DashboardCharts.jsx';
import { teamService } from '../services/teamService.js';
import { projectService } from '../services/projectService.js';
import { dashboardService } from '../services/dashboardService.js';

const Dashboard = () => {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState('');
  const [activeProjectId, setActiveProjectId] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load teams once, default to the first
  useEffect(() => {
    (async () => {
      try {
        const data = await teamService.getMine();
        setTeams(data);
        if (data.length > 0) setActiveTeamId(data[0]._id);
        else setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load teams');
        setLoading(false);
      }
    })();
  }, []);

  // Load projects whenever the active team changes, default to the first
  useEffect(() => {
    if (!activeTeamId) return;
    (async () => {
      try {
        const data = await projectService.getByTeam(activeTeamId);
        setProjects(data);
        setActiveProjectId(data.length > 0 ? data[0]._id : '');
        if (data.length === 0) setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load projects');
        setLoading(false);
      }
    })();
  }, [activeTeamId]);

  // Load stats whenever the active project changes
  useEffect(() => {
    if (!activeProjectId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStats(activeProjectId);
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load dashboard stats');
      } finally {
        setLoading(false);
      }
    })();
  }, [activeProjectId]);

  return (
    <DashboardLayout title="Dashboard">
      {teams.length === 0 && !loading ? (
        <div className="glass rounded-2xl p-8 text-center text-gray-500">
          <p className="font-medium">Create a team and a project to see stats here.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <select
              value={activeTeamId}
              onChange={(e) => setActiveTeamId(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>

            {projects.length > 0 && (
              <select
                value={activeProjectId}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {projects.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-gray-500">
              <p className="font-medium">This team has no projects yet.</p>
              <p className="text-sm mt-1">Create one from the Projects tab.</p>
            </div>
          ) : loading || !stats ? (
            <p className="text-sm text-gray-500">Loading stats...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={ListTodo} label="Total Tasks" value={stats.total} color="indigo" />
                <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="green" />
                <StatCard icon={Clock} label="In Progress" value={stats.inProgress} color="amber" />
                <StatCard icon={CircleDashed} label="Pending" value={stats.pending} color="gray" />
              </div>

              <div className="glass rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Overall Progress</h3>
                  <span className="text-sm font-bold text-primary-600">{stats.progressPercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-gradient rounded-full transition-all duration-500"
                    style={{ width: `${stats.progressPercentage}%` }}
                  />
                </div>
              </div>

              <DashboardCharts
                statusBreakdown={stats.statusBreakdown}
                priorityBreakdown={stats.priorityBreakdown}
              />
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
