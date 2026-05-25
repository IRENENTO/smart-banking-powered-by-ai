import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { authApi } from '../services/api/client';
import { tokenStorage, secureStorage, storage, KEYS } from '../utils/storage';
import { router } from 'expo-router';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  isMfaEnabled: boolean;
  preferredLanguage: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  verifyOtp: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuthProvider = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        const userData = await secureStorage.get(KEYS.USER_DATA);
        if (userData) {
          setUser(JSON.parse(userData));
        }
        try {
          const response = await authApi.getProfile();
          const fetchedUser = response.data.data.user;
          setUser(fetchedUser);
          await secureStorage.set(KEYS.USER_DATA, JSON.stringify(fetchedUser));
        } catch {
          await tokenStorage.clearTokens();
          setUser(null);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const { user: userData, accessToken, refreshToken } = response.data.data;

    await tokenStorage.setTokens(accessToken, refreshToken);
    await secureStorage.set(KEYS.USER_DATA, JSON.stringify(userData));
    setUser(userData);

    router.replace('/(tabs)/dashboard');
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; phone?: string }) => {
    const response = await authApi.register(data);
    const { user: userData, accessToken, refreshToken } = response.data.data;

    await tokenStorage.setTokens(accessToken, refreshToken);
    await secureStorage.set(KEYS.USER_DATA, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    await authApi.verifyOtp({ email, otp });
    setUser((prev) => (prev ? { ...prev, isVerified: true } : prev));

    router.replace('/(auth)/biometric-setup');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {}
    await tokenStorage.clearTokens();
    await secureStorage.remove(KEYS.USER_DATA);
    setUser(null);
    router.replace('/(auth)/login');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      const userData = response.data.data.user;
      setUser(userData);
      await secureStorage.set(KEYS.USER_DATA, JSON.stringify(userData));
    } catch {}
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    verifyOtp,
    logout,
    refreshUser,
  };
};

export const useAuth = () => useContext(AuthContext);
