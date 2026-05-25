import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  DEVICE_ID: 'device_id',
  SETTINGS: 'app_settings',
  BIOMETRIC_ENABLED: 'biometric_enabled',
};

export const secureStorage = {
  async set(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error('SecureStore set error:', e);
    }
  },

  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error('SecureStore get error:', e);
      return null;
    }
  },

  async remove(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error('SecureStore remove error:', e);
    }
  },
};

export const storage = {
  async set(key: string, value: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('AsyncStorage set error:', e);
    }
  },

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('AsyncStorage get error:', e);
      return null;
    }
  },

  async remove(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('AsyncStorage remove error:', e);
    }
  },
};

export const tokenStorage = {
  async setTokens(accessToken: string, refreshToken: string) {
    await secureStorage.set(KEYS.AUTH_TOKEN, accessToken);
    await secureStorage.set(KEYS.REFRESH_TOKEN, refreshToken);
  },

  async getAccessToken(): Promise<string | null> {
    return secureStorage.get(KEYS.AUTH_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return secureStorage.get(KEYS.REFRESH_TOKEN);
  },

  async clearTokens() {
    await secureStorage.remove(KEYS.AUTH_TOKEN);
    await secureStorage.remove(KEYS.REFRESH_TOKEN);
  },
};

export { KEYS };
