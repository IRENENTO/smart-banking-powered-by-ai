import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../constants';
import { secureStorage } from '../utils/storage';
import { useAuthStore } from '../store/authStore';

const client = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const authStore = useAuthStore.getState();
    if (error.response?.status === 401) {
      await secureStorage.removeItem('auth_token');
      await secureStorage.removeItem('user_data');
      authStore.logout();
    }
    return Promise.reject(error);
  }
);

export default client;
