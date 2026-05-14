import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import {
    Activity, Users, TrendingUp, AlertTriangle, Shield, BarChart3,
    Download, RefreshCw, Eye, EyeOff, Loader, CheckCircle, XCircle,
    Lock, LogOut
} from 'lucide-react';
import { Button } from '../components/Button';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface AdminUser {
    id: number;
    email: string;
    name: string;
    role: string;
}

interface DashboardStats {
    total_users: number;
    total_transactions: number;
    total_transactions_amount: number;
    active_users_today: number;
    total_accounts: number;
    pending_loans: number;
    pending_loans_amount: number;
    total_savings: number;
    fraud_alerts_pending: number;
    total_revenue: number;
}

interface StatCard {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    color: string;
}

const AdminDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'transactions' | 'loans' | 'security'>('overview');
    const [users, setUsers] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loans, setLoans] = useState<any[]>([]);
    const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    // Get admin from localStorage
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const adminData = localStorage.getItem('admin');

        if (!token) {
            navigate('/admin/login');
            return;
        }

        if (adminData) {
            try {
                setAdmin(JSON.parse(adminData));
            } catch (err) {
                console.error('Error parsing admin data:', err);
            }
        }
    }, [navigate]);

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            setRefreshing(true);

            const response = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStats(response.data.data);
                setLastRefresh(new Date());
            }

            setError('');
        } catch (err: any) {
            const message = err.response?.data?.error || 'Failed to fetch statistics';
            if (err.response?.status === 401) {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin');
                navigate('/admin/login');
            } else {
                setError(message);
            }
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }, [navigate]);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/admin/users?limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setUsers(response.data.data.users);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }, []);

    // Fetch transactions
    const fetchTransactions = useCallback(async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/admin/transactions?limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setTransactions(response.data.data.transactions);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
        }
    }, []);

    // Fetch loans
    const fetchLoans = useCallback(async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/admin/loans?limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setLoans(response.data.data.loans);
            }
        } catch (err) {
            console.error('Error fetching loans:', err);
        }
    }, []);

    // Fetch fraud alerts
    const fetchFraudAlerts = useCallback(async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/admin/fraud-alerts?limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setFraudAlerts(response.data.data.alerts);
            }
        } catch (err) {
            console.error('Error fetching fraud alerts:', err);
        }
    }, []);

    // Fetch analytics
    const fetchAnalytics = useCallback(async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/admin/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setAnalyticsData(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
        }
    }, []);

    // Initial load
    useEffect(() => {
        if (admin) {
            fetchDashboardData();
            fetchUsers();
            fetchTransactions();
            fetchLoans();
            fetchFraudAlerts();
            fetchAnalytics();

            // Auto-refresh every 30 seconds
            const interval = setInterval(() => {
                fetchDashboardData();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [admin, fetchDashboardData, fetchUsers, fetchTransactions, fetchLoans, fetchFraudAlerts, fetchAnalytics]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin');
        navigate('/admin/login');
    };

    const handleRefresh = () => {
        fetchDashboardData();
        fetchUsers();
        fetchTransactions();
        fetchLoans();
        fetchFraudAlerts();
        fetchAnalytics();
    };

    if (loading) {
        return (
            <AppShell title="Admin Dashboard" subtitle="Loading...">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell
            title="Admin Dashboard"
            subtitle="Real-time banking analytics and control center"
            headerRight={
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Last updated: {lastRefresh.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            }
        >
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            {/* Admin Info Card */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{admin?.name}</h2>
                            <p className="text-blue-100">{admin?.email}</p>
                        </div>
                    </div>
                    <div>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                            {admin?.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-800">
                {(['overview', 'users', 'transactions', 'loans', 'security'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-4 py-3 font-medium transition-colors border-b-2 capitalize ${
                            selectedTab === tab
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* OVERVIEW TAB */}
            {selectedTab === 'overview' && stats && (
                <>
                    {/* Key Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCardComponent
                            title="Total Users"
                            value={stats.total_users.toLocaleString()}
                            icon={<Users size={24} />}
                            trend="+12%"
                            trendUp={true}
                            color="blue"
                        />
                        <StatCardComponent
                            title="Total Transactions"
                            value={stats.total_transactions.toLocaleString()}
                            icon={<Activity size={24} />}
                            trend="+8%"
                            trendUp={true}
                            color="green"
                        />
                        <StatCardComponent
                            title="Active Users Today"
                            value={stats.active_users_today.toLocaleString()}
                            icon={<TrendingUp size={24} />}
                            trend="+5%"
                            trendUp={true}
                            color="purple"
                        />
                        <StatCardComponent
                            title="Fraud Alerts"
                            value={stats.fraud_alerts_pending}
                            icon={<AlertTriangle size={24} />}
                            trend={stats.fraud_alerts_pending > 0 ? '⚠️' : '✓'}
                            color="red"
                        />
                    </div>

                    {/* Financial Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <DashboardCardComponent
                            title="Total Revenue"
                            value={`$${(stats.total_revenue / 1000000).toFixed(2)}M`}
                            subtitle="All transactions"
                            bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20"
                            textColor="text-emerald-600 dark:text-emerald-400"
                        />
                        <DashboardCardComponent
                            title="Total Savings"
                            value={`$${(stats.total_savings / 1000000).toFixed(2)}M`}
                            subtitle="User savings goals"
                            bgColor="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
                            textColor="text-blue-600 dark:text-blue-400"
                        />
                        <DashboardCardComponent
                            title="Pending Loans"
                            value={`$${(stats.pending_loans_amount / 1000000).toFixed(2)}M`}
                            subtitle={`${stats.pending_loans} applications`}
                            bgColor="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20"
                            textColor="text-amber-600 dark:text-amber-400"
                        />
                    </div>

                    {/* Charts Row 1 */}
                    {analyticsData?.user_growth && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* User Growth Chart */}
                            <ChartCardComponent title="User Growth (30 Days)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analyticsData.user_growth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="users_created"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartCardComponent>

                            {/* Transaction Trends */}
                            <ChartCardComponent title="Transaction Trends (30 Days)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analyticsData.transaction_trends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip />
                                        <Bar dataKey="transaction_count" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCardComponent>
                        </div>
                    )}

                    {/* Charts Row 2 */}
                    {analyticsData && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Loan Distribution */}
                            <ChartCardComponent title="Loan Status Distribution">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={analyticsData.loan_distribution || []}
                                            dataKey="count"
                                            nameKey="status"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            <Cell fill="#3b82f6" />
                                            <Cell fill="#10b981" />
                                            <Cell fill="#f59e0b" />
                                            <Cell fill="#ef4444" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCardComponent>

                            {/* Savings Distribution */}
                            <ChartCardComponent title="Savings Goal Status">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={analyticsData.savings_distribution || []}
                                            dataKey="count"
                                            nameKey="status"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            <Cell fill="#8b5cf6" />
                                            <Cell fill="#ec4899" />
                                            <Cell fill="#6366f1" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCardComponent>
                        </div>
                    )}
                </>
            )}

            {/* USERS TAB */}
            {selectedTab === 'users' && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                                user.status === 'active'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                            }`}>
                                                {user.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TRANSACTIONS TAB */}
            {selectedTab === 'transactions' && (
                <div className="space-y-4">
                    {fraudAlerts.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                                <div>
                                    <h3 className="font-semibold text-red-900 dark:text-red-200">{fraudAlerts.length} Fraud Alerts</h3>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                        Suspicious activities detected requiring immediate attention
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Reference</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{tx.reference_number}</td>
                                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">{tx.type}</td>
                                            <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">${tx.amount.toLocaleString()}</td>
                                            <td className="px-6 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    tx.status === 'completed'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* LOANS TAB */}
            {selectedTab === 'loans' && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Borrower</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Duration</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Risk Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loans.map((loan) => (
                                    <tr
                                        key={loan.id}
                                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{loan.name || 'N/A'}</td>
                                        <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">${loan.amount.toLocaleString()}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{loan.duration} months</td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                                                loan.status === 'approved'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : loan.status === 'pending'
                                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                            }`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                                    style={{
                                                        backgroundColor: getRiskColor(loan.risk_score),
                                                        color: 'white'
                                                    }}>
                                                    {loan.risk_score || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECURITY TAB */}
            {selectedTab === 'security' && (
                <div className="space-y-6">
                    {/* Fraud Alerts */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-red-600" />
                            Active Fraud Alerts
                        </h3>
                        {fraudAlerts.length === 0 ? (
                            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                                <CheckCircle size={48} className="mx-auto mb-2 text-green-600" />
                                No fraud alerts detected
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {fraudAlerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-red-900 dark:text-red-200">{alert.alert_type}</h4>
                                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{alert.description}</p>
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-2">User: {alert.email}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold capitalize whitespace-nowrap ml-3 ${
                                                alert.severity === 'critical'
                                                    ? 'bg-red-600 text-white'
                                                    : alert.severity === 'high'
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-yellow-500 text-white'
                                            }`}>
                                                {alert.severity}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Security Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DashboardCardComponent
                            title="Active Sessions"
                            value={stats?.active_users_today || 0}
                            subtitle="Users online today"
                            bgColor="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
                            textColor="text-green-600 dark:text-green-400"
                        />
                    </div>
                </div>
            )}

            {/* Export Button */}
            <div className="mt-8 flex justify-center">
                <Button variant="secondary" leftIcon={<Download size={18} />}>
                    Export Report
                </Button>
            </div>
        </AppShell>
    );
};

// Helper Components
interface StatCardComponentProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    color: string;
}

const StatCardComponent: React.FC<StatCardComponentProps> = ({ title, value, icon, trend, trendUp, color }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                        trendUp
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                    }`}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
};

interface DashboardCardComponentProps {
    title: string;
    value: string | number;
    subtitle?: string;
    bgColor: string;
    textColor: string;
}

const DashboardCardComponent: React.FC<DashboardCardComponentProps> = ({ title, value, subtitle, bgColor, textColor }) => (
    <div className={`rounded-xl p-6 ${bgColor}`}>
        <p className={`text-sm font-medium ${textColor} mb-1`}>{title}</p>
        <p className={`text-3xl font-bold ${textColor} mb-2`}>{value}</p>
        {subtitle && <p className={`text-xs ${textColor} opacity-75`}>{subtitle}</p>}
    </div>
);

interface ChartCardComponentProps {
    title: string;
    children: React.ReactNode;
}

const ChartCardComponent: React.FC<ChartCardComponentProps> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        {children}
    </div>
);

const getRiskColor = (score: number): string => {
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#f59e0b';
    return '#10b981';
};

export default AdminDashboard;
