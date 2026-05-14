import api from './api';

export const otpService = {
  sendOTP: async (email: string) => {
    const response = await api.post('/otp/send-otp', { email });
    return response.data;
  },

  verifyOTP: async (email: string, otp: string) => {
    const response = await api.post('/otp/verify-otp', { email, otp });
    return response.data;
  }
};
