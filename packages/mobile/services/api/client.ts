import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage, secureStorage, KEYS } from '../../utils/storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          await tokenStorage.clearTokens();
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        await tokenStorage.setTokens(accessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        await tokenStorage.clearTokens();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  verifyOtp: (data: { email: string; otp: string }) =>
    apiClient.post('/auth/verify-otp', data),

  resendOtp: (data: { email: string }) =>
    apiClient.post('/auth/resend-otp', data),

  getProfile: () =>
    apiClient.get('/auth/profile'),

  updateProfile: (data: { name?: string; phone?: string; preferredLanguage?: string }) =>
    apiClient.put('/auth/profile', data),

  registerBiometric: (data: { publicKey: string }) =>
    apiClient.post('/auth/biometric', data),

  logout: () =>
    apiClient.post('/auth/logout'),
};

export const deviceApi = {
  register: (data: { deviceId: string; deviceName?: string; deviceModel?: string; osVersion?: string; fcmToken?: string }) =>
    apiClient.post('/devices/register', data),

  getAll: () =>
    apiClient.get('/devices'),

  getOne: (id: string) =>
    apiClient.get(`/devices/${id}`),

  update: (id: string, data: any) =>
    apiClient.put(`/devices/${id}`, data),

  sendCommand: (id: string, command: string) =>
    apiClient.post(`/devices/${id}/command`, { command }),
};

export const locationApi = {
  getHistory: (deviceId: string, params?: { from?: string; to?: string; page?: number; limit?: number }) =>
    apiClient.get(`/locations/${deviceId}`, { params }),

  getLatest: (deviceId: string) =>
    apiClient.get(`/locations/${deviceId}/latest`),

  getPath: (deviceId: string, params?: { from?: string; to?: string }) =>
    apiClient.get(`/locations/${deviceId}/path`, { params }),
};

export const alertApi = {
  getByDevice: (deviceId: string, params?: { page?: number; limit?: number; severity?: string; type?: string; resolved?: string }) =>
    apiClient.get(`/alerts/device/${deviceId}`, { params }),

  resolve: (id: string) =>
    apiClient.put(`/alerts/${id}/resolve`),
};

export default apiClient;
