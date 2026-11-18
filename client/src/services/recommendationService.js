import { api } from './api';

export const recommendationService = {
  async getRecommendations(params = {}) {
    return await api.get('/recommendations', params);
  },

  async generateRecommendations() {
    return await api.post('/recommendations/generate', {});
  },

  async updateStatus(id, status) {
    return await api.patch(`/recommendations/${id}`, { status });
  }
};
