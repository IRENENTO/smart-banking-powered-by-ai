export type ThemeMode = 'dark' | 'light';
export type Locale = 'en' | 'fr' | 'rw';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  account_number?: string;
  email_verified: boolean;
  profile_completed: boolean;
  kyc_status?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AccountSummary {
  balance: number;
  accountNumber: string;
  currency: string;
  healthScore: number;
}

export interface Transaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  status: string;
  created_at: string;
}

export interface LoanApplication {
  amount: number;
  duration: number;
  purpose: string;
  monthlyIncome: number;
  existingDebt: number;
}

export interface LoanPrediction {
  approvalProbability: number;
  decision: string;
  riskScore: number;
  monthlyPayment: number;
}

export interface FraudSignal {
  score: number;
  verdict: string;
  details: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  goalAmount: number;
  savedAmount: number;
  progress: number;
  dueDate: string;
}

export interface SavingsPrediction {
  recommendedMonthly: number;
  targetCompletion: string;
}

export interface InvestmentForecast {
  opportunity: string;
  expectedReturn: number;
  risk: string;
}

export interface AIInsight {
  id: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AuthStoreState extends AuthState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  logout: () => void;
}

export interface AIStoreState {
  insights: AIInsight[];
  loanPrediction?: LoanPrediction;
  fraudSignal?: FraudSignal;
  savingsPrediction?: SavingsPrediction;
  investmentForecasts: InvestmentForecast[];
  loading: boolean;
  setInsights: (insights: AIInsight[]) => void;
  setLoanPrediction: (prediction: LoanPrediction) => void;
  setFraudSignal: (signal: FraudSignal) => void;
  setSavingsPrediction: (prediction: SavingsPrediction) => void;
  setInvestmentForecasts: (forecasts: InvestmentForecast[]) => void;
  setLoading: (loading: boolean) => void;
}

export interface TransactionStoreState {
  transactions: Transaction[];
  balance: number;
  overview: Record<string, number>;
  isLoading: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  setBalance: (amount: number) => void;
  setOverview: (overview: Record<string, number>) => void;
  setLoading: (loading: boolean) => void;
}

export interface NotificationStoreState {
  notifications: NotificationItem[];
  fraudAlerts: AIInsight[];
  unreadCount: number;
  isLoading: boolean;
  setNotifications: (items: NotificationItem[]) => void;
  setFraudAlerts: (items: AIInsight[]) => void;
  setUnreadCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
}

export interface PaymentStoreState {
  lastPaymentStatus: string;
  isProcessing: boolean;
  error: string | null;
  setStatus: (status: string) => void;
  setProcessing: (state: boolean) => void;
  setError: (error: string | null) => void;
}
