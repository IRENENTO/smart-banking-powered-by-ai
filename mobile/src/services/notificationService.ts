import client from '../api/client';

export const notificationService = {
  fetchNotifications: async () => {
    const response = await client.get('/notifications');
    return response.data;
  },
  fetchFraudAlerts: async () => {
    const response = await client.get('/fraud/alerts');
    return response.data;
  },
};
