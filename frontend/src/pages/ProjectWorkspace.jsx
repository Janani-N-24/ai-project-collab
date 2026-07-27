import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import KanbanBoard from '../components/kanban/KanbanBoard.jsx';
import AITaskGenerator from '../components/ai/AITaskGenerator.jsx';
import { projectService } from '../services/projectService.js';
import { teamService } from '../services/teamService.js';

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const proj = await projectService.getById(projectId);
        setProject(proj);
        // Load the project's team so we can populate the assignee dropdown
        const team = await teamService.getById(proj.teamId);
        setMembers(team.members);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load this project');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  // Newly-saved AI tasks also arrive via Socket.IO, but bumping this key forces
  // an immediate re-fetch too, so the board is correct even if the socket briefly lagged.
  const handleAITasksSaved = () => setBoardRefreshKey((k) => k + 1);

  return (
    <DashboardLayout title={project?.title || 'Project Workspace'}>
      {loading ? (
        <p className="text-sm text-gray-500">Loading project...</p>
      ) : error ? (
        <div className="glass rounded-2xl p-6 text-sm text-red-700 bg-red-50 border border-red-200">
          {error}
        </div>
      ) : (
        <>
          <div className="glass rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{project.title}</h2>
              <p className="text-sm text-gray-600">{project.description || 'No description provided.'}</p>
              <p className="text-xs text-gray-400 mt-2">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setShowAIGenerator(true)}
              className="flex items-center justify-center gap-2 bg-brand-gradient text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity shrink-0"
            >
              <Sparkles size={16} />
              AI Task Assistant
            </button>
          </div>

          <KanbanBoard key={boardRefreshKey} projectId={projectId} members={members} />
        </>
      )}

      {showAIGenerator && (
        <AITaskGenerator
          projectId={projectId}
          onSaved={handleAITasksSaved}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default ProjectWorkspace;
