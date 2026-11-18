import { api } from './api';

export const authService = {
  async register(name, email, password) {
    const data = await api.post('/auth/register', { name, email, password });
    if (data.token) {
      api.setToken(data.token);
    }
    return data;
  },

  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    if (data.token) {
      api.setToken(data.token);
    }
    return data;
  },

  async getCurrentUser() {
    return await api.get('/auth/me');
  },

  async forgotPassword(email) {
    return await api.post('/auth/forgot-password', { email });
  },

  logout() {
    api.setToken(null);
  }
};
