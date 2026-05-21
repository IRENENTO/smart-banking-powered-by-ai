import client from '../api/client';

export interface InvestmentPayload {
  type: string;
  amount: number;
  duration: number;
  risk_level: 'low' | 'medium' | 'high';
  expected_return: number;
}

export const investmentService = {
  getInvestments: async () => {
    const response = await client.get('/investments');
    return response.data;
  },

  createInvestment: async (payload: InvestmentPayload) => {
    const response = await client.post('/investments', payload);
    return response.data;
  },

  getInvestmentTypes: async () => {
    const response = await client.get('/investments/types');
    return response.data;
  },
};
