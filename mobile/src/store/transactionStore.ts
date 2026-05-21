import { create } from 'zustand';
import { TransactionStoreState } from '../types';

export const useTransactionStore = create<TransactionStoreState>((set) => ({
  transactions: [],
  balance: 0,
  overview: {},
  isLoading: false,
  setTransactions: (transactions) => set({ transactions }),
  setBalance: (amount) => set({ balance: amount }),
  setOverview: (overview) => set({ overview }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
