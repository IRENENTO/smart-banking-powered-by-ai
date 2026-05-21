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
    transactions: Transaction[];
    payments: Payment[];
    loans: Loan[];
    insights: Insight[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    deposit: (amount: number, description?: string, phoneNumber?: string) => Promise<void>;
    withdraw: (amount: number, description?: string) => Promise<void>;
    sendPayment: (amount: number, recipientAccountNumber: string, recipientName?: string, description?: string) => Promise<void>;
    transfer: (amount: number, recipientAccountNumber: string, description?: string) => Promise<void>;
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
                setBalance(0);
            }

            if (txRes.status === 'fulfilled') {
                const txData = txRes.value.data?.transactions ?? [];
                setTransactions(txData);
            } else {
                setTransactions([]);
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
            await paymentService.deposit(amount, description, phoneNumber);
            await fetchData();
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

    const sendPayment = async (amount: number, recipientAccountNumber: string, recipientName?: string, description?: string) => {
        setLoading(true);
        try {
            await paymentService.payment(amount, recipientAccountNumber, recipientName, description);
            await fetchData();
        } catch (err: any) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const transfer = async (amount: number, recipientAccountNumber: string, description?: string) => {
        setLoading(true);
        try {
            await paymentService.transfer(amount, recipientAccountNumber, description);
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
