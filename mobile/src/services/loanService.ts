import client from '../api/client';

export interface LoanApplicationPayload {
  amount: number;
  duration: number;
  purpose: string;
  monthlyIncome: number;
  existingDebt: number;
}

export const loanService = {
  apply: async (payload: LoanApplicationPayload) => {
    const response = await client.post('/loans/apply', payload);
    return response.data;
  },

  checkEligibility: async (monthlyIncome: number, existingDebt: number) => {
    const response = await client.post('/loans/check-eligibility', { monthlyIncome, existingDebt });
    return response.data;
  },

  getLoans: async () => {
    const response = await client.get('/loans');
    return response.data;
  },
};
