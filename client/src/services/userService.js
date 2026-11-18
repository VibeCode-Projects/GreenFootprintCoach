import { api } from './api';

export const userService = {
  async getProfile() {
    return await api.get('/users/profile');
  },

  async updateProfile(updates) {
    return await api.patch('/users/profile', updates);
  },

  async getAchievements() {
    return await api.get('/users/achievements');
  }
};
