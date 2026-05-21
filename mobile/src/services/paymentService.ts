import client from '../api/client';

export const paymentService = {
  sendMoney: async (recipientAccount: string, amount: number, description?: string) => {
    const response = await client.post('/payment/payment', {
      recipient_account_number: recipientAccount,
      amount,
      description,
    });
    return response.data;
  },

  withdraw: async (amount: number, phoneNumber?: string, description?: string) => {
    const response = await client.post('/payment/withdraw', { amount, phoneNumber, description });
    return response.data;
  },

  airtime: async (phoneNumber: string, amount: number) => {
    const response = await client.post('/payment/withdraw', {
      amount,
      phoneNumber,
      description: 'Airtime purchase',
    });
    return response.data;
  },

  billPayment: async (amount: number, description: string, recipientAccount: string) => {
    const response = await client.post('/payment/payment', {
      recipient_account_number: recipientAccount,
      amount,
      description,
    });
    return response.data;
  },
};
