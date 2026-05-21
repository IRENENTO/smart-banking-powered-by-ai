import client from '../api/client';
import { Transaction } from '../types';

export const transactionService = {
  fetchTransactions: async () => {
    const response = await client.get<{ transactions: Transaction[] }>('/transactions');
    return response.data.transactions;
  },

  fetchBalance: async () => {
    const response = await client.get<{ balance: number; account_number: string; currency: string }>('/transactions/balance');
    return response.data;
  },

  searchTransactions: async (query: string) => {
    const response = await client.get<{ transactions: Transaction[] }>('/transactions', {
      params: { q: query },
    });
    return response.data.transactions;
  },
};
