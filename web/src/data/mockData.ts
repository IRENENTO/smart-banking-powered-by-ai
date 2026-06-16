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

// ─── Spending Analysis Dataset (Pending Analysis) ──────────────────────────
// Rich, dissertation-quality demo data with clearly defined categories.
// This dataset is "pending analysis" — loaded and ready for AI processing.

export const SPENDING_CATEGORIES = [
  { id: 'food_dining',          label: 'Food & Dining',        color: '#0A9396' },
  { id: 'transport_fuel',       label: 'Transport & Fuel',     color: '#005F73' },
  { id: 'housing_rent',         label: 'Housing & Rent',       color: '#94D2BD' },
  { id: 'utilities_bills',      label: 'Utilities & Bills',    color: '#E9C46A' },
  { id: 'healthcare',           label: 'Healthcare',           color: '#F4A261' },
  { id: 'education',            label: 'Education',            color: '#E76F51' },
  { id: 'entertainment_leisure',label: 'Entertainment & Leisure', color: '#CA6702' },
  { id: 'shopping_retail',      label: 'Shopping & Retail',    color: '#9B2226' },
  { id: 'mobile_communication', label: 'Mobile & Communication', color: '#6A4C93' },
  { id: 'insurance',            label: 'Insurance',            color: '#1982C4' },
  { id: 'savings_investments',  label: 'Savings & Investments', color: '#8AC926' },
  { id: 'other',                label: 'Other',                color: '#6C757D' },
];

// Category breakdown with realistic RWF values for dissertation charts
export const pendingCategoryBreakdown = [
  { name: 'Food & Dining',          value: 385_000, color: '#0A9396', percentage: 18.2 },
  { name: 'Transport & Fuel',       value: 245_000, color: '#005F73', percentage: 11.6 },
  { name: 'Housing & Rent',         value: 450_000, color: '#94D2BD', percentage: 21.3 },
  { name: 'Utilities & Bills',      value: 198_000, color: '#E9C46A', percentage: 9.4 },
  { name: 'Healthcare',             value: 120_000, color: '#F4A261', percentage: 5.7 },
  { name: 'Education',              value: 165_000, color: '#E76F51', percentage: 7.8 },
  { name: 'Entertainment & Leisure', value: 95_000, color: '#CA6702', percentage: 4.5 },
  { name: 'Shopping & Retail',      value: 210_000, color: '#9B2226', percentage: 9.9 },
  { name: 'Mobile & Communication', value: 78_000, color: '#6A4C93', percentage: 3.7 },
  { name: 'Insurance',              value: 85_000, color: '#1982C4', percentage: 4.0 },
  { name: 'Savings & Investments',  value: 52_000, color: '#8AC926', percentage: 2.5 },
  { name: 'Other',                  value: 32_000, color: '#6C757D', percentage: 1.5 },
];

// 12-month spending trend for dissertation line/area charts
export const pendingMonthlyTrend = [
  { month: 'May 2025',   spending: 1_680_000, income: 2_100_000 },
  { month: 'Jun 2025',   spending: 1_720_000, income: 2_100_000 },
  { month: 'Jul 2025',   spending: 1_950_000, income: 2_200_000 },
  { month: 'Aug 2025',   spending: 1_830_000, income: 2_200_000 },
  { month: 'Sep 2025',   spending: 1_740_000, income: 2_200_000 },
  { month: 'Oct 2025',   spending: 2_110_000, income: 2_300_000 },
  { month: 'Nov 2025',   spending: 1_890_000, income: 2_300_000 },
  { month: 'Dec 2025',   spending: 2_450_000, income: 2_500_000 },
  { month: 'Jan 2026',   spending: 1_620_000, income: 2_300_000 },
  { month: 'Feb 2026',   spending: 1_580_000, income: 2_300_000 },
  { month: 'Mar 2026',   spending: 1_860_000, income: 2_300_000 },
  { month: 'Apr 2026',   spending: 2_115_000, income: 2_400_000 },
];

// Detailed transaction records (100+ sample transactions pending AI analysis)
export const pendingAnalysisTransactions = Array.from({ length: 120 }, (_, i) => {
  const categories = SPENDING_CATEGORIES;
  const cat = categories[i % categories.length];
  const baseAmt = (() => {
    const ranges: Record<string, [number, number]> = {
      food_dining:          [2000, 80000],
      transport_fuel:       [1000, 60000],
      housing_rent:         [50000, 350000],
      utilities_bills:      [5000, 120000],
      healthcare:           [5000, 200000],
      education:            [10000, 300000],
      entertainment_leisure:[3000, 100000],
      shopping_retail:      [2000, 150000],
      mobile_communication: [1000, 40000],
      insurance:            [10000, 80000],
      savings_investments:  [5000, 200000],
      other:                [500, 50000],
    };
    const [lo, hi] = ranges[cat.id] || [1000, 50000];
    return Math.round(lo + Math.random() * (hi - lo));
  })();

  const merchants: Record<string, string[]> = {
    food_dining:           ['Nakumatt', 'Shoprite', 'Local Market', 'Restaurant', 'Cafe', 'Food Delivery'],
    transport_fuel:        ['Shell Station', 'TotalEnergies', 'Bus Terminal', 'Taxi', 'Ride Share'],
    housing_rent:          ['Landlord Payment', 'Rent Monthly', 'Property Manager'],
    utilities_bills:       ['RECO Rwanda', 'EWSA Water', 'Internet Provider', 'Electricity Board'],
    healthcare:            ['Pharmacy', 'Clinic Visit', 'Hospital', 'Lab Test'],
    education:             ['School Fees', 'Tuition Payment', 'Bookstore', 'Online Course'],
    entertainment_leisure: ['Cinema', 'Concert', 'Sports Club', 'Streaming Service'],
    shopping_retail:       ['Clothing Store', 'Electronics Shop', 'Department Store', 'Online Shopping'],
    mobile_communication:  ['Airtime Top-Up', 'Data Bundle', 'Mobile Money Fee'],
    insurance:             ['Life Insurance', 'Auto Insurance', 'Health Insurance'],
    savings_investments:   ['Savings Deposit', 'Stock Purchase', 'Mutual Fund'],
    other:                 ['ATM Fee', 'Service Charge', 'Donation', 'Miscellaneous'],
  };
  const desc = (merchants[cat.id] || ['Miscellaneous'])[i % (merchants[cat.id] || ['Miscellaneous']).length];

  const day = (i % 28) + 1;
  const month = ((i % 12) + 1);
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const dayStr = day < 10 ? `0${day}` : `${day}`;

  return {
    id: `pending-tx-${i + 1}`,
    date: `2026-${monthStr}-${dayStr}`,
    amount: baseAmt,
    category: cat.id,
    category_label: cat.label,
    color: cat.color,
    description: desc,
    payment_method: ['mobile_money', 'card', 'cash', 'bank_transfer'][i % 4],
    status: 'Pending Analysis',
  };
});
