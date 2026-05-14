export const dashboardSummary = {
    accountNumber: 'RWF-2487-9917',
    balance: 452800,
    available: 426500,
    financialHealth: 88,
    savingsProgress: 72,
    loanEligibility: 'Eligible',
    loanMessage: 'Approved because of stable income and good transaction history',
    loanPrediction: 'You can borrow up to 500,000 RWF',
    aiInsight: 'You spend 32% on transport which is above average. You can save 18,000 RWF monthly by reducing trips.',
    fraudAlert: 'Unusual transaction detected'
};

export const accountList = [
    { id: 'acc1', name: 'Everyday Checking', number: '**** 1234', balance: 128900, type: 'Checking', status: 'Active' },
    { id: 'acc2', name: 'Savings Vault', number: '**** 5678', balance: 203400, type: 'Savings', status: 'Active' },
    { id: 'acc3', name: 'Premium Pocket', number: '**** 9012', balance: 120500, type: 'Investment', status: 'Active' }
];

export const recentTransactions = [
    { id: 'tx1', date: '2026-04-10', description: 'Transport payment', amount: 5_700, category: 'Transport', status: 'Completed', suspicious: false },
    { id: 'tx2', date: '2026-04-09', description: 'Grocery market', amount: 12_400, category: 'Food', status: 'Completed', suspicious: false },
    { id: 'tx3', date: '2026-04-08', description: 'Utility bill', amount: 8_650, category: 'Bills', status: 'Completed', suspicious: false },
    { id: 'tx4', date: '2026-04-07', description: 'Mobile money cashout', amount: 23_500, category: 'Mobile Money', status: 'Pending', suspicious: true },
    { id: 'tx5', date: '2026-04-06', description: 'Coffee shop', amount: 3_200, category: 'Food', status: 'Completed', suspicious: false }
];

export const savingsGoals = [
    { id: 'sv1', name: 'Emergency Fund', target: 250_000, current: 182_000, dueDate: '2026-08-30', locked: false },
    { id: 'sv2', name: 'Business Growth', target: 500_000, current: 340_000, dueDate: '2026-12-15', locked: true }
];

export const scheduledPayments = [
    { id: 'pm1', recipient: 'Mukamana Mobile', account: '0788 123 456', amount: 25_000, nextDate: '2026-04-15', frequency: 'Monthly' },
    { id: 'pm2', recipient: 'Electricity Co.', account: '2021 7788 5566', amount: 54_200, nextDate: '2026-04-20', frequency: 'Monthly' }
];

export const aiInsights = [
    { id: 'ins1', title: 'Transport spending is high', detail: 'AI recommends reducing transport costs by 15% this month to improve savings.', impact: 'Positive budget trend' },
    { id: 'ins2', title: 'Strong savings momentum', detail: 'You are on track to hit your emergency fund goal 2 months early.', impact: 'Savings boost' },
    { id: 'ins3', title: 'Loan readiness is strong', detail: 'Your account history and income stability make you a low-risk borrower.', impact: 'Higher approval chance' }
];

export const loanApplications = [
    { id: 'ln1', amount: 340_000, purpose: 'Business setup', status: 'Approved', aiDecision: { riskScore: 18, explanation: 'Approved because of stable income and good transaction history', confidence: 'High' } },
    { id: 'ln2', amount: 150_000, purpose: 'Study materials', status: 'Pending', aiDecision: { riskScore: 42, explanation: 'Reviewing due to mixed income trends', confidence: 'Medium' } }
];
