import { api } from './api';

export const activityService = {
  // Analyze natural language via Google Gemini AI
  async analyzeNaturalLanguage(text, date) {
    return await api.post('/activities/analyze', { text, date });
  },

  // Save manual calculator entry
  async logManual(items, notes, date) {
    return await api.post('/activities/manual', { items, notes, date });
  },

  // Get paginated activities
  async getActivities(params = {}) {
    return await api.get('/activities', params);
  },

  // Get activity by ID
  async getActivityById(id) {
    return await api.get(`/activities/${id}`);
  },

  // Delete activity
  async deleteActivity(id) {
    return await api.delete(`/activities/${id}`);
  }
};
