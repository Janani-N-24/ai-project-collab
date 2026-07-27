import api from './api';

export const taskService = {
  getByProject: (projectId) => api.get(`/tasks?projectId=${projectId}`).then((res) => res.data.tasks),
  create: (payload) => api.post('/tasks', payload).then((res) => res.data.task),
  update: (taskId, updates) => api.put(`/tasks/${taskId}`, updates).then((res) => res.data.task),
  remove: (taskId) => api.delete(`/tasks/${taskId}`).then((res) => res.data),
  uploadAttachment: (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post(`/tasks/${taskId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data.task);
  },
};
