import client from '../api/client';

export const analyticsService = {
  fetchSpendingSummary: async () => {
    const response = await client.get('/insights');
    return response.data;
  },

  generateInsights: async () => {
    const response = await client.post('/insights/generate');
    return response.data;
  },
};
