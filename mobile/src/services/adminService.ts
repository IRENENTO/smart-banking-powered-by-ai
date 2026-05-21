import client from '../api/client';

export const adminService = {
  getStats: async () => {
    const response = await client.get('/admin/stats');
    return response.data;
  },
  getUsers: async () => {
    const response = await client.get('/admin/users');
    return response.data;
  },
  getTransactions: async () => {
    const response = await client.get('/admin/transactions');
    return response.data;
  },
  getPayments: async () => {
    const response = await client.get('/admin/payments');
    return response.data;
  },
  getLoans: async () => {
    const response = await client.get('/admin/loans');
    return response.data;
  },
  getAnalytics: async () => {
    const response = await client.get('/admin/analytics');
    return response.data;
  },
};
