import { create } from 'zustand';
import { AIStoreState } from '../types';

export const useAIStore = create<AIStoreState>((set) => ({
  insights: [],
  loanPrediction: undefined,
  fraudSignal: undefined,
  savingsPrediction: undefined,
  investmentForecasts: [],
  loading: false,
  setInsights: (insights) => set({ insights }),
  setLoanPrediction: (loanPrediction) => set({ loanPrediction }),
  setFraudSignal: (fraudSignal) => set({ fraudSignal }),
  setSavingsPrediction: (savingsPrediction) => set({ savingsPrediction }),
  setInvestmentForecasts: (investmentForecasts) => set({ investmentForecasts }),
  setLoading: (loading) => set({ loading }),
}));
