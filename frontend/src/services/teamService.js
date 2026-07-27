import api from './api';

export const teamService = {
  create: (name) => api.post('/teams', { name }).then((res) => res.data.team),
  getMine: () => api.get('/teams').then((res) => res.data.teams),
  getById: (teamId) => api.get(`/teams/${teamId}`).then((res) => res.data.team),
  inviteMember: (teamId, email) =>
    api.post(`/teams/${teamId}/members`, { email }).then((res) => res.data.team),
};
