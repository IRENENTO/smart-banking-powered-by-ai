import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { paymentService } from '../services/api';
import { ArrowUpRight, ArrowDownLeft, CreditCard, TrendingUp, History, DollarSign } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Transaction {
    id: number;
    reference_number: string;
    type: 'deposit' | 'withdrawal' | 'payment' | 'transfer';
    amount: number;
    description: string;
    recipient_account_number?: string;
    recipient_name?: string;
    created_at: string;
}

interface TransactionStats {
    current_balance: number;
    total_transactions: number;
    total_deposits: number;
    total_withdrawals: number;
    total_payments: number;
    total_transfers: number;
    pending_transactions: number;
}

const PaymentDashboard: React.FC = () => {
    const [balance, setBalance] = useState<number>(0);
    const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<TransactionStats | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
    const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
    const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
    
    // Form states
    const [amount, setAmount] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [sourcePhone, setSourcePhone] = useState<string>('');
    const [depositProvider, setDepositProvider] = useState<'mtn' | 'airtel'>('mtn');
    const [recipientAccount, setRecipientAccount] = useState<string>('');
    const [recipientName, setRecipientName] = useState<string>('');

    useEffect(() => {
        fetchPaymentData();
    }, []);

    const fetchPaymentData = async () => {
        setLoading(true);
        try {
            const [balanceRes, transactionsRes, statsRes] = await Promise.all([
                paymentService.getBalance(),
                paymentService.getRecentTransactions(10),
                paymentService.getTransactionStats()
            ]);

            setBalance(balanceRes.data.balance);
            setTransactions(transactionsRes.data.transactions);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching payment data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toastError('Please enter a valid amount');
            return;
        }

        try {
            await paymentService.deposit(parseFloat(amount), description || `Deposit via ${depositProvider.toUpperCase()}`, sourcePhone || undefined);
            setShowDepositModal(false);
            setAmount('');
            setDescription('');
            setSourcePhone('');
            fetchPaymentData();
            if (sourcePhone) {
                toastInfo(`Deposit initiated via ${depositProvider.toUpperCase()}. Please complete the payment on ${sourcePhone}.`);
            } else {
                toastSuccess('Deposit successful!');
            }
        } catch (error: any) {
            toastError(error.response?.data?.msg || 'Deposit failed');
        }
    };

    const handleWithdraw = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toastError('Please enter a valid amount');
            return;
        }

        if (parseFloat(amount) > balance) {
            toastError('Insufficient balance');
            return;
        }

        try {
            await paymentService.withdraw(parseFloat(amount), description || 'Withdrawal');
            setShowWithdrawModal(false);
            setAmount('');
            setDescription('');
            fetchPaymentData();
            toastSuccess('Withdrawal successful!');
        } catch (error: any) {
            toastError(error.response?.data?.msg || 'Withdrawal failed');
        }
    };

    const handleTransfer = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toastError('Please enter a valid amount');
            return;
        }

        if (!recipientAccount) {
            toastError('Please enter recipient account number');
            return;
        }

        if (parseFloat(amount) > balance) {
            toastError('Insufficient balance');
            return;
        }

        try {
            await paymentService.transfer(parseFloat(amount), recipientAccount, description || 'Transfer');
            setShowTransferModal(false);
            setAmount('');
            setDescription('');
            setRecipientAccount('');
            fetchPaymentData();
            toastSuccess('Transfer successful!');
        } catch (error: any) {
            toastError(error.response?.data?.msg || 'Transfer failed');
        }
    };

    const handlePayment = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toastError('Please enter a valid amount');
            return;
        }

        if (!recipientAccount) {
            toastError('Please enter recipient account number');
            return;
        }

        if (parseFloat(amount) > balance) {
            toastError('Insufficient balance');
            return;
        }

        try {
            await paymentService.payment(parseFloat(amount), recipientAccount, recipientName, description || 'Payment');
            setShowPaymentModal(false);
            setAmount('');
            setDescription('');
            setRecipientAccount('');
            setRecipientName('');
            fetchPaymentData();
            toastSuccess('Payment successful!');
        } catch (error: any) {
            toastError(error.response?.data?.msg || 'Payment failed');
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'deposit': return <ArrowDownLeft className="text-green-600" />;
            case 'withdrawal': return <ArrowUpRight className="text-red-600" />;
            case 'payment': return <CreditCard className="text-blue-600" />;
            case 'transfer': return <TrendingUp className="text-purple-600" />;
            default: return <DollarSign className="text-gray-600" />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Dashboard</h1>
                    <p className="text-gray-600">Manage your transactions and account balance</p>
                </motion.div>

                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-8"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">Current Balance</h2>
                            <p className="text-5xl font-bold mb-4">{formatCurrency(balance)}</p>
                            <p className="text-blue-100">Account ending in ****1234</p>
                        </div>
                        <div className="text-right">
                            <DollarSign className="w-16 h-16 text-blue-200" />
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <button
                        onClick={() => setShowDepositModal(true)}
                        className="bg-green-100 hover:bg-green-200 p-4 rounded-xl text-green-800 transition-colors"
                    >
                        <ArrowDownLeft className="w-8 h-8 mb-2 mx-auto" />
                        <span className="block font-semibold">Deposit</span>
                    </button>
                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="bg-red-100 hover:bg-red-200 p-4 rounded-xl text-red-800 transition-colors"
                    >
                        <ArrowUpRight className="w-8 h-8 mb-2 mx-auto" />
                        <span className="block font-semibold">Withdraw</span>
                    </button>
                    <button
                        onClick={() => setShowTransferModal(true)}
                        className="bg-purple-100 hover:bg-purple-200 p-4 rounded-xl text-purple-800 transition-colors"
                    >
                        <TrendingUp className="w-8 h-8 mb-2 mx-auto" />
                        <span className="block font-semibold">Transfer</span>
                    </button>
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className="bg-blue-100 hover:bg-blue-200 p-4 rounded-xl text-blue-800 transition-colors"
                    >
                        <CreditCard className="w-8 h-8 mb-2 mx-auto" />
                        <span className="block font-semibold">Payment</span>
                    </button>
                </motion.div>

                {/* Stats Cards */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-gray-600 text-sm mb-1">Total Deposits</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_deposits)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-gray-600 text-sm mb-1">Total Withdrawals</p>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.total_withdrawals)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-gray-600 text-sm mb-1">Total Payments</p>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.total_payments)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-gray-600 text-sm mb-1">Total Transfers</p>
                            <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.total_transfers)}</p>
                        </div>
                    </motion.div>
                )}

                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-sm p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <History className="w-5 h-5" />
                            Recent Transactions
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-full">
                                        {getTransactionIcon(transaction.type)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 capitalize">{transaction.type}</p>
                                        <p className="text-sm text-gray-600">{transaction.description}</p>
                                        {transaction.recipient_name && (
                                            <p className="text-sm text-gray-500">To: {transaction.recipient_name}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold ${
                                        transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(transaction.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Modals */}
            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Make a Deposit</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                            
                            {/* Provider Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Money Provider</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDepositProvider('mtn')}
                                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                                            depositProvider === 'mtn'
                                                ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        MTN MoMo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDepositProvider('airtel')}
                                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                                            depositProvider === 'airtel'
                                                ? 'border-red-500 bg-red-50 text-red-800'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        Airtel Money
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ({depositProvider === 'mtn' ? 'MTN' : 'Airtel'})</label>
                                <input
                                    type="tel"
                                    value={sourcePhone}
                                    onChange={(e) => setSourcePhone(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={depositProvider === 'mtn' ? "078XXXXXXX" : "073XXXXXXX"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Deposit description"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleDeposit}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Deposit
                            </button>
                            <button
                                onClick={() => setShowDepositModal(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Make a Withdrawal</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                                <p className="text-sm text-gray-500 mt-1">Available balance: {formatCurrency(balance)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Withdrawal description"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleWithdraw}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Withdraw
                            </button>
                            <button
                                onClick={() => setShowWithdrawModal(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Make a Transfer</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                                <p className="text-sm text-gray-500 mt-1">Available balance: {formatCurrency(balance)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Account Number</label>
                                <input
                                    type="text"
                                    value={recipientAccount}
                                    onChange={(e) => setRecipientAccount(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="ACC123456"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Transfer description"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleTransfer}
                                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Transfer
                            </button>
                            <button
                                onClick={() => setShowTransferModal(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Make a Payment</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                                <p className="text-sm text-gray-500 mt-1">Available balance: {formatCurrency(balance)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Account Number</label>
                                <input
                                    type="text"
                                    value={recipientAccount}
                                    onChange={(e) => setRecipientAccount(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="ACC123456"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name (Optional)</label>
                                <input
                                    type="text"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Recipient name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Payment description"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handlePayment}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Pay
                            </button>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentDashboard;
