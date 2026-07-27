import { useEffect, useState } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import CreateProjectForm from '../components/project/CreateProjectForm.jsx';
import ProjectCard from '../components/project/ProjectCard.jsx';
import { teamService } from '../services/teamService.js';
import { projectService } from '../services/projectService.js';

const Projects = () => {
  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState('');
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState('');

  // Load the user's teams once, default to the first one
  useEffect(() => {
    (async () => {
      try {
        const data = await teamService.getMine();
        setTeams(data);
        if (data.length > 0) setActiveTeamId(data[0]._id);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load teams');
      } finally {
        setLoadingTeams(false);
      }
    })();
  }, []);

  // Reload projects whenever the active team changes
  useEffect(() => {
    if (!activeTeamId) return;
    (async () => {
      try {
        setLoadingProjects(true);
        const data = await projectService.getByTeam(activeTeamId);
        setProjects(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load projects');
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, [activeTeamId]);

  const handleCreateProject = async (title, description) => {
    const project = await projectService.create(activeTeamId, title, description);
    setProjects((prev) => [project, ...prev]);
  };

  return (
    <DashboardLayout title="Projects">
      {loadingTeams ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : teams.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-gray-500">
          <p className="font-medium">You need a team before creating a project.</p>
          <p className="text-sm mt-1">Head to the Team tab to create or join one first.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
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

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center justify-center gap-2 bg-brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {loadingProjects ? (
            <p className="text-sm text-gray-500">Loading projects...</p>
          ) : projects.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-gray-500">
              <FolderKanban className="mx-auto mb-3 text-gray-400" size={28} />
              <p className="font-medium">No projects yet for this team.</p>
              <p className="text-sm mt-1">Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </>
      )}

      {showCreate && (
        <CreateProjectForm onCreate={handleCreateProject} onClose={() => setShowCreate(false)} />
      )}
    </DashboardLayout>
  );
};

export default Projects;
