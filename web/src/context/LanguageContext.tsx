import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'rw' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

type TranslationKey = keyof typeof translations.en | 'nav.user' | 'nav.email';

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.accounts': 'Accounts',
    'nav.transactions': 'Transactions',
    'nav.cards': 'Cards',
    'nav.loans': 'Loans',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.notifications': 'Notifications',
    'nav.darkMode': 'Dark Mode',
    'nav.lightMode': 'Light Mode',
    'nav.user': 'User',
    'nav.email': 'Email',
    
    // Landing Page
    'landing.title': 'AI Smart Banking',
    'landing.subtitle': 'A full digital banking experience with AI-powered insights, payments, savings and smarter loans.',
    'landing.openAccount': 'Open Account',
    'landing.goToDashboard': 'Go to Dashboard',
    
    // Cards
    'card.accountBalance': 'Account Balance',
    'card.availableFunds': 'Available funds',
    'card.analyzeSpending': 'Analyze Spending',
    'card.financialHealth': 'Financial Health',
    'card.loanEligibility': 'Loan Eligibility',
    'card.checkEligibility': 'Check Eligibility',
    'card.aiInsight': 'AI Insight',
    'card.savingsProgress': 'Savings Progress',
    'card.recentTransactions': 'Recent Transactions',
    'card.viewAll': 'View all',
    'card.aiHighlights': 'AI Highlights',
    
    // Features
    'feature.aiPowered': 'AI-Powered Banking',
    'feature.aiDescription': 'Get personalized financial insights powered by advanced AI algorithms',
    'feature.smartPayments': 'Smart Payments',
    'feature.paymentsDescription': 'Seamless, instant payments with QR codes and mobile money integration',
    'feature.savingsGoals': 'Savings Goals',
    'feature.savingsDescription': 'Set and track your savings goals with intelligent recommendations',
    
    // Premium Features
    'premium.title': 'Premium Features',
    'premium.advanced': 'Advanced Analytics',
    'premium.advancedDesc': 'Deep insights into your spending patterns',
    'premium.priority': 'Priority Support',
    'premium.priorityDesc': '24/7 dedicated customer service',
    'premium.custom': 'Custom Loans',
    'premium.customDesc': 'Tailored loan products with better rates',
    
    // Stats
    'stats.users': 'Active Users',
    'stats.transactions': 'Transactions',
    'stats.satisfaction': 'Satisfaction Rate',
    'stats.countries': 'Countries',
    
    // Quick Start
    'quickStart.title': 'Quick Start',
    'quickStart.description': 'Get started with AI Smart Banking in just a few simple steps',
    'quickStart.start': 'Start Now',
    
    // Footer
    'footer.company': 'AI Smart Banking',
    'footer.tagline': 'Banking Reimagined',
    'footer.description': 'Experience the future of banking with our AI-powered financial platform. Smart, secure, and designed for you.',
    'footer.quickLinks': 'Quick Links',
    'footer.services': 'Services',
    'footer.contact': 'Contact Us',
    'footer.rights': 'All rights reserved',
    'footer.madeWith': 'Made with',
    'footer.in': 'in Rwanda',
    
    // Languages
    'lang.english': 'English',
    'lang.kinyarwanda': 'Kinyarwanda',
    'lang.french': 'Français',
    'lang.select': 'Select Language',
  },
  rw: {
    // Navigation
    'nav.home': 'Ahabanza',
    'nav.dashboard': 'Ibijyanye n\'ibijyanye',
    'nav.accounts': 'Akonti',
    'nav.transactions': 'Amasoko',
    'nav.cards': 'Akarita',
    'nav.loans': 'Amashanyarazi',
    'nav.settings': 'Igenamiterere',
    'nav.profile': 'Icyashushanyo',
    'nav.notifications': 'Amakuru',
    'nav.darkMode': 'Ibumbe',
    'nav.lightMode': 'Urumuri',
    'nav.user': 'Ukoreshanyije',
    'nav.email': 'Imeri',
    
    // Landing Page
    'landing.title': 'AI Smart Banking',
    'landing.subtitle': 'Ububiko bwa banki yakozwe muri mudasobwa hamwe nubumenyi bwikoranabuhanga ku mikoranire, amasoko, ubwishatira namashanyarizi meza',
    'landing.openAccount': 'Fungura Konti',
    'landing.goToDashboard': 'Kuri Ibijyanye n\'ibijyanye',
    
    // Cards
    'card.accountBalance': 'Imbalance ya Konti',
    'card.availableFunds': 'Amafaranga ari kugira',
    'card.analyzeSpending': 'Kureba imikoreshereze',
    'card.financialHealth': 'Ubwiza bw\'amafaranga',
    'card.loanEligibility': 'Uburyo bwo kubona amashanyarizi',
    'card.checkEligibility': 'Kureba uburyo',
    'card.aiInsight': 'Ubumenyi bwikoranabuhanga',
    'card.savingsProgress': 'Aho bigeze muri ubwishatira',
    'card.recentTransactions': 'Amasoko ashize',
    'card.viewAll': 'Kureba byose',
    'card.aiHighlights': 'Ibyiza bikurikira byikoranabuhanga',
    
    // Features
    'feature.aiPowered': 'Banki Ikora nikoranabuhanga',
    'feature.aiDescription': 'Wige ubumenyi ku mafaranga yawe kuva muri aligorite za ikoranabuhanga zizira',
    'feature.smartPayments': 'Amasoko meza',
    'feature.paymentsDescription': 'Amasoko yihuta yihuta hamwe namakode ya QR nubufatanye bwa mobili',
    'feature.savingsGoals': 'Intego zo kubika',
    'feature.savingsDescription': 'Shiraho no kubika intego zo kubika hamwe nibushishozi biza',
    
    // Premium Features
    'premium.title': 'Ibikorwa byiza',
    'premium.advanced': 'Ibyazamuriye',
    'premium.advancedDesc': 'Ubumenyi bunini ku mikoreshereze yawe ya mafaranga',
    'premium.priority': 'Serivisi ya mbere',
    'premium.priorityDesc': 'Abakiriya 24/7 bakora ku buryo bwihuse',
    'premium.custom': 'Amashanyarizi ahagije',
    'premium.customDesc': 'Amashanyarizi yakozwe ku buryo bwawe hamwe n\'ibiciro byiza',
    
    // Stats
    'stats.users': 'Abakoresha',
    'stats.transactions': 'Amasoko',
    'stats.satisfaction': 'Igipimo cyo kwishima',
    'stats.countries': 'Ibihugu',
    
    // Quick Start
    'quickStart.title': 'Tangira',
    'quickStart.description': 'Tangira no gukoresha AI Smart Banking muri burimunsi',
    'quickStart.start': 'Tangira nonaha',
    
    // Footer
    'footer.company': 'AI Smart Banking',
    'footer.tagline': 'Banki Yanditse',
    'footer.description': 'Uzire uburyi bwa banki hamwe nikoranabuhanga ryiza, ibikorwa byiza kandi byiza',
    'footer.quickLinks': 'Amahuza yihuta',
    'footer.services': 'Serivisi',
    'footer.contact': 'Twandikire',
    'footer.rights': 'Uburenganzira bwose bwarabitswe',
    'footer.madeWith': 'Yakozwe na',
    'footer.in': 'mu Rwanda',
    
    // Languages
    'lang.english': 'English',
    'lang.kinyarwanda': 'Kinyarwanda',
    'lang.french': 'Français',
    'lang.select': 'Hitamo Ururimi',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.dashboard': 'Tableau de bord',
    'nav.accounts': 'Comptes',
    'nav.transactions': 'Transactions',
    'nav.cards': 'Cartes',
    'nav.loans': 'Prêts',
    'nav.settings': 'Paramètres',
    'nav.profile': 'Profil',
    'nav.notifications': 'Notifications',
    'nav.darkMode': 'Mode Sombre',
    'nav.lightMode': 'Mode Clair',
    'nav.user': 'Utilisateur',
    'nav.email': 'Email',
    
    // Landing Page
    'landing.title': 'AI Smart Banking',
    'landing.subtitle': 'Une expérience bancaire entièrement numérique avec des aperçus alimentés par l\'IA, des paiements, des épargnes et des prêts plus intelligents',
    'landing.openAccount': 'Ouvrir un compte',
    'landing.goToDashboard': 'Aller au tableau de bord',
    
    // Cards
    'card.accountBalance': 'Solde du compte',
    'card.availableFunds': 'Fonds disponibles',
    'card.analyzeSpending': 'Analyser les dépenses',
    'card.financialHealth': 'Santé financière',
    'card.loanEligibility': 'Éligibilité au prêt',
    'card.checkEligibility': 'Vérifier l\'éligibilité',
    'card.aiInsight': 'Aperçu IA',
    'card.savingsProgress': 'Progrès d\'épargne',
    'card.recentTransactions': 'Transactions récentes',
    'card.viewAll': 'Voir tout',
    'card.aiHighlights': 'Points forts de l\'IA',
    
    // Features
    'feature.aiPowered': 'Banque alimentée par l\'IA',
    'feature.aiDescription': 'Obtenez des aperçus financiers personnalisés alimentés par des algorithmes d\'IA avancés',
    'feature.smartPayments': 'Paiements intelligents',
    'feature.paymentsDescription': 'Paiements instantanés et fluides avec codes QR et intégration mobile money',
    'feature.savingsGoals': 'Objectifs d\'épargne',
    'feature.savingsDescription': 'Définissez et suivez vos objectifs d\'épargne avec des recommandations intelligentes',
    
    // Premium Features
    'premium.title': 'Fonctionnalités premium',
    'premium.advanced': 'Analyses avancées',
    'premium.advancedDesc': 'Aperçus approfondis de vos habitudes de dépenses',
    'premium.priority': 'Support prioritaire',
    'premium.priorityDesc': 'Service client dédié 24/7',
    'premium.custom': 'Prêts personnalisés',
    'premium.customDesc': 'Produits de prêt sur mesure avec de meilleurs taux',
    
    // Stats
    'stats.users': 'Utilisateurs actifs',
    'stats.transactions': 'Transactions',
    'stats.satisfaction': 'Taux de satisfaction',
    'stats.countries': 'Pays',
    
    // Quick Start
    'quickStart.title': 'Démarrage rapide',
    'quickStart.description': 'Commencez avec AI Smart Banking en quelques étapes simples',
    'quickStart.start': 'Commencer maintenant',
    
    // Footer
    'footer.company': 'AI Smart Banking',
    'footer.tagline': 'Banque réimaginée',
    'footer.description': 'Découvrez l\'avenir de la banque avec notre plateforme financière alimentée par l\'IA. Intelligente, sécurisée et conçue pour vous.',
    'footer.quickLinks': 'Liens rapides',
    'footer.services': 'Services',
    'footer.contact': 'Nous contacter',
    'footer.rights': 'Tous droits réservés',
    'footer.madeWith': 'Fait avec',
    'footer.in': 'au Rwanda',
    
    // Languages
    'lang.english': 'English',
    'lang.kinyarwanda': 'Kinyarwanda',
    'lang.french': 'Français',
    'lang.select': 'Sélectionner la langue',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'rw', 'fr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
