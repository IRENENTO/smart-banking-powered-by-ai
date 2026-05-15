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
    
    // Loan Application
    'loanApplication.title': 'Intelligent Loan Application',
    'loanApplication.subtitle': 'Complete the form and submit for AI-powered loan approval.',
    'loanApplication.loading': 'Loading your profile information...',
    'loanApplication.profileComplete': 'Profile Complete - Loan Eligible',
    'loanApplication.profileIncomplete': 'Profile Incomplete - Action Required',
    'loanApplication.profileCompleteDesc': 'Your profile is complete. You can apply for loans with AI-powered approval.',
    'loanApplication.profileIncompleteDesc': 'Please complete your profile identification details before applying for a loan.',
    'loanApplication.completeProfile': 'Complete Profile Now',
    'loanApplication.aiPrediction': 'AI Loan Prediction',
    'loanApplication.aiPredictionDesc': 'Get personalized loan estimates based on your profile',
    'loanApplication.buildCredit': 'Start transacting to build your credit profile for better loan eligibility.',
    'loanApplication.requestedAmount': 'Requested Amount (RWF)',
    'loanApplication.maxEligible': 'Max eligible',
    'loanApplication.monthlyIncome': 'Monthly Income (RWF)',
    'loanApplication.sector': 'Sector',
    'loanApplication.employee': 'Employee',
    'loanApplication.agriculture': 'Agriculture',
    'loanApplication.sme': 'SME',
    'loanApplication.informal': 'Informal',
    'loanApplication.student': 'Student',
    'loanApplication.existingDebt': 'Existing Monthly Debt (RWF)',
    'loanApplication.purpose': 'Loan Purpose',
    'loanApplication.completeProfileFirst': 'Complete Profile First',
    'loanApplication.submit': 'Submit for AI Approval',
    
    // Loan Deduction
    'loanApplication.deductionAmount': 'Deduction Amount (per period)',
    'loanApplication.deductionPeriod': 'Deduction Period',
    'loanApplication.deductionPeriodDaily': 'Daily',
    'loanApplication.deductionPeriodWeekly': 'Weekly',
    'loanApplication.deductionPeriodMonthly': 'Monthly',
    'loanApplication.deductionInfo': 'Set up auto-deduction to repay your loan automatically',
    'loanStatus.progress': 'Repayment Progress',
    'loanStatus.daysRemaining': 'Days remaining to pay off',
    'loanStatus.paidPercentage': 'Paid',
    'loanStatus.remainingAmount': 'Remaining',
    'loanStatus.nextDeduction': 'Next deduction',
    'loanStatus.extend': 'Request Extension',
    'loanStatus.extensionRequest': 'Request Extension (days)',
    'loanStatus.extensionDays': 'Number of extra days',
    'loanStatus.extensionApproved': 'Extension Approved!',
    'loanStatus.extensionDenied': 'Extension Denied',
    'loanStatus.noLoans': 'No loan applications yet',
    'schedules.title': 'Payment Schedules',
    'schedules.subtitle': 'Automate recurring payments with AI-powered deductions',
    'schedules.create': 'Create Schedule',
    'schedules.name': 'Schedule Name',
    'schedules.amount': 'Amount (RWF)',
    'schedules.frequency': 'Frequency',
    'schedules.startDate': 'Start Date',
    'schedules.endDate': 'End Date (optional)',
    'schedules.description': 'Description',
    'schedules.status': 'Status',
    'schedules.nextPayment': 'Next Payment',
    'schedules.pause': 'Pause',
    'schedules.resume': 'Resume',
    'schedules.delete': 'Delete',
    'schedules.noSchedules': 'No payment schedules yet',
    'savings.autoDeduction': 'Auto Deduction',
    'savings.autoDeductionAmount': 'Auto-deduction Amount (RWF)',
    'savings.autoDeductionPeriod': 'Auto-deduction Period',
    'savings.autoDeductionInfo': 'Set up auto-deduction to save automatically from your balance',
    'savings.lastDeduction': 'Last deduction',
    'savings.targetDue': 'Target due: {date}',
    'savings.noGoals': 'No savings goals yet',
    // Languages
    'lang.english': 'English',
    'lang.kinyarwanda': 'Kinyarwanda',
    'lang.french': 'Français',
    'common.applyLoan': 'Apply loan',
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
    
    // Loan Application
    'loanApplication.title': 'Gusaba Inguzanyo',
    'loanApplication.subtitle': 'Uzuza fomu hanyuma wohereze kugirango ugire inguzanyo isuzumwa na AI',
    'loanApplication.loading': 'Tegereza tureba amakuru yawe...',
    'loanApplication.profileComplete': 'Amakuru Yuzuye - Urashobora Kubona Inguzanyo',
    'loanApplication.profileIncomplete': 'Amakuru Yuzuye - Teka Ubikore',
    'loanApplication.profileCompleteDesc': 'Amakuru yawe yuzuye. Urashobora gusaba inguzanyo isuzumwa na AI.',
    'loanApplication.profileIncompleteDesc': 'Nyamuneka wuzuze amakuru yawe mbere yo gusaba inguzanyo.',
    'loanApplication.completeProfile': 'Wuzuze Amakuru',
    'loanApplication.aiPrediction': 'Iteganyagihe rya AI',
    'loanApplication.aiPredictionDesc': 'Bona ingengo y\'inguzanyo ukurikije amakuru yawe',
    'loanApplication.buildCredit': 'Tangira gukora ibikorwa by\'amafaranga kugirango ubone inguzanyo neza.',
    'loanApplication.requestedAmount': 'Inguzanyo Usaba (RWF)',
    'loanApplication.maxEligible': 'Injiza ntarengwa',
    'loanApplication.monthlyIncome': 'Amafaranga Yinjiza Ukwezi (RWF)',
    'loanApplication.sector': 'Urwego',
    'loanApplication.employee': 'Umukozi',
    'loanApplication.agriculture': 'Ubuhinzi',
    'loanApplication.sme': 'SME',
    'loanApplication.informal': 'Umugaragazi',
    'loanApplication.student': 'Umunyeshuri',
    'loanApplication.existingDebt': 'Imyenda Isigaye (RWF)',
    'loanApplication.purpose': 'Impamvu y\'Inguzanyo',
    'loanApplication.completeProfileFirst': 'Banza Wuzuze Amakuru',
    'loanApplication.submit': 'Ohereza kugirango Isuzumwe na AI',
    
    // Loan Deduction
    'loanApplication.deductionAmount': 'Amafaranga yishyurwa (buri gihe)',
    'loanApplication.deductionPeriod': 'Igihe cyo kwishyura',
    'loanApplication.deductionPeriodDaily': 'Buri munsi',
    'loanApplication.deductionPeriodWeekly': 'Buri cyumweru',
    'loanApplication.deductionPeriodMonthly': 'Buri kwezi',
    'loanApplication.deductionInfo': 'Shiraho kwishyura bwite kugirango wishyure inguzanyo yawe',
    'loanStatus.progress': 'Iterambere ry\'inyishyu',
    'loanStatus.daysRemaining': 'Iminsi isigaye',
    'loanStatus.paidPercentage': 'Byishyuwe',
    'loanStatus.remainingAmount': 'Mbasigaye',
    'loanStatus.nextDeduction': 'Igikurikiraho',
    'loanStatus.extend': 'Saba ikindi gihe',
    'loanStatus.extensionRequest': 'Saba ikindi gihe (iminsi)',
    'loanStatus.extensionDays': 'Iminsi y\'inyongera',
    'loanStatus.extensionApproved': 'Ikiyongerewe gihe cyemewe!',
    'loanStatus.extensionDenied': 'Ikiyongerewe gihe nticyemewe',
    'loanStatus.noLoans': 'Nta nguzanyo zisabwe',
    'schedules.title': 'Gahunda yo kwishyura',
    'schedules.subtitle': 'Shiraho kwishyura bwite buri gihe ukoresheje AI',
    'schedules.create': 'Kora gahunda',
    'schedules.name': 'Izina ry\'gahunda',
    'schedules.amount': 'Amafaranga (RWF)',
    'schedules.frequency': 'Inshuro',
    'schedules.startDate': 'Itariki yo gutangirira',
    'schedules.endDate': 'Itariki yo kurangirira (by\'amahitamo)',
    'schedules.description': 'Ibisobanuro',
    'schedules.status': 'Imiterere',
    'schedules.nextPayment': 'Igikurikiraho',
    'schedules.pause': 'Komeza',
    'schedules.resume': 'Tangira',
    'schedules.delete': 'Siba',
    'schedules.noSchedules': 'Nta gahunda yo kwishyura',
    'savings.autoDeduction': 'Kwishyura bwite',
    'savings.autoDeductionAmount': 'Amafaranga yishyurwa bwite (RWF)',
    'savings.autoDeductionPeriod': 'Igihe cyo kwishyura bwite',
    'savings.autoDeductionInfo': 'Shiraho kwishyura bwite kugirango uzigame',
    'savings.lastDeduction': 'Ubwishe bwanyuma',
    'savings.targetDue': 'Itariki ntarengwa: {date}',
    'savings.noGoals': 'Nta ntego yo kuzigama',
    // Languages
    'lang.english': 'English',
    'lang.kinyarwanda': 'Kinyarwanda',
    'lang.french': 'Français',
    'common.applyLoan': 'Saba inguzanyo',
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
    
    // Loan Application
    'loanApplication.title': 'Demande de Prêt Intelligente',
    'loanApplication.subtitle': 'Remplissez le formulaire pour une approbation de prêt par l\'IA.',
    'loanApplication.loading': 'Chargement de vos informations...',
    'loanApplication.profileComplete': 'Profil Complet - Éligible au Prêt',
    'loanApplication.profileIncomplete': 'Profil Incomplet - Action Requise',
    'loanApplication.profileCompleteDesc': 'Votre profil est complet. Vous pouvez demander des prêts avec approbation IA.',
    'loanApplication.profileIncompleteDesc': 'Veuillez compléter votre profil avant de demander un prêt.',
    'loanApplication.completeProfile': 'Compléter le Profil',
    'loanApplication.aiPrediction': 'Prédiction de Prêt IA',
    'loanApplication.aiPredictionDesc': 'Obtenez des estimations personnalisées basées sur votre profil',
    'loanApplication.buildCredit': 'Commencez à effectuer des transactions pour améliorer votre éligibilité.',
    'loanApplication.requestedAmount': 'Montant Demandé (RWF)',
    'loanApplication.maxEligible': 'Max éligible',
    'loanApplication.monthlyIncome': 'Revenu Mensuel (RWF)',
    'loanApplication.sector': 'Secteur',
    'loanApplication.employee': 'Employé',
    'loanApplication.agriculture': 'Agriculture',
    'loanApplication.sme': 'PME',
    'loanApplication.informal': 'Informel',
    'loanApplication.student': 'Étudiant',
    'loanApplication.existingDebt': 'Dette Mensuelle Existante (RWF)',
    'loanApplication.purpose': 'Objet du Prêt',
    'loanApplication.completeProfileFirst': 'Complétez d\'abord le profil',
    'loanApplication.submit': 'Soumettre à l\'approbation IA',
    
    // Loan Deduction
    'loanApplication.deductionAmount': 'Montant de la déduction (par période)',
    'loanApplication.deductionPeriod': 'Période de déduction',
    'loanApplication.deductionPeriodDaily': 'Quotidien',
    'loanApplication.deductionPeriodWeekly': 'Hebdomadaire',
    'loanApplication.deductionPeriodMonthly': 'Mensuel',
    'loanApplication.deductionInfo': 'Configurez le prélèvement automatique pour rembourser votre prêt',
    'loanStatus.progress': 'Progrès de remboursement',
    'loanStatus.daysRemaining': 'Jours restants',
    'loanStatus.paidPercentage': 'Payé',
    'loanStatus.remainingAmount': 'Restant',
    'loanStatus.nextDeduction': 'Prochain prélèvement',
    'loanStatus.extend': 'Demander une prolongation',
    'loanStatus.extensionRequest': 'Demande de prolongation (jours)',
    'loanStatus.extensionDays': 'Nombre de jours supplémentaires',
    'loanStatus.extensionApproved': 'Prolongation approuvée !',
    'loanStatus.extensionDenied': 'Prolongation refusée',
    'loanStatus.noLoans': 'Pas encore de demandes de prêt',
    'schedules.title': 'Paiements programmés',
    'schedules.subtitle': 'Automatisez les paiements récurrents avec l\'IA',
    'schedules.create': 'Créer un programme',
    'schedules.name': 'Nom du programme',
    'schedules.amount': 'Montant (RWF)',
    'schedules.frequency': 'Fréquence',
    'schedules.startDate': 'Date de début',
    'schedules.endDate': 'Date de fin (optionnel)',
    'schedules.description': 'Description',
    'schedules.status': 'Statut',
    'schedules.nextPayment': 'Prochain paiement',
    'schedules.pause': 'Pause',
    'schedules.resume': 'Reprendre',
    'schedules.delete': 'Supprimer',
    'schedules.noSchedules': 'Aucun programme de paiement',
    'savings.autoDeduction': 'Prélèvement automatique',
    'savings.autoDeductionAmount': 'Montant du prélèvement automatique (RWF)',
    'savings.autoDeductionPeriod': 'Période de prélèvement',
    'savings.autoDeductionInfo': 'Configurez le prélèvement automatique pour épargner depuis votre solde',
    'savings.lastDeduction': 'Dernier prélèvement',
    'savings.targetDue': 'Échéance : {date}',
    'savings.noGoals': 'Aucun objectif d\'épargne',
    // Languages
    'lang.english': 'English',
    'lang.kinyarwanda': 'Kinyarwanda',
    'lang.french': 'Français',
    'common.applyLoan': 'Demander un prêt',
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
