import api from './api';

interface SecuritySettingsData {
  two_factor_enabled: boolean;
  sms_alerts: boolean;
  email_alerts: boolean;
  login_notifications: boolean;
  session_timeout: number;
}

interface NotificationSettingsData {
  email_transactions: boolean;
  sms_transactions: boolean;
  email_promotions: boolean;
  sms_promotions: boolean;
  push_notifications: boolean;
  weekly_summary: boolean;
}

interface PrivacySettingsData {
  data_sharing: boolean;
  analytics_consent: boolean;
  marketing_consent: boolean;
  public_profile: boolean;
  location_tracking: boolean;
}

interface TransactionLimitsData {
  daily_limit: number;
  weekly_limit: number;
  monthly_limit: number;
  single_transaction_limit: number;
}

interface UserPreferencesData {
  currency: string;
  language: string;
  timezone: string;
  date_format: string;
  theme: string;
}

export const settingsService = {
  // Security Settings
  getSecuritySettings: () => api.get('/settings/security'),
  updateSecuritySettings: (data: SecuritySettingsData) => api.put('/settings/security', data),

  // Notification Settings
  getNotificationSettings: () => api.get('/settings/notifications'),
  updateNotificationSettings: (data: NotificationSettingsData) => api.put('/settings/notifications', data),

  // Privacy Settings
  getPrivacySettings: () => api.get('/settings/privacy'),
  updatePrivacySettings: (data: PrivacySettingsData) => api.put('/settings/privacy', data),

  // Transaction Limits
  getTransactionLimits: () => api.get('/settings/limits'),
  updateTransactionLimits: (data: TransactionLimitsData) => api.put('/settings/limits', data),

  // User Preferences
  getUserPreferences: () => api.get('/settings/preferences'),
  updateUserPreferences: (data: UserPreferencesData) => api.put('/settings/preferences', data),

  // Cards Management
  getCards: () => api.get('/settings/cards'),
  addCard: (data: any) => api.post('/settings/cards', data),
  deleteCard: (id: number) => api.delete(`/settings/cards/${id}`),
  updateCardStatus: (id: number, status: string) => api.put(`/settings/cards/${id}/status`, { status }),
  setDefaultCard: (id: number) => api.put(`/settings/cards/${id}/default`),

  // Statements Management
  getStatements: () => api.get('/settings/statements'),
  generateStatement: (type: string) => api.post('/settings/statements/generate', { type }),
  incrementDownloadCount: (id: number) => api.put(`/settings/statements/${id}/download`)
};
