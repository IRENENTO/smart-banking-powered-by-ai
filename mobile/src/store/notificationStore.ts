import { create } from 'zustand';
import { NotificationStoreState } from '../types';

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  notifications: [],
  fraudAlerts: [],
  unreadCount: 0,
  isLoading: false,
  setNotifications: (items) => set({ notifications: items }),
  setFraudAlerts: (items) => set({ fraudAlerts: items }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
