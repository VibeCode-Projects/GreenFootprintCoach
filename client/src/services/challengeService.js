import { api } from './api';

export const challengeService = {
  async getChallenges() {
    return await api.get('/challenges');
  },

  async joinChallenge(challengeId) {
    return await api.post('/challenges/join', { challengeId });
  },

  async updateProgress(challengeId) {
    return await api.patch(`/challenges/${challengeId}/progress`, {});
  },

  async getLeaderboard() {
    return await api.get('/challenges/leaderboard');
  }
};
