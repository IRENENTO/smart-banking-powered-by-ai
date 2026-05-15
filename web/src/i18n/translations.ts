import { Lang } from '../utils/preferences';

export type TranslationKey =
  | 'app.brand'
  | 'nav.dashboard'
  | 'nav.accounts'
  | 'nav.transactions'
  | 'nav.payments'
  | 'nav.savings'
  | 'nav.loans'
  | 'nav.aiInsights'
  | 'nav.admin'
  | 'common.accounts'
  | 'common.transactions'
  | 'common.payments'
  | 'common.savings'
  | 'common.loans'
  | 'common.viewAll'
  | 'common.viewStatus'
  | 'common.applyLoan'
  | 'common.newPayment'
  | 'common.logout'
  | 'common.settings'
  | 'common.editProfile'
  | 'common.language'
  | 'common.darkTheme'
  | 'common.clear'
  | 'common.reset'
  | 'common.success'
  | 'dashboard.title'
  | 'dashboard.subtitle'
  | 'dashboard.accountBalance'
  | 'dashboard.available'
  | 'dashboard.financialHealth'
  | 'dashboard.trendThisMonth'
  | 'dashboard.loanEligibility'
  | 'dashboard.recentTransactions'
  | 'dashboard.quickView'
  | 'dashboard.aiInsight'
  | 'dashboard.aiHighlights'
  | 'dashboard.actionableSuggestions'
  | 'transactions.title'
  | 'transactions.subtitle'
  | 'transactions.categories'
  | 'transactions.history'
  | 'transactions.allActivity'
  | 'transactions.category'
  | 'transactions.items'
  | 'transactions.suspicious'
  | 'transactions.flagged'
  | 'transactions.noneSuspicious'
  | 'transactions.categorySummary'
  | 'transactions.totalsByCategory'
  | 'transactions.aiGrouped'
  | 'accounts.title'
  | 'accounts.subtitle'
  | 'accounts.balance'
  | 'accounts.viewTransactions'
  | 'accounts.pay'
  | 'payments.title'
  | 'payments.subtitle'
  | 'payments.secure'
  | 'payments.sendMoney'
  | 'payments.transfers'
  | 'payments.instant'
  | 'payments.recipientName'
  | 'payments.accountOrMobile'
  | 'payments.amountRwf'
  | 'payments.noteOptional'
  | 'payments.sendPayment'
  | 'payments.sentTo'
  | 'payments.mobileMoney'
  | 'payments.simulatedBalances'
  | 'payments.available'
  | 'payments.scheduled'
  | 'payments.upcomingTransfers'
  | 'payments.scheduledCount'
  | 'savings.title'
  | 'savings.subtitle'
  | 'savings.onTrack'
  | 'savings.createGoal'
  | 'savings.setTarget'
  | 'savings.new'
  | 'savings.goalName'
  | 'savings.targetAmount'
  | 'savings.currentAmount'
  | 'savings.addGoal'
  | 'savings.lockedSavings'
  | 'savings.protectedFunds'
  | 'savings.secure'
  | 'savings.emergencyReserve'
  | 'savings.lockedUntil'
  | 'savings.goal'
  | 'savings.current'
  | 'savings.target'
  | 'savings.targetDue'
  | 'savings.addFunds'
  | 'savings.details'
  | 'category.all'
  | 'category.food'
  | 'category.transport'
  | 'category.bills'
  | 'category.mobileMoney'
  | 'status.completed'
  | 'status.pending'
  | 'loanApplication.deductionAmount'
  | 'loanApplication.deductionPeriod'
  | 'loanApplication.deductionPeriodDaily'
  | 'loanApplication.deductionPeriodWeekly'
  | 'loanApplication.deductionPeriodMonthly'
  | 'loanApplication.deductionInfo'
  | 'loanStatus.progress'
  | 'loanStatus.daysRemaining'
  | 'loanStatus.paidPercentage'
  | 'loanStatus.remainingAmount'
  | 'loanStatus.nextDeduction'
  | 'loanStatus.extend'
  | 'loanStatus.extensionRequest'
  | 'loanStatus.extensionDays'
  | 'loanStatus.extensionApproved'
  | 'loanStatus.extensionDenied'
  | 'loanStatus.noLoans'
  | 'schedules.title'
  | 'schedules.subtitle'
  | 'schedules.create'
  | 'schedules.name'
  | 'schedules.amount'
  | 'schedules.frequency'
  | 'schedules.startDate'
  | 'schedules.endDate'
  | 'schedules.description'
  | 'schedules.status'
  | 'schedules.nextPayment'
  | 'schedules.pause'
  | 'schedules.resume'
  | 'schedules.delete'
  | 'schedules.noSchedules'
  | 'savings.autoDeduction'
  | 'savings.autoDeductionAmount'
  | 'savings.autoDeductionPeriod'
  | 'savings.autoDeductionInfo'
  | 'savings.lastDeduction'
  | 'savings.noGoals';

