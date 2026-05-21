import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '../i18n';

type Language = 'en' | 'rw' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

type TranslationKey = 
  | keyof typeof translations.en 
  | 'nav.user' 
  | 'nav.email' 
  | 'nav.payments' 
  | 'nav.savings' 
  | 'nav.aiInsights' 
  | 'nav.marketInsights'
  | 'nav.spendingAnalysis'
  | 'landing.poweredBy'
  | 'landing.whyChoose'
  | 'landing.whyChooseSub'
  | 'landing.smartAccounts'
  | 'landing.smartAccountsDesc'
  | 'landing.instantPayments'
  | 'landing.instantPaymentsDesc'
  | 'landing.aiInsights'
  | 'landing.aiInsightsDesc'
  | 'landing.premiumFeatures'
  | 'landing.premiumDesc'
  | 'landing.prioritySupport'
  | 'landing.advancedAnalytics'
  | 'landing.customReports'
  | 'landing.trustedTitle'
  | 'landing.trustedSub'
  | 'landing.statsUsers'
  | 'landing.statsRating'
  | 'landing.statsUptime'
  | 'landing.quickStartTitle'
  | 'landing.quickStartDesc'
  | 'landing.quickStartBtn'
  | 'landing.aiBenefits'
  | 'landing.aiBenefitsDesc'
  | 'landing.realTimeAlerts'
  | 'landing.realTimeAlertsDesc'
  | 'landing.smarterBudgeting'
  | 'landing.smarterBudgetingDesc'
  | 'landing.loanPrediction'
  | 'landing.loanPredictionDesc'
  | 'landing.goalProgress'
  | 'landing.goalProgressDesc'
  | 'landing.financialInsight'
  | 'landing.financialInsightSub'
  | 'landing.spendingAlert'
  | 'landing.spendingAlertDesc'
  | 'landing.loanEstimate'
  | 'landing.loanEstimateDesc'
  | 'landing.financialOverview'
  | 'landing.accountBalance'
  | 'landing.aiScore'
  | 'landing.aiScoreHealth'
  | 'landing.savedMonth'
  | 'landing.followUs'
  | 'auth.login'
  | 'auth.register'
  | 'auth.signOut'
  | 'auth.continueSetup'
  | 'auth.guest'
  | 'auth.notSignedIn'
  | 'auth.emailNotAvail'
  | 'dash.welcomeTitle'
  | 'dash.welcomeSub'
  | 'dash.summary'
  | 'dash.accNumber'
  | 'dash.viewTransactions'
  | 'dash.managePayments'
  | 'dash.fraudAlert'
  | 'dash.alerts'
  | 'dash.critical'
  | 'dash.bestInvest'
  | 'dash.aiRecommended'
  | 'dash.lowRisk'
  | 'dash.mediumRisk'
  | 'dash.highRisk'
  | 'dash.marketGrowth'
  | 'dash.aiIndicators'
  | 'dash.gdpGrowth'
  | 'dash.inflation'
  | 'dash.sentiment'
  | 'dash.spendingIntel'
  | 'dash.totalVol'
  | 'dash.viewAllInsights'
  | 'dash.investComing'
  | 'dash.qrComing'
  | 'dash.noTx'
  | 'dash.noInsights'
  | 'common.sendMoney'
  | 'common.saveMoney'
  | 'common.invest'
  | 'common.requestLoan'
  | 'common.poor'
  | 'common.good'
  | 'common.excellent'
  | 'common.none'
  | 'common.loading'
  | 'dash.enableAi'
  | 'dash.trackSpend'
  | 'dash.alertsDetected'
  | 'dash.healthyPattern'
  | 'dash.loadingAcc'
  | 'dash.aiOnline'
  | 'dash.aiEstimated'
  | 'dash.createGoalPrompt'
  | 'dash.aiAnalyzed'
  | 'dash.basicSummary'
  | 'card.aiRiskScore'
  | 'card.enableAiRisk'
  | 'common.comingSoon'
  | 'common.notifyMe'
  | 'nav.investments'
  | 'nav.insurance'
  | 'nav.businessBanking'
  | 'nav.creditCards'
  | 'nav.mobileBanking'
  | 'mobile.title'
  | 'mobile.subtitle'
  | 'mobile.qrPayments'
  | 'mobile.qrPaymentsDesc'
  | 'mobile.mobileDeposits'
  | 'mobile.mobileDepositsDesc'
  | 'mobile.biometric'
  | 'mobile.biometricDesc'
  | 'mobile.instantTransfers'
  | 'mobile.instantTransfersDesc'
  | 'mobile.notifyTitle'
  | 'mobile.notifyDesc'
  | 'insurance.heroTitle'
  | 'insurance.heroDesc'
  | 'insurance.riskBased'
  | 'insurance.riskBasedDesc'
  | 'insurance.howItWorks'
  | 'insurance.step1'
  | 'insurance.step2'
  | 'insurance.step3'
  | 'insurance.step4'
  | 'insurance.stayUpdated';

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
    'nav.payments': 'Payments',
    'nav.savings': 'Savings',
    'nav.aiInsights': 'AI Insights',
    'nav.marketInsights': 'Market Insights',
    'nav.investments': 'Investments',
    'nav.insurance': 'Insurance',
    'nav.businessBanking': 'Business',
    'nav.creditCards': 'Cards',
    'nav.mobileBanking': 'Mobile Banking',
    'nav.spendingAnalysis': 'Spending Analysis',
    
    // Landing Page
    'landing.title': 'AI Smart Banking',
    'landing.subtitle': 'A full digital banking experience with AI-powered insights, payments, savings and smarter loans.',
    'landing.poweredBy': 'Powered by AI',
    'landing.openAccount': 'Open Account',
    'landing.goToDashboard': 'Go to Dashboard',
    'landing.whyChoose': 'Why Choose AI Smart Banking?',
    'landing.whyChooseSub': 'Experience the future of banking with our innovative features',
    'landing.smartAccounts': 'Smart Accounts',
    'landing.smartAccountsDesc': 'Manage your checking and savings with guaranteed clarity and AI-powered insights.',
    'landing.instantPayments': 'Instant Payments',
    'landing.instantPaymentsDesc': 'Fast transfers, mobile money, and scheduled payments from one beautiful dashboard.',
    'landing.aiInsights': 'AI Insights',
    'landing.aiInsightsDesc': 'Get intelligent spending guidance and personalised financial alerts that learn from you.',
    'landing.premiumFeatures': '💎 Premium Features',
    'landing.premiumDesc': 'Exclusive benefits for premium members including priority support and advanced analytics.',
    'landing.prioritySupport': 'Priority Support',
    'landing.advancedAnalytics': 'Advanced Analytics',
    'landing.customReports': 'Custom Reports',
    'landing.trustedTitle': '❤️ Trusted by Thousands',
    'landing.trustedSub': 'Join thousands of satisfied customers who trust us with their financial future.',
    'landing.statsUsers': 'Users',
    'landing.statsRating': 'Rating',
    'landing.statsUptime': 'Uptime',
    'landing.quickStartTitle': '🚀 Quick Start',
    'landing.quickStartDesc': 'Get started in minutes with our simple onboarding process and intuitive interface.',
    'landing.quickStartBtn': 'Start Now',
    'landing.aiBenefits': '🤖 AI-powered benefits',
    'landing.aiBenefitsDesc': 'Use AI to uncover better saving opportunities, protect your money, and make smarter decisions with every transaction.',
    'landing.realTimeAlerts': 'Real-time alerts',
    'landing.realTimeAlertsDesc': 'Stay ahead of suspicious activity and payment due dates.',
    'landing.smarterBudgeting': 'Smarter budgeting',
    'landing.smarterBudgetingDesc': 'Understand how spending impacts your goals instantly.',
    'landing.loanPrediction': 'Loan prediction',
    'landing.loanPredictionDesc': 'See your borrowing power before you apply.',
    'landing.goalProgress': 'Goal progress',
    'landing.goalProgressDesc': 'Keep your savings targets in view with progress tracking.',
    'landing.financialInsight': '💡 Financial Insight',
    'landing.financialInsightSub': 'Your latest spending snapshot with AI guidance.',
    'landing.spendingAlert': '🚨 Spending alert',
    'landing.spendingAlertDesc': 'You are spending too much on transport.',
    'landing.loanEstimate': '💰 Loan prediction',
    'landing.loanEstimateDesc': 'You can borrow up to 500,000 RWF.',
    'landing.financialOverview': '💳 Financial Overview',
    'landing.accountBalance': 'Account balance',
    'landing.aiScore': 'AI score',
    'landing.aiScoreHealth': 'financial health',
    'landing.savedMonth': 'Saved this month',
    'landing.followUs': 'Follow Us',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.signOut': 'Sign Out',
    'auth.continueSetup': 'Continue setup',
    'auth.guest': 'Guest',
    'auth.notSignedIn': 'Not signed in',
    'auth.emailNotAvail': 'No email available',

    // Dashboard
    'dash.welcomeTitle': 'AI Smart Banking',
    'dash.welcomeSub': 'A full digital banking experience with AI-powered insights, payments, savings, and smarter loans.',
    'dash.summary': 'Account Summary',
    'dash.accNumber': 'Account number',
    'dash.viewTransactions': 'View Transactions',
    'dash.managePayments': 'Manage Payments',
    'dash.fraudAlert': 'Fraud Alert Summary',
    'dash.alerts': 'Alerts',
    'dash.critical': 'Critical',
    'dash.bestInvest': 'Best Investment Sector',
    'dash.aiRecommended': 'AI-recommended',
    'dash.lowRisk': 'Low Risk',
    'dash.mediumRisk': 'Medium Risk',
    'dash.highRisk': 'High Risk',
    'dash.marketGrowth': 'Market Growth',
    'dash.aiIndicators': 'AI-powered indicators',
    'dash.gdpGrowth': 'GDP Growth',
    'dash.inflation': 'Inflation',
    'dash.sentiment': 'Sentiment',
    'dash.spendingIntel': 'Spending Intelligence',
    'dash.totalVol': 'Total Transaction Volume',
    'dash.viewAllInsights': 'View all AI insights',
    'dash.investComing': 'Investment feature coming soon!',
    'dash.qrComing': 'QR Payment feature coming soon!',
    'dash.noTx': 'No transactions yet. Make your first deposit or transfer to get started.',
    'dash.noInsights': 'No AI insights yet. Start transacting to receive personalized insights.',

    // Common
    'common.sendMoney': 'Send Money',
    'common.saveMoney': 'Save Money',
    'common.invest': 'Invest',
    'common.requestLoan': 'Request Loan',
    'common.poor': 'Poor',
    'common.good': 'Good',
    'common.excellent': 'Excellent',
    'common.comingSoon': 'Coming Soon',
    'common.notifyMe': 'Notify Me',
    
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

    // Mobile Banking
    'mobile.title': 'Mobile Banking',
    'mobile.subtitle': 'Banking on the go — coming soon to your smartphone',
    'mobile.qrPayments': 'QR Payments',
    'mobile.qrPaymentsDesc': 'Pay at any merchant by scanning a QR code. Fast, secure, and contactless.',
    'mobile.mobileDeposits': 'Mobile Deposits',
    'mobile.mobileDepositsDesc': 'Deposit cash through mobile money agents across Rwanda. Instant credit to your account.',
    'mobile.biometric': 'Biometric Security',
    'mobile.biometricDesc': 'Secure your account with fingerprint and face recognition. Your phone is your key.',
    'mobile.instantTransfers': 'Instant Transfers',
    'mobile.instantTransfersDesc': 'Send money to anyone with just a phone number. 24/7 instant transfers between banks.',
    'mobile.notifyTitle': 'Stay Updated',
    'mobile.notifyDesc': 'Be the first to know when our mobile app launches. Subscribe to get early access.',

    // Insurance
    'insurance.heroTitle': 'Smart Protection for Life\'s Uncertainties',
    'insurance.heroDesc': 'AI-powered insurance that adapts to your lifestyle. Fair premiums, instant claims, and personalized coverage.',
    'insurance.riskBased': 'AI Risk-Based Pricing',
    'insurance.riskBasedDesc': 'Traditional insurance uses generic models. We use advanced AI to assess your individual risk profile and provide fair pricing. Low-risk customers get better rates.',
    'insurance.howItWorks': 'How It Works:',
    'insurance.step1': 'Provide basic health and lifestyle information',
    'insurance.step2': 'AI analyzes your risk profile using advanced algorithms',
    'insurance.step3': 'Get a personalized insurance quote instantly',
    'insurance.step4': 'Receive continuous discounts for healthy behaviors',
    'insurance.stayUpdated': 'Insurance products are being enhanced. Subscribe to be notified when new features launch.',

    // Languages
    'lang.english': 'English',
    'lang.kinyarwanda': 'Ikinyarwanda',
    'lang.french': 'Français',
    'lang.arabic': 'العربية',
    'common.applyLoan': 'Apply loan',
    'lang.select': 'Select Language',
  },
  rw: {
    // Navigation
    'nav.home': 'Ahabanza',
    'nav.dashboard': 'Incamake',
    'nav.accounts': 'Konti',
    'nav.transactions': 'Ibyakozwe',
    'nav.cards': 'Akarita',
    'nav.loans': 'Inguzanyo',
    'nav.settings': 'Igenamiterere',
    'nav.profile': 'Icyashushanyo',
    'nav.notifications': 'Amakuru',
    'nav.darkMode': 'Ibumbe',
    'nav.lightMode': 'Urumuri',
    'nav.user': 'Ukoreshanyije',
    'nav.email': 'Imeri',
    'nav.payments': 'Kwishyura',
    'nav.savings': 'Kwizigamira',
    'nav.aiInsights': 'Ubushishozi bwa AI',
    'nav.marketInsights': 'Ubushishozi bw\'isoko',
    'nav.investments': 'Gushora imari',
    'nav.insurance': 'Inshuransi',
    'nav.businessBanking': 'Ubucuruzi',
    'nav.creditCards': 'Akarita',
    'nav.mobileBanking': 'Muri terefone',
    'nav.spendingAnalysis': 'Isesengura ry\'isohoka',
    
    // Landing Page
    'landing.title': 'AI Smart Banking',
    'landing.subtitle': 'Banka y\'Ikoranabuhanga ikoresha AI mu kwishyura, kwizigamira n\'inguzanyo.',
    'landing.poweredBy': 'Ikorwa na AI',
    'landing.openAccount': 'Fungura Konti',
    'landing.goToDashboard': 'Jya mu Ncamake',
    'landing.whyChoose': 'Kuki wahitamo AI Smart Banking?',
    'landing.whyChooseSub': 'Gira uburambe bwa banki y\'ejo hazaza n\'ibikorwa bishya',
    'landing.smartAccounts': 'Konti Zikora',
    'landing.smartAccountsDesc': 'Genzura konti zawe n\'ubushishozi bwa AI.',
    'landing.instantPayments': 'Kwishyura Ako Kanya',
    'landing.instantPaymentsDesc': 'Ohereza amafaranga vuba, koresha momo n\'izindi gahunda.',
    'landing.aiInsights': 'Ubushishozi bwa AI',
    'landing.aiInsightsDesc': 'Bona inama zigufasha mu mikoreshereze y\'amafaranga yawe.',
    'landing.premiumFeatures': '💎 Serivisi Zihariye',
    'landing.premiumDesc': 'Bona serivisi zihariye ku bakiriya bacu b\'imena.',
    'landing.prioritySupport': 'Serivisi yihuse',
    'landing.advancedAnalytics': 'Isesengura ryimbitse',
    'landing.customReports': 'Raporo zihariye',
    'landing.trustedTitle': '❤️ Twizigirwa n\'Ibihumbi',
    'landing.trustedSub': 'Gira hamwe n\'abandi bihumbi batwizeye.',
    'landing.statsUsers': 'Abakoresha',
    'landing.statsRating': 'Inota',
    'landing.statsUptime': 'Imikorere',
    'landing.quickStartTitle': '🚀 Tangira Vuba',
    'landing.quickStartDesc': 'Tangira gukoresha AI Smart Banking mu minota mike.',
    'landing.quickStartBtn': 'Tangira None',
    'landing.aiBenefits': '🤖 Ibyiza bya AI',
    'landing.aiBenefitsDesc': 'Koresha AI kugira ngo ubone uburyo bwiza bwo kwizigamira n\'umutekano.',
    'landing.realTimeAlerts': 'Impuruza ako kanya',
    'landing.realTimeAlertsDesc': 'Menya ibikemangwa vuba n\'igihe cyo kwishyura.',
    'landing.smarterBudgeting': 'Ingengo y\'imari nziza',
    'landing.smarterBudgetingDesc': 'Menya uko wakoresha amafaranga yawe neza.',
    'landing.loanPrediction': 'Iteganyagihe ry\'inguzanyo',
    'landing.loanPredictionDesc': 'Menya ayo ushobora guhabwa mbere yo gusaba.',
    'landing.goalProgress': 'Iterambere ry\'intego',
    'landing.goalProgressDesc': 'Kurikirana intego zawe zo kwizigamira.',
    'landing.financialInsight': '💡 Ubushishozi bwa AI',
    'landing.financialInsightSub': 'Incamake y\'imikoreshereze yawe.',
    'landing.spendingAlert': '🚨 Impuruza y\'isohoka',
    'landing.spendingAlertDesc': 'Uri gusohora amafaranga menshi mu ngendo.',
    'landing.loanEstimate': '💰 Iteganyagihe',
    'landing.loanEstimateDesc': 'Ushobora guhabwa kugeza kuri 500,000 RWF.',
    'landing.financialOverview': '💳 Incamake y\'imari',
    'landing.accountBalance': 'Amafaranga ufite',
    'landing.aiScore': 'Inota rya AI',
    'landing.aiScoreHealth': 'ubuzima bw\'imari',
    'landing.savedMonth': 'Ayizigamiwe uku kwezi',
    'landing.followUs': 'Tukurikire',

    // Auth
    'auth.login': 'Injira',
    'auth.register': 'Iyandikishe',
    'auth.signOut': 'Sohoka',
    'auth.continueSetup': 'Komeza gusettinga',
    'auth.guest': 'Umushyitsi',
    'auth.notSignedIn': 'Ntabwo winjiye',
    'auth.emailNotAvail': 'Imeri ntibonetse',

    // Dashboard
    'dash.welcomeTitle': 'AI Smart Banking',
    'dash.welcomeSub': 'Incamake ya banki ikoresha AI mu kwishyura, kwizigamira n\'inguzanyo.',
    'dash.summary': 'Incamake ya Konti',
    'dash.accNumber': 'Nimero ya konti',
    'dash.viewTransactions': 'Reba ibyakozwe',
    'dash.managePayments': 'Genzura kwishyura',
    'dash.fraudAlert': 'Incamake y\'umutekano',
    'dash.alerts': 'Impuruza',
    'dash.critical': 'Ibikomeye',
    'dash.bestInvest': 'Urwego rwiza rwo gushoramo',
    'dash.aiRecommended': 'Byemejwe na AI',
    'dash.lowRisk': 'Ibyago bike',
    'dash.mediumRisk': 'Ibyago biringaniye',
    'dash.highRisk': 'Ibyago byinshi',
    'dash.marketGrowth': 'Iterambere ry\'isoko',
    'dash.aiIndicators': 'Ibipimo bya AI',
    'dash.gdpGrowth': 'Iterambere rya GDP',
    'dash.inflation': 'Irizamuka ry\'ibiciro',
    'dash.sentiment': 'Imyumvire',
    'dash.spendingIntel': 'Ubushishozi bw\'isohoka',
    'dash.totalVol': 'Ingano yose y\'ibyakozwe',
    'dash.viewAllInsights': 'Reba inama zose za AI',
    'dash.investComing': 'Gushora amafaranga biri hafi!',
    'dash.qrComing': 'Kwishyura na QR biri hafi!',
    'dash.noTx': 'Nta byakozwe biragaragara. Tangira koresha konti yawe.',
    'dash.noInsights': 'Nta nama za AI zirahabwa. Komeza koresha banki yawe.',

    // Common
    'common.sendMoney': 'Ohereza Amafaranga',
    'common.saveMoney': 'Zigama',
    'common.invest': 'Shora Imari',
    'common.requestLoan': 'Saba Inguzanyo',
    'common.poor': 'Nabi',
    'common.good': 'Niza',
    'common.excellent': 'Ahebuje',
    'common.none': 'Nta na kimwe',
    'common.loading': 'Tegereza...',
    'common.comingSoon': 'Biri hafi',
    'common.notifyMe': 'Menyesha',
    
    // Dashboard Extra
    'dash.enableAi': 'Kora AI kugira ngo ubone inama.',
    'dash.trackSpend': 'Kurikirana imikoreshereze yawe.',
    'dash.alertsDetected': 'impuruza zabonetse',
    'dash.healthyPattern': 'Imikoreshereze myiza yabonetse.',
    'dash.loadingAcc': 'Tegereza amakuru ya konti...',
    'dash.aiOnline': 'AI iri gukora',
    'dash.aiEstimated': 'Gukoresha ibyitegererezo',
    'dash.createGoalPrompt': 'Kora intego yo kuzigama.',
    'dash.aiAnalyzed': 'Byasuzumwe na AI',
    'dash.basicSummary': 'Incamake y\'ibanze',
    'card.aiRiskScore': 'Inota ry\'ibyago bya AI',
    'card.enableAiRisk': 'Kora AI kugira ngo usuzume ibyago',
    
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
    'lang.kinyarwanda': 'Ikinyarwanda',
    'lang.french': 'Français',
    'lang.arabic': 'العربية',
    'common.applyLoan': 'Saba inguzanyo',
    'lang.select': 'Hitamo Ururimi',

    // Mobile Banking
    'mobile.title': 'Muri terefone',
    'mobile.subtitle': 'Banki mu nzira — biri hafi ku terefone yawe',
    'mobile.qrPayments': 'Kwishyura QR',
    'mobile.qrPaymentsDesc': 'Kwishyura ukoresheje QR code. Byihuse, byizewe.',
    'mobile.mobileDeposits': 'Kwishyura muri terefone',
    'mobile.mobileDepositsDesc': 'Shyiramo amafaranga ukoresheje mobile money. Aka kanya akakwe.',
    'mobile.biometric': 'Umutekano wa Biometrike',
    'mobile.biometricDesc': 'Kinga konti yawe ukoresheje intoki cyangwa isura.',
    'mobile.instantTransfers': 'Kohereza Ako kanya',
    'mobile.instantTransfersDesc': 'Ohereza amafaranga ukoresheje numero ya terefone. 24/7.',
    'mobile.notifyTitle': 'Menya Ibitekerezo',
    'mobile.notifyDesc': 'Banza umenye iyo porogaramu yacu itanguye. Kwiyandikisha kugirango ubone amakuru.',

    // Insurance
    'insurance.heroTitle': 'Inshuransi ikoresha AI',
    'insurance.heroDesc': 'Inshuransi ikoresha AI kugirango ihuze ubuzima bwawe. Amafaranga meza, ubwishyu bwihuse.',
    'insurance.riskBased': 'Igiciro gishingiye ku byago',
    'insurance.riskBasedDesc': 'Inshuransi ya gakondo ikoresha uburyo rusange. Twe dukoresha AI kugirango dusuzume ibyago byawe bwite.',
    'insurance.howItWorks': 'Uko Ikora:',
    'insurance.step1': 'Tanga amakuru y\'ubuzima n\'imibereho',
    'insurance.step2': 'AI isuzuma ibyago byawe ukoresheje uburyo bwa gisirikare',
    'insurance.step3': 'Bona igiciro cyawe bwite ako kanya',
    'insurance.step4': 'Bona kugabanyirizwa ku giciro kubera imibereho myiza',
    'insurance.stayUpdated': 'Inshuransi irimo gutezwa imbere. Kwiyandikisha kugirango umenye iyo ibintu bishya bitangiye.',
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
    'nav.payments': 'Paiements',
    'nav.savings': 'Épargne',
    'nav.aiInsights': 'Analyses IA',
    'nav.marketInsights': 'Marchés',
    'nav.investments': 'Investissements',
    'nav.insurance': 'Assurance',
    'nav.businessBanking': 'Entreprise',
    'nav.creditCards': 'Cartes',
    'nav.mobileBanking': 'Mobile',
    'nav.spendingAnalysis': 'Analyse des dépenses',
    
    // Landing Page
    'landing.title': 'AI Smart Banking',
    'landing.subtitle': 'Une expérience bancaire entièrement numérique avec des analyses par l\'IA, des paiements et des prêts intelligents.',
    'landing.poweredBy': 'Propulsé par l\'IA',
    'landing.openAccount': 'Ouvrir un compte',
    'landing.goToDashboard': 'Tableau de bord',
    'landing.whyChoose': 'Pourquoi choisir AI Smart Banking ?',
    'landing.whyChooseSub': 'Découvrez l\'avenir de la banque avec nos fonctionnalités innovantes',
    'landing.smartAccounts': 'Comptes Intelligents',
    'landing.smartAccountsDesc': 'Gérez vos comptes avec une clarté garantie et des analyses IA.',
    'landing.instantPayments': 'Paiements Instantanés',
    'landing.instantPaymentsDesc': 'Transferts rapides, mobile money et paiements programmés.',
    'landing.aiInsights': 'Analyses IA',
    'landing.aiInsightsDesc': 'Obtenez des conseils financiers personnalisés.',
    'landing.premiumFeatures': '💎 Fonctions Premium',
    'landing.premiumDesc': 'Avantages exclusifs pour les membres premium.',
    'landing.prioritySupport': 'Support prioritaire',
    'landing.advancedAnalytics': 'Analyses avancées',
    'landing.customReports': 'Rapports personnalisés',
    'landing.trustedTitle': '❤️ Approuvé par des milliers',
    'landing.trustedSub': 'Rejoignez des milliers de clients satisfaits.',
    'landing.statsUsers': 'Utilisateurs',
    'landing.statsRating': 'Note',
    'landing.statsUptime': 'Disponibilité',
    'landing.quickStartTitle': '🚀 Démarrage Rapide',
    'landing.quickStartDesc': 'Commencez en quelques minutes.',
    'landing.quickStartBtn': 'Commencer',
    'landing.aiBenefits': '🤖 Avantages de l\'IA',
    'landing.aiBenefitsDesc': 'Utilisez l\'IA pour de meilleures opportunités d\'épargne.',
    'landing.realTimeAlerts': 'Alertes temps réel',
    'landing.realTimeAlertsDesc': 'Restez informé des activités suspectes.',
    'landing.smarterBudgeting': 'Budget intelligent',
    'landing.smarterBudgetingDesc': 'Comprenez l\'impact de vos dépenses.',
    'landing.loanPrediction': 'Prédiction de prêt',
    'landing.loanPredictionDesc': 'Voyez votre capacité d\'emprunt.',
    'landing.goalProgress': 'Suivi d\'objectifs',
    'landing.goalProgressDesc': 'Gardez vos cibles d\'épargne en vue.',
    'landing.financialInsight': '💡 Analyse Financière',
    'landing.financialInsightSub': 'Votre dernier aperçu avec guidance IA.',
    'landing.spendingAlert': '🚨 Alerte de dépense',
    'landing.spendingAlertDesc': 'Vous dépensez trop en transport.',
    'landing.loanEstimate': '💰 Prédiction de prêt',
    'landing.loanEstimateDesc': 'Vous pouvez emprunter jusqu\'à 500,000 RWF.',
    'landing.financialOverview': '💳 Aperçu Financier',
    'landing.accountBalance': 'Solde du compte',
    'landing.aiScore': 'Score IA',
    'landing.aiScoreHealth': 'santé financière',
    'landing.savedMonth': 'Économisé ce mois',
    'landing.followUs': 'Suivez-nous',

    // Auth
    'auth.login': 'Connexion',
    'auth.register': 'Inscription',
    'auth.signOut': 'Déconnexion',
    'auth.continueSetup': 'Continuer la configuration',
    'auth.guest': 'Invité',
    'auth.notSignedIn': 'Non connecté',
    'auth.emailNotAvail': 'Email non disponible',

    // Dashboard
    'dash.welcomeTitle': 'AI Smart Banking',
    'dash.welcomeSub': 'Une expérience bancaire numérique complète avec IA.',
    'dash.summary': 'Résumé du compte',
    'dash.accNumber': 'Numéro de compte',
    'dash.viewTransactions': 'Voir les transactions',
    'dash.managePayments': 'Gérer les paiements',
    'dash.fraudAlert': 'Résumé des alertes',
    'dash.alerts': 'Alertes',
    'dash.critical': 'Critique',
    'dash.bestInvest': 'Meilleur secteur',
    'dash.aiRecommended': 'Recommandé par IA',
    'dash.lowRisk': 'Risque faible',
    'dash.mediumRisk': 'Risque moyen',
    'dash.highRisk': 'Risque élevé',
    'dash.marketGrowth': 'Croissance du marché',
    'dash.aiIndicators': 'Indicateurs IA',
    'dash.gdpGrowth': 'Croissance GDP',
    'dash.inflation': 'Inflation',
    'dash.sentiment': 'Sentiment',
    'dash.spendingIntel': 'Intelligence des dépenses',
    'dash.totalVol': 'Volume total',
    'dash.viewAllInsights': 'Voir toutes les analyses',
    'dash.investComing': 'Investissement bientôt disponible !',
    'dash.qrComing': 'Paiement QR bientôt disponible !',
    'dash.noTx': 'Aucune transaction pour le moment.',
    'dash.noInsights': 'Aucune analyse IA disponible.',

    // Common
    'common.sendMoney': 'Envoyer',
    'common.saveMoney': 'Épargner',
    'common.invest': 'Investir',
    'common.requestLoan': 'Emprunter',
    'common.poor': 'Médiocre',
    'common.good': 'Bon',
    'common.excellent': 'Excellent',
    'common.comingSoon': 'Bientôt',
    'common.notifyMe': 'M\'avertir',
    
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
    'premium.customDesc': 'Prêts sur mesure avec de meilleurs taux',
    
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
    'footer.description': 'Découvrez l\'avenir de la banque avec notre plateforme financière alimentée par l\'IA.',
    'footer.quickLinks': 'Liens rapides',
    'footer.services': 'Services',
    'footer.contact': 'Contactez-nous',
    'footer.rights': 'Tous droits réservés',
    'footer.madeWith': 'Fait avec',
    'footer.in': 'au Rwanda',
    
    // Loan Application
    'loanApplication.title': 'Demande de Prêt Intelligente',
    'loanApplication.subtitle': 'Remplissez le formulaire pour une approbation de prêt par l\'IA.',
    'loanApplication.loading': 'Chargement de vos informations...',
    'loanApplication.profileComplete': 'Profil Complet - Éligible au Prêt',
    'loanApplication.profileIncomplete': 'Profil Incomplet - Action Requise',
    'loanApplication.profileCompleteDesc': 'Votre profil est complet.',
    'loanApplication.profileIncompleteDesc': 'Veuillez compléter votre profil.',
    'loanApplication.completeProfile': 'Compléter le Profil',
    'loanApplication.aiPrediction': 'Prédiction de Prêt IA',
    'loanApplication.aiPredictionDesc': 'Estimations personnalisées basées sur votre profil',
    'loanApplication.buildCredit': 'Commencez à effectuer des transactions.',
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
    'loanApplication.submit': 'Soumettre',
    
    // Loan Deduction
    'loanApplication.deductionAmount': 'Montant de la déduction',
    'loanApplication.deductionPeriod': 'Période de déduction',
    'loanApplication.deductionPeriodDaily': 'Quotidien',
    'loanApplication.deductionPeriodWeekly': 'Hebdomadaire',
    'loanApplication.deductionPeriodMonthly': 'Mensuel',
    'loanApplication.deductionInfo': 'Configurez le prélèvement automatique.',
    'loanStatus.progress': 'Progrès de remboursement',
    'loanStatus.daysRemaining': 'Jours restants',
    'loanStatus.paidPercentage': 'Payé',
    'loanStatus.remainingAmount': 'Restant',
    'loanStatus.nextDeduction': 'Prochain prélèvement',
    'loanStatus.extend': 'Prolongation',
    'loanStatus.extensionRequest': 'Demande de prolongation',
    'loanStatus.extensionDays': 'Nombre de jours',
    'loanStatus.extensionApproved': 'Approuvé !',
    'loanStatus.extensionDenied': 'Refusé',
    'loanStatus.noLoans': 'Aucune demande',
    'schedules.title': 'Paiements programmés',
    'schedules.subtitle': 'Automatisez les paiements.',
    'schedules.create': 'Créer un programme',
    'schedules.name': 'Nom',
    'schedules.amount': 'Montant (RWF)',
    'schedules.frequency': 'Fréquence',
    'schedules.startDate': 'Date de début',
    'schedules.endDate': 'Date de fin',
    'schedules.description': 'Description',
    'schedules.status': 'Statut',
    'schedules.nextPayment': 'Prochain paiement',
    'schedules.pause': 'Pause',
    'schedules.resume': 'Reprendre',
    'schedules.delete': 'Supprimer',
    'schedules.noSchedules': 'Aucun programme',
    'savings.autoDeduction': 'Prélèvement automatique',
    'savings.autoDeductionAmount': 'Montant (RWF)',
    'savings.autoDeductionPeriod': 'Période',
    'savings.autoDeductionInfo': 'Configurez le prélèvement automatique.',
    'savings.lastDeduction': 'Dernier prélèvement',
    'savings.targetDue': 'Échéance : {date}',
    'savings.noGoals': 'Aucun objectif',
    // Languages
    'lang.english': 'English',
    'lang.kinyarwanda': 'Ikinyarwanda',
    'lang.french': 'Français',
    'common.applyLoan': 'Demander un prêt',
    'lang.select': 'Sélectionner la langue',

    // Mobile Banking
    'mobile.title': 'Banque Mobile',
    'mobile.subtitle': 'La banque dans votre poche — bientôt disponible',
    'mobile.qrPayments': 'Paiements QR',
    'mobile.qrPaymentsDesc': 'Payez chez tout commerçant en scannant un QR code. Rapide, sécurisé et sans contact.',
    'mobile.mobileDeposits': 'Dépôts Mobiles',
    'mobile.mobileDepositsDesc': 'Déposez de l\'argent via les agents mobile money. Crédit instantané sur votre compte.',
    'mobile.biometric': 'Sécurité Biométrique',
    'mobile.biometricDesc': 'Sécurisez votre compte avec empreinte digitale et reconnaissance faciale.',
    'mobile.instantTransfers': 'Transferts Instantanés',
    'mobile.instantTransfersDesc': 'Envoyez de l\'argent à n\'importe qui avec un numéro de téléphone. 24h/24.',
    'mobile.notifyTitle': 'Restez informé',
    'mobile.notifyDesc': 'Soyez le premier à savoir quand notre application mobile sera lancée.',

    // Insurance
    'insurance.heroTitle': 'Une Protection Intelligente',
    'insurance.heroDesc': 'Une assurance alimentée par l\'IA qui s\'adapte à votre mode de vie. Primes équitables, réclamations instantanées.',
    'insurance.riskBased': 'Tarification par Risque IA',
    'insurance.riskBasedDesc': 'L\'assurance traditionnelle utilise des modèles génériques. Nous utilisons l\'IA pour évaluer votre profil de risque individuel.',
    'insurance.howItWorks': 'Comment ça fonctionne :',
    'insurance.step1': 'Fournissez des informations de base sur votre santé',
    'insurance.step2': 'L\'IA analyse votre profil de risque',
    'insurance.step3': 'Obtenez un devis personnalisé instantané',
    'insurance.step4': 'Recevez des réductions continues pour les comportements sains',
    'insurance.stayUpdated': 'Les produits d\'assurance sont en cours d\'amélioration. Abonnez-vous pour être informé.',
    },
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
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') || localStorage.getItem('lang');
    if (saved && ['en', 'rw', 'fr'].includes(saved.toLowerCase())) {
      return saved.toLowerCase() as Language;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    localStorage.setItem('lang', language.toUpperCase());
    (i18n as any).changeLanguage(language);
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = (key: TranslationKey): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
