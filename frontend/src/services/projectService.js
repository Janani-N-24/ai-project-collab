import api from './api';

export const projectService = {
  create: (teamId, title, description) =>
    api.post('/projects', { teamId, title, description }).then((res) => res.data.project),
  getByTeam: (teamId) => api.get(`/projects?teamId=${teamId}`).then((res) => res.data.projects),
  getById: (projectId) => api.get(`/projects/${projectId}`).then((res) => res.data.project),
};