type Dict = Record<TranslationKey, string>;

const EN: Dict = {
  'app.brand': 'AI Smart Banking',
  'nav.dashboard': 'Dashboard',
  'nav.accounts': 'Accounts',
  'nav.transactions': 'Transactions',
  'nav.payments': 'Payments',
  'nav.savings': 'Savings',
  'nav.loans': 'Loans',
  'nav.aiInsights': 'AI Insights',
  'nav.admin': 'Admin',
  'common.accounts': 'Accounts',
  'common.transactions': 'Transactions',
  'common.payments': 'Payments',
  'common.savings': 'Savings',
  'common.loans': 'Loans',
  'common.viewAll': 'View all',
  'common.viewStatus': 'View status',
  'common.applyLoan': 'Apply loan',
  'common.newPayment': 'New payment',
  'common.logout': 'Logout',
  'common.settings': 'Settings',
  'common.editProfile': 'Edit profile',
  'common.language': 'Language',
  'common.darkTheme': 'Dark theme',
  'common.clear': 'Clear',
  'common.reset': 'Reset',
  'common.success': 'Success',
  'dashboard.title': 'AI Smart Banking',
  'dashboard.subtitle': 'A modern digital banking dashboard with card-based navigation, transactions, and AI-powered insights.',
  'dashboard.accountBalance': 'Account Balance',
  'dashboard.available': 'Available',
  'dashboard.financialHealth': 'Financial Health',
  'dashboard.trendThisMonth': 'Trend this month',
  'dashboard.loanEligibility': 'Loan Eligibility',
  'dashboard.recentTransactions': 'Recent Transactions',
  'dashboard.quickView': 'Quick view of latest activity',
  'dashboard.aiInsight': 'AI Insight',
  'dashboard.aiHighlights': 'AI Highlights',
  'dashboard.actionableSuggestions': 'Actionable suggestions',
  'transactions.title': 'Transactions',
  'transactions.subtitle': 'Filter by category, spot suspicious activity, and track spending with a clean, modern layout.',
  'transactions.categories': 'Transaction categories',
  'transactions.history': 'Transaction History',
  'transactions.allActivity': 'All activity',
  'transactions.category': 'Category: {category}',
  'transactions.items': '{count} items',
  'transactions.suspicious': 'Suspicious Activity',
  'transactions.flagged': 'Flagged items that may require review',
  'transactions.noneSuspicious': 'No suspicious transactions found.',
  'transactions.categorySummary': 'Category Summary',
  'transactions.totalsByCategory': 'Totals by category',
  'transactions.aiGrouped': 'AI grouped',
  'accounts.title': 'My Accounts',
  'accounts.subtitle': 'Card-based account overview with balances, status, and quick actions.',
  'accounts.balance': 'Balance',
  'accounts.viewTransactions': 'View transactions',
  'accounts.pay': 'Pay',
  'payments.title': 'Payments',
  'payments.subtitle': 'Send money instantly, simulate mobile money balances, and keep scheduled transfers in one view.',
  'payments.secure': 'Secure payments',
  'payments.sendMoney': 'Send Money',
  'payments.transfers': 'Transfers and mobile payments',
  'payments.instant': 'Instant',
  'payments.recipientName': 'Recipient name',
  'payments.accountOrMobile': 'Account / Mobile number',
  'payments.amountRwf': 'Amount (RWF)',
  'payments.noteOptional': 'Note (optional)',
  'payments.sendPayment': 'Send Payment',
  'payments.sentTo': 'Sent RWF {amount} to {recipient}',
  'payments.mobileMoney': 'Mobile Money',
  'payments.simulatedBalances': 'Simulated balances',
  'payments.available': 'Available',
  'payments.scheduled': 'Scheduled Payments',
  'payments.upcomingTransfers': 'Upcoming transfers',
  'payments.scheduledCount': '{count} scheduled',
  'savings.title': 'Savings Goals',
  'savings.subtitle': 'Create goals, track progress, and lock funds for long-term plans.',
  'savings.onTrack': 'On track',
  'savings.createGoal': 'Create a Savings Goal',
  'savings.setTarget': 'Set a target and start building momentum',
  'savings.new': 'New',
  'savings.goalName': 'Goal name',
  'savings.targetAmount': 'Target amount (RWF)',
  'savings.currentAmount': 'Current amount (RWF)',
  'savings.addGoal': 'Add Goal',
  'savings.lockedSavings': 'Locked Savings',
  'savings.protectedFunds': 'Protected funds for long-term objectives',
  'savings.secure': 'Secure',
  'savings.emergencyReserve': 'Emergency Reserve',
  'savings.lockedUntil': 'Locked until {date}',
  'savings.goal': 'Goal',
  'savings.current': 'Current',
  'savings.target': 'Target',
  'savings.targetDue': 'Target due: {date}',
  'savings.addFunds': 'Add funds',
  'savings.details': 'Details',
  'category.all': 'All',
  'category.food': 'Food',
  'category.transport': 'Transport',
  'category.bills': 'Bills',
  'category.mobileMoney': 'Mobile Money',
  'status.completed': 'Completed',
  'status.pending': 'Pending',
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
  'savings.noGoals': 'No savings goals yet'
};

