import { create } from 'zustand';
import { PaymentStoreState } from '../types';

export const usePaymentStore = create<PaymentStoreState>((set) => ({
  lastPaymentStatus: '',
  isProcessing: false,
  error: null,
  setStatus: (status) => set({ lastPaymentStatus: status }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setError: (error) => set({ error }),
}));
