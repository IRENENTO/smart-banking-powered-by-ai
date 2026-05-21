import { create } from 'zustand';
import { AuthStoreState, User } from '../types';

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user: User | null) => set({ user }),
  setToken: (token: string | null) => set({ token }),
  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  setLoading: (value: boolean) => set({ isLoading: value }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
