import client from '../api/client';
import { STORAGE_KEYS } from '../constants';
import { secureStorage } from '../utils/storage';
import { User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  sector: string;
  profileImage?: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await client.post('/auth/login', payload);
    const { token, user } = response.data;
    if (token && user) {
      await secureStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await secureStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    return { token, user } as { token: string; user: User };
  },

  register: async (payload: RegisterPayload) => {
    const response = await client.post('/auth/register', payload);
    return response.data;
  },

  verifyOTP: async (email: string, code: string) => {
    const response = await client.post('/otp/verify-otp', { email, code });
    return response.data;
  },
};
