import { api } from './api';

export const analyticsService = {
  // Top statistics cards and metrics
  async getSummary() {
    return await api.get('/analytics/summary');
  },

  // Daily trend line/area chart (7, 30, 90 days)
  async getDailyTrend(days = 7) {
    return await api.get('/analytics/daily', { days });
  },

  // Weekly bar chart
  async getWeekly() {
    return await api.get('/analytics/weekly');
  },

  // Category donut/pie chart
  async getCategories(days = 30) {
    return await api.get('/analytics/categories', { days });
  }
};
