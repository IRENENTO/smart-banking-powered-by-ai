import client from '../api/client';

export const fraudService = {
  fetchFraudAlerts: async () => {
    const response = await client.get('/admin/fraud-alerts');
    return response.data;
  },

  submitFraudCheck: async (payload: Record<string, unknown>) => {
    const response = await client.post('/admin/fraud-alerts', payload);
    return response.data;
  },
};