const FR: Dict = {
  ...EN,
  'nav.dashboard': 'Tableau de bord',
  'nav.accounts': 'Comptes',
  'nav.savings': 'Épargne',
  'nav.loans': 'Prêts',
  'nav.aiInsights': 'Analyses IA',
  'common.viewAll': 'Voir tout',
  'common.viewStatus': 'Voir le statut',
  'common.applyLoan': 'Demander un prêt',
  'common.newPayment': 'Nouveau paiement',
  'common.logout': 'Se déconnecter',
  'common.settings': 'Paramètres',
  'common.editProfile': 'Modifier le profil',
  'common.language': 'Langue',
  'common.darkTheme': 'Thème sombre',
  'common.clear': 'Effacer',
  'common.reset': 'Réinitialiser',
  'common.success': 'Succès',
  'dashboard.subtitle': 'Un tableau de bord bancaire moderne avec navigation par cartes, transactions et analyses IA.',
  'dashboard.accountBalance': 'Solde du compte',
  'dashboard.available': 'Disponible',
  'dashboard.financialHealth': 'Santé financière',
  'dashboard.trendThisMonth': 'Tendance ce mois-ci',
  'dashboard.loanEligibility': 'Éligibilité au prêt',
  'dashboard.recentTransactions': 'Transactions récentes',
  'dashboard.quickView': 'Aperçu rapide de l’activité',
  'dashboard.aiHighlights': 'Points forts IA',
  'transactions.subtitle': 'Filtrez par catégorie, repérez les activités suspectes et suivez vos dépenses.',
  'transactions.categories': 'Catégories',
  'transactions.history': 'Historique des transactions',
  'transactions.allActivity': 'Toute activité',
  'transactions.category': 'Catégorie : {category}',
  'transactions.items': '{count} éléments',
  'transactions.suspicious': 'Activité suspecte',
  'transactions.flagged': 'Éléments signalés à vérifier',
  'transactions.noneSuspicious': 'Aucune transaction suspecte.',
  'transactions.categorySummary': 'Résumé par catégorie',
  'transactions.totalsByCategory': 'Totaux par catégorie',
  'transactions.aiGrouped': 'Groupé par IA',
  'accounts.title': 'Mes comptes',
  'accounts.subtitle': 'Aperçu par cartes avec soldes, statut et actions rapides.',
  'accounts.balance': 'Solde',
  'accounts.viewTransactions': 'Voir les transactions',
  'accounts.pay': 'Payer',
  'payments.subtitle': 'Envoyez de l’argent instantanément, simulez des soldes et suivez les paiements planifiés.',
  'payments.secure': 'Paiements sécurisés',
  'payments.sendMoney': 'Envoyer de l’argent',
  'payments.transfers': 'Transferts et paiements mobiles',
  'payments.instant': 'Instantané',
  'payments.recipientName': 'Nom du destinataire',
  'payments.accountOrMobile': 'Compte / Numéro mobile',
  'payments.amountRwf': 'Montant (RWF)',
  'payments.noteOptional': 'Note (optionnel)',
  'payments.sendPayment': 'Envoyer',
  'payments.sentTo': 'Envoyé RWF {amount} à {recipient}',
  'payments.simulatedBalances': 'Soldes simulés',
  'payments.available': 'Disponible',
  'payments.scheduled': 'Paiements planifiés',
  'payments.upcomingTransfers': 'Transferts à venir',
  'payments.scheduledCount': '{count} planifiés',
  'savings.subtitle': 'Créez des objectifs, suivez les progrès et verrouillez des fonds.',
  'savings.onTrack': 'Sur la bonne voie',
  'savings.createGoal': 'Créer un objectif d’épargne',
  'savings.setTarget': 'Fixez un objectif et démarrez',
  'savings.new': 'Nouveau',
  'savings.goalName': 'Nom de l’objectif',
  'savings.targetAmount': 'Montant cible (RWF)',
  'savings.currentAmount': 'Montant actuel (RWF)',
  'savings.addGoal': 'Ajouter',
  'savings.lockedSavings': 'Épargne verrouillée',
  'savings.protectedFunds': 'Fonds protégés à long terme',
  'savings.secure': 'Sécurisé',
  'savings.emergencyReserve': 'Réserve d’urgence',
  'savings.lockedUntil': 'Verrouillé jusqu’au {date}',
  'savings.goal': 'Objectif',
  'savings.current': 'Actuel',
  'savings.target': 'Cible',
  'savings.targetDue': 'Échéance : {date}',
  'savings.addFunds': 'Ajouter des fonds',
  'savings.details': 'Détails',
  'category.all': 'Tout',
  'category.food': 'Alimentation',
  'category.transport': 'Transport',
  'category.bills': 'Factures',
  'category.mobileMoney': 'Mobile Money',
  'status.completed': 'Terminé',
  'status.pending': 'En attente',
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
  'savings.noGoals': 'Aucun objectif d\'épargne'
};

