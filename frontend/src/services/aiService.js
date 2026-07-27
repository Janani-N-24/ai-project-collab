import api from './api';

export const aiService = {
  generateBreakdown: (projectId, description) =>
    api.post(`/projects/${projectId}/ai-breakdown`, { description }).then((res) => res.data.tasks),
};
