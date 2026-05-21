import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { ThemeMode, Locale } from '../types';
import { colors, gradients } from '../theme';

type AppContextValue = {
  theme: ThemeMode;
  locale: Locale;
  strings: Record<string, string>;
  themeColors: typeof colors.dark;
  gradients: typeof gradients;
  setLocale: (locale: Locale) => void;
  toggleTheme: () => void;
};

const translations: Record<Locale, Record<string, string>> = {
  en: {
    home: 'Home',
    insights: 'AI Insights',
    payments: 'Payments',
    investments: 'Investments',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    verifyOtp: 'Verify OTP',
    totalBalance: 'Total Balance',
    recentTransactions: 'Recent Transactions',
    quickActions: 'Quick Actions',
    spendingAnalytics: 'Spending Analytics',
    loanEligibility: 'Loan Eligibility',
    savingsGoals: 'Savings Goals',
    fraudAlerts: 'Fraud Alerts',
    notifications: 'Notifications',
    security: 'Security',
    adminDashboard: 'Admin Dashboard',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember Me',
    biometricLogin: 'Biometric Login',
    sector: 'Sector',
    uploadProfile: 'Upload Profile Image',
    resendOtp: 'Resend Code',
    countdown: 'seconds',
    applyLoan: 'Apply Now',
    viewAll: 'View All',
    everyday: 'Everyday Banking',
    manage: 'Manage',
    healthScore: 'Financial Health',
    savings: 'Savings',
    analytics: 'Analytics',
    recent: 'Recent',
  },
  fr: {
    home: 'Accueil',
    insights: 'Insights IA',
    payments: 'Paiements',
    investments: 'Investissements',
    profile: 'Profil',
    login: 'Connexion',
    register: 'Inscription',
    verifyOtp: 'Vérifier OTP',
    totalBalance: 'Solde Total',
    recentTransactions: 'Transactions Récentes',
    quickActions: 'Actions Rapides',
    spendingAnalytics: 'Analyse Dépenses',
    loanEligibility: 'Éligibilité Prêt',
    savingsGoals: 'Objectifs Épargne',
    fraudAlerts: 'Alertes Fraude',
    notifications: 'Notifications',
    security: 'Sécurité',
    adminDashboard: 'Tableau Admin',
    email: 'Email',
    password: 'Mot de passe',
    rememberMe: 'Se souvenir de moi',
    biometricLogin: 'Connexion biométrique',
    sector: 'Secteur',
    uploadProfile: 'Télécharger une photo',
    resendOtp: 'Renvoyer le code',
    countdown: 'secondes',
    applyLoan: 'Postuler maintenant',
    viewAll: 'Voir tout',
    everyday: 'Banque Quotidienne',
    manage: 'Gérer',
    healthScore: 'Santé Financière',
    savings: 'Économies',
    analytics: 'Analyse',
    recent: 'Récent',
  },
  rw: {
    home: 'Ahabanza',
    insights: 'Ubuhanga bwa AI',
    payments: 'Amadolari',
    investments: 'Ishoramari',
    profile: 'Umwirondoro',
    login: 'Injira',
    register: 'Iyandikishe',
    verifyOtp: 'Genura OTP',
    totalBalance: 'Umusaruro Wose',
    recentTransactions: 'Imirimo Iheruka',
    quickActions: 'Ibikorwa Byihuse',
    spendingAnalytics: 'Isesengura ry’ikoreshwa',
    loanEligibility: 'Kwakira Inguzanyo',
    savingsGoals: 'Intego z’Izigama',
    fraudAlerts: 'Imirangisho y’Ubujura',
    notifications: 'Ibyamenyeshejwe',
    security: 'Umutekano',
    adminDashboard: 'Dashboard ya Admin',
    email: 'Email',
    password: 'Ijambo ry’ibanga',
    rememberMe: 'Wibuke',
    biometricLogin: 'Injira na biometrics',
    sector: 'Urwego',
    uploadProfile: 'Ohereza ifoto',
    resendOtp: 'Sangiza code',
    countdown: 'amasegonda',
    applyLoan: 'Saba ubu',
    viewAll: 'Reba byose',
    everyday: 'Banki ya buri munsi',
    manage: 'Gutegeka',
    healthScore: 'Ubuzima bw’Imari',
    savings: 'Izigama',
    analytics: 'Isesengura',
    recent: 'Biheruka',
  },
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [locale, setLocale] = useState<Locale>('en');

  const value = useMemo(
    () => ({
      theme,
      locale,
      strings: translations[locale],
      themeColors: colors.dark,
      gradients,
      setLocale,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme, locale]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