const RW: Dict = {
  ...EN,
  'nav.dashboard': 'Ibiro',
  'nav.accounts': 'Konti',
  'nav.transactions': 'Ibikorwa',
  'nav.payments': 'Kwishyura',
  'nav.savings': 'Kuzigama',
  'nav.loans': 'Inguzanyo',
  'nav.aiInsights': 'Inama za IA',
  'common.viewAll': 'Reba byose',
  'common.viewStatus': 'Reba uko bimeze',
  'common.applyLoan': 'Saba inguzanyo',
  'common.newPayment': 'Kwishyura',
  'common.logout': 'Sohoka',
  'common.settings': 'Igenamiterere',
  'common.editProfile': 'Hindura umwirondoro',
  'common.language': 'Ururimi',
  'common.darkTheme': 'Insanganyamatsiko yijimye',
  'common.clear': 'Siba',
  'common.reset': 'Subiramo',
  'common.success': 'Byagenze neza',
  'dashboard.subtitle': 'Dashboard igezweho ya banki ifite amakarita, ibikorwa n’inama za IA.',
  'dashboard.accountBalance': 'Amafaranga kuri konti',
  'dashboard.available': 'Ahari',
  'dashboard.financialHealth': 'Ubuzima bw’imari',
  'dashboard.trendThisMonth': 'Uko bimeze uku kwezi',
  'dashboard.loanEligibility': 'Uburenganzira bwo kubona inguzanyo',
  'dashboard.recentTransactions': 'Ibikorwa biheruka',
  'dashboard.quickView': 'Incamake y’ibikorwa biheruka',
  'dashboard.aiHighlights': 'Incamake ya IA',
  'transactions.subtitle': 'Hitamo icyiciro, menya ibikorwa bikekwa, kandi ukurikirane amafaranga yawe.',
  'transactions.categories': 'Ibyiciro',
  'transactions.history': 'Amateka y’ibikorwa',
  'transactions.allActivity': 'Ibikorwa byose',
  'transactions.category': 'Icyiciro: {category}',
  'transactions.items': 'Ibintu {count}',
  'transactions.suspicious': 'Ibikorwa bikekwa',
  'transactions.flagged': 'Ibikorwa byashyizweho ikimenyetso',
  'transactions.noneSuspicious': 'Nta bikorwa bikekwa byabonetse.',
  'transactions.categorySummary': 'Incamake y’icyiciro',
  'transactions.totalsByCategory': 'Igiteranyo ku byiciro',
  'transactions.aiGrouped': 'Byahujwe na IA',
  'accounts.title': 'Konti zanjye',
  'accounts.subtitle': 'Incamake ya konti ku makarita n’ibikorwa byihuse.',
  'accounts.balance': 'Amafaranga',
  'accounts.viewTransactions': 'Reba ibikorwa',
  'accounts.pay': 'Ishyura',
  'payments.subtitle': 'Ohereza amafaranga vuba, urebe Mobile Money, kandi ukurikire ibiteganyijwe.',
  'payments.secure': 'Kwishyura kwizewe',
  'payments.sendMoney': 'Kohereza amafaranga',
  'payments.transfers': 'Kohereza no kwishyura kuri telefone',
  'payments.instant': 'Vuba',
  'payments.recipientName': 'Izina ry’uhabwa',
  'payments.accountOrMobile': 'Konti / Numero ya telefone',
  'payments.amountRwf': 'Amafaranga (RWF)',
  'payments.noteOptional': 'Icyitonderwa (si ngombwa)',
  'payments.sendPayment': 'Ohereza',
  'payments.sentTo': 'Kohereje RWF {amount} kuri {recipient}',
  'payments.simulatedBalances': 'Amafaranga (simulation)',
  'payments.available': 'Ahari',
  'payments.scheduled': 'Kwishyura byateganyijwe',
  'payments.upcomingTransfers': 'Ibiteganyijwe',
  'payments.scheduledCount': '{count} byateganyijwe',
  'savings.subtitle': 'Kora intego, ukurikirane iterambere, kandi ufungire amafaranga igihe kirekire.',
  'savings.onTrack': 'Biri kugenda neza',
  'savings.createGoal': 'Kora intego yo kuzigama',
  'savings.setTarget': 'Shyiraho intego utangire',
  'savings.new': 'Gishya',
  'savings.goalName': 'Izina ry’intego',
  'savings.targetAmount': 'Intego (RWF)',
  'savings.currentAmount': 'Aho ugeze (RWF)',
  'savings.addGoal': 'Ongeraho',
  'savings.lockedSavings': 'Kuzigama gufunze',
  'savings.protectedFunds': 'Amafaranga arinzwe igihe kirekire',
  'savings.secure': 'Birarinzwe',
  'savings.emergencyReserve': 'Ubutabazi',
  'savings.lockedUntil': 'Bifunze kugeza {date}',
  'savings.goal': 'Intego',
  'savings.current': 'Aho ugeze',
  'savings.target': 'Intego',
  'savings.targetDue': 'Itariki ntarengwa: {date}',
  'savings.addFunds': 'Ongeramo',
  'savings.details': 'Ibisobanuro',
  'category.all': 'Byose',
  'category.food': 'Ibiribwa',
  'category.transport': 'Ingendo',
  'category.bills': 'Fagitire',
  'category.mobileMoney': 'Mobile Money',
  'status.completed': 'Byarangiye',
  'status.pending': 'Bitegereje',
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
  'savings.noGoals': 'Nta ntego yo kuzigama'
};

export function getDict(lang: Lang): Dict {
  if (lang === 'FR') return FR;
  if (lang === 'RW') return RW;
  return EN;
}

