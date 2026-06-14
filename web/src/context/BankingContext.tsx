import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { paymentService, loanService, aiService, authService } from '../services/api';

interface Transaction {
    id: number;
    reference_number: string;
    type: string;
    amount: number;
    description: string;
    recipient_account_number?: string;
    recipient_name?: string;
    status: string;
    balance_before: number;
    balance_after: number;
    created_at: string;
}

interface Payment {
    id: number;
    payment_type: string;
    provider: string;
    amount: number;
    status: string;
    description: string;
    created_at: string;
}

interface Loan {
    id: number;
    amount: number;
    purpose: string;
    duration: number;
    status: string;
    risk_score: number;
    created_at: string;
}

interface Insight {
    id: number;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

interface BankingState {
    balance: number | null;
    realBalance: number;
    demoBalance: number;
    transactions: Transaction[];
    payments: Payment[];
    loans: Loan[];
    insights: Insight[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    deposit: (amount: number, description?: string, phoneNumber?: string) => Promise<any>;
    withdraw: (amount: number, description?: string) => Promise<void>;
    sendPayment: (amount: number, recipientAccountNumber: string, recipientName?: string, description?: string, category?: string) => Promise<void>;
    transfer: (amount: number, recipientAccountNumber: string, description?: string, category?: string) => Promise<void>;
    applyLoan: (loanData: any) => Promise<void>;
}

const BankingContext = createContext<BankingState | undefined>(undefined);

export const useBanking = () => {
    const context = useContext(BankingContext);
    if (!context) {
        throw new Error('useBanking must be used within a BankingProvider');
    }
    return context;
};

interface BankingProviderProps {
    children: ReactNode;
}

export const BankingProvider: React.FC<BankingProviderProps> = ({ children }) => {
    const [balance, setBalance] = useState<number | null>(null);
    const [realBalance, setRealBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('token'));

    useEffect(() => {
        const handleStorage = () => {
            setIsAuthenticated(!!localStorage.getItem('token'));
        };
        window.addEventListener('storage', handleStorage);
        // Also listen for a custom event if login happens in the same tab
        window.addEventListener('auth-change', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('auth-change', handleStorage);
        };
    }, []);

    const fetchData = useCallback(async () => {
        if (!isAuthenticated) {
            setBalance(null);
            setTransactions([]);
            setPayments([]);
            setLoans([]);
            setInsights([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [balanceRes, txRes, insightsRes, loansRes] = await Promise.allSettled([
                paymentService.getBalance(),
                paymentService.getRecentTransactions(50),
                aiService.getInsights(),
                loanService.getLoans()
            ]);

            if (balanceRes.status === 'fulfilled') {
                setBalance(balanceRes.value.data?.balance ?? 0);
            } else {
                const reason = balanceRes.reason;
                console.error('Balance fetch failed:', reason?.response?.status, reason?.response?.data?.msg || reason?.message);
                setBalance(0);
            }

            if (txRes.status === 'fulfilled') {
                const txData = txRes.value.data?.transactions ?? [];
                setTransactions(txData);
                const totalDeposits = txData
                    .filter((tx: any) => tx.type === 'deposit' && tx.status === 'completed')
                    .reduce((sum: number, tx: any) => sum + (parseFloat(tx.amount) || 0), 0);
                setRealBalance(totalDeposits);
            } else {
                setTransactions([]);
                setRealBalance(0);
            }

            if (insightsRes.status === 'fulfilled') {
                const insightData = insightsRes.value.data?.insights ?? [];
                setInsights(insightData);
            } else {
                setInsights([]);
            }

            if (loansRes.status === 'fulfilled') {
                const loanData = loansRes.value.data?.loans ?? [];
                setLoans(loanData);
            } else {
                setLoans([]);
            }
        } catch (err: any) {
            setError(err.response?.data?.msg || err.message || 'Failed to fetch data');
            setBalance(0);
            setTransactions([]);
            setInsights([]);
            setLoans([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const deposit = async (amount: number, description?: string, phoneNumber?: string) => {
        setLoading(true);
        try {
            const res = await paymentService.deposit(amount, description, phoneNumber);
            await fetchData();
            return res;
        } catch (err: any) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const withdraw = async (amount: number, description?: string) => {
        setLoading(true);
        try {
            await paymentService.withdraw(amount, description);
            await fetchData();
        } catch (err: any) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const sendPayment = async (amount: number, recipientAccountNumber: string, recipientName?: string, description?: string, category?: string) => {
        setLoading(true);
        try {
            await paymentService.payment(amount, recipientAccountNumber, recipientName, description, category);
            await fetchData();
        } catch (err: any) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const transfer = async (amount: number, recipientAccountNumber: string, description?: string, category?: string) => {
        setLoading(true);
        try {
            await paymentService.transfer(amount, recipientAccountNumber, description, category);
            await fetchData();
        } catch (err: any) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const applyLoan = async (loanData: any) => {
        setLoading(true);
        try {
            await loanService.apply(loanData);
            await fetchData();
        } catch (err: any) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const refresh = async () => {
        await fetchData();
    };

    return (
        <BankingContext.Provider value={{
            balance,
            realBalance,
            demoBalance: Math.max(0, (balance ?? 0) - realBalance),
            transactions,
            payments,
            loans,
            insights,
            loading,
            error,
            refresh,
            deposit,
            withdraw,
            sendPayment,
            transfer,
            applyLoan
        }}>
            {children}
        </BankingContext.Provider>
    );
};
