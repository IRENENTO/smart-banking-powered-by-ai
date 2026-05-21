export const API_CONFIG = {
  BASE_URL: 'http://YOUR_LOCAL_IP:5000/api',
  AI_ENGINE_URL: 'http://YOUR_LOCAL_IP:8000/api/ai',
  TIMEOUT: 15000,
};

export const APP_CONFIG = {
  APP_NAME: 'SMART BANKING POWERED BY AI',
  CURRENCY: 'RWF',
  OTP_LENGTH: 6,
  OTP_RESEND_TIMER: 60,
  SPLASH_DURATION: 2200,
};

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  THEME: 'theme_preference',
  LOCALE: 'locale_preference',
  REMEMBER_ME: 'remember_me',
  BIOMETRIC_ENABLED: 'biometric_enabled',
};

export const SECTORS = [
  'Agriculture',
  'Education',
  'Healthcare',
  'Technology',
  'Finance',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Transportation',
  'Hospitality',
  'Energy',
  'Telecommunications',
  'Construction',
  'Mining',
  'Other',
];

export const QUICK_ACTIONS = [
  { id: 'send-money', label: 'Send Money', icon: 'send', route: 'Payments' },
  { id: 'withdraw', label: 'Withdraw', icon: 'bank-transfer-out', route: 'Transactions' },
  { id: 'airtime', label: 'Airtime', icon: 'cellphone', route: 'Payments' },
  { id: 'bills', label: 'Pay Bills', icon: 'receipt', route: 'Payments' },
  { id: 'qr-pay', label: 'QR Pay', icon: 'qrcode', route: 'Payments' },
  { id: 'mobile-money', label: 'Mobile Money', icon: 'wallet', route: 'Payments' },
];

export const HOME_SHORTCUTS = [
  { id: 'savings', label: 'Savings', icon: 'piggy-bank', route: 'Savings' },
  { id: 'analytics', label: 'Analytics', icon: 'chart-areaspline', route: 'Analytics' },
  { id: 'fraud-alerts', label: 'Fraud Alerts', icon: 'alert-circle', route: 'FraudAlerts' },
  { id: 'security', label: 'Security', icon: 'shield-lock', route: 'Security' },
];

export const FILTER_OPTIONS = {
  TRANSACTION_TYPES: ['all', 'deposit', 'withdraw', 'payment', 'transfer'],
  LOAN_STATUS: ['all', 'pending', 'approved', 'rejected', 'active', 'completed'],
  PAYMENT_STATUS: ['all', 'pending', 'completed', 'failed'],
};
