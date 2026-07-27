import api from './api';

export const dashboardService = {
  getStats: (projectId) => api.get(`/dashboard/${projectId}`).then((res) => res.data.stats),
};
