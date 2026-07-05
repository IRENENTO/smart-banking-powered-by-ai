import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout, { AdminTab } from '../components/AdminLayout';
import WebsiteEditor from '../components/WebsiteEditor';
import {
    Activity, Users, TrendingUp, AlertTriangle, Shield, BarChart3,
    Download, RefreshCw, Loader, CheckCircle, XCircle,
    Sparkles, Brain, Target, DollarSign, Clock, Wallet,
    Plus, Edit2, Trash2, Search
} from 'lucide-react';
import ThreeBody from '../components/ThreeBody';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001').replace(/\/api\/?$/, '');

interface AdminUser { id: number; email: string; name: string; role: string; status: string; created_at: string; }

interface DashboardStats {
    total_users: number; total_transactions: number; total_transactions_amount: number;
    active_users_today: number; total_accounts: number; pending_loans: number;
    pending_loans_amount: number; total_savings: number; fraud_alerts_pending: number; total_revenue: number;
}

function exportCSV(data: any[], filename: string) {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
        const values = headers.map(h => {
            const v = row[h];
            return typeof v === 'string' && (v.includes(',') || v.includes('"'))
                ? `"${v.replace(/"/g, '""')}"` : v;
        });
        csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.csv`;
    a.click(); URL.revokeObjectURL(url);
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTab, setSelectedTab] = useState<AdminTab>(() => {
        const saved = localStorage.getItem('admin_selected_tab');
        return (saved as AdminTab) || 'overview';
    });

    useEffect(() => {
        localStorage.setItem('admin_selected_tab', selectedTab);
    }, [selectedTab]);
    const [users, setUsers] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [loans, setLoans] = useState<any[]>([]);
    const [allLoans, setAllLoans] = useState<any[]>([]);
    const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [aiAnalytics, setAiAnalytics] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    // CRUD modals state
    const [showUserModal, setShowUserModal] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [showTxModal, setShowTxModal] = useState(false);
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [editLoan, setEditLoan] = useState<any>(null);
    const [showFraudModal, setShowFraudModal] = useState(false);
    const [reviewAlert, setReviewAlert] = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: number; name: string } | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const token = localStorage.getItem('admin_token');
    const apiGet = useCallback((url: string) =>
        axios.get(`${API_BASE_URL}${url}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data)
    , [token]);

    const apiPost = useCallback((url: string, data: any) =>
        axios.post(`${API_BASE_URL}${url}`, data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data)
    , [token]);

    const apiPut = useCallback((url: string, data: any) =>
        axios.put(`${API_BASE_URL}${url}`, data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data)
    , [token]);

    const apiDel = useCallback((url: string) =>
        axios.delete(`${API_BASE_URL}${url}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data)
    , [token]);

    useEffect(() => {
        const t = localStorage.getItem('admin_token');
        const d = localStorage.getItem('admin');
        if (!t) { navigate('/admin/login'); return; }
        if (d) { try { setAdmin(JSON.parse(d)); } catch {} }
    }, [navigate]);

    const fetchDashboardData = useCallback(async () => {
        if (!token) return;
        setRefreshing(true);
        try {
            const res = await apiGet('/api/admin/stats');
            if (res.success) { setStats(res.data); setLastRefresh(new Date()); }
            setError('');
        } catch (err: any) {
            if (err.response?.status === 401) {
                localStorage.removeItem('admin_token'); localStorage.removeItem('admin'); localStorage.removeItem('isAdmin');
                navigate('/admin/login'); return;
            }
            setError(err.response?.data?.error || 'Failed to fetch statistics');
        } finally { setRefreshing(false); setLoading(false); }
    }, [apiGet, navigate, token]);

    const fetchAllUsers = useCallback(async () => {
        if (!token) return;
        try {
            const res = await apiGet('/api/admin/users?limit=200');
            if (res.success) { setAllUsers(res.data.users); setUsers(res.data.users.slice(0, 50)); }
        } catch {}
    }, [apiGet, token]);

    const fetchAllTransactions = useCallback(async () => {
        if (!token) return;
        try {
            const res = await apiGet('/api/admin/transactions?limit=200');
            if (res.success) { setAllTransactions(res.data.transactions); setTransactions(res.data.transactions.slice(0, 50)); }
        } catch {}
    }, [apiGet, token]);

    const fetchAllLoans = useCallback(async () => {
        if (!token) return;
        try {
            const res = await apiGet('/api/admin/loans?limit=200');
            if (res.success) { setAllLoans(res.data.loans); setLoans(res.data.loans.slice(0, 50)); }
        } catch {}
    }, [apiGet, token]);

    const fetchFraudAlerts = useCallback(async () => {
        if (!token) return;
        try {
            const res = await apiGet('/api/admin/fraud-alerts?limit=50');
            if (res.success) setFraudAlerts(res.data.alerts);
        } catch {}
    }, [apiGet, token]);

    const fetchAnalytics = useCallback(async () => {
        if (!token) return;
        try {
            const res = await apiGet('/api/admin/analytics');
            if (res.success) setAnalyticsData(res.data);
        } catch {}
    }, [apiGet, token]);

    const fetchAiAnalytics = useCallback(async () => {
        if (!token) return;
        try {
            const [a, r, i, m] = await Promise.all([
                apiGet('/api/admin/ai/analytics').catch(() => ({ data: null })),
                apiGet('/api/admin/ai/risk-analysis').catch(() => ({ data: null })),
                apiGet('/api/admin/ai/financial-insights').catch(() => ({ data: null })),
                apiGet('/api/ai/model-status').catch(() => ({ status: 'offline' })),
            ]);
            setAiAnalytics({ adminAnalytics: a.data, riskAnalysis: r.data, financialInsights: i.data, modelStatus: m.status === 'offline' ? m : a });
        } catch {}
    }, [apiGet]);

    useEffect(() => {
        if (admin) {
            fetchDashboardData(); fetchAllUsers(); fetchAllTransactions();
            fetchAllLoans(); fetchFraudAlerts(); fetchAnalytics(); fetchAiAnalytics();
            const interval = setInterval(() => fetchDashboardData(), 30000);
            return () => clearInterval(interval);
        }
    }, [admin, fetchDashboardData, fetchAllUsers, fetchAllTransactions, fetchAllLoans, fetchFraudAlerts, fetchAnalytics, fetchAiAnalytics]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token'); localStorage.removeItem('admin'); localStorage.removeItem('isAdmin');
        navigate('/admin/login');
    };

    const handleRefresh = () => {
        fetchDashboardData(); fetchAllUsers(); fetchAllTransactions();
        fetchAllLoans(); fetchFraudAlerts(); fetchAnalytics(); fetchAiAnalytics();
    };

    // CRUD handlers
    const handleCreateUser = async () => {
        setSaving(true);
        try { await apiPost('/api/admin/users', formData); setShowUserModal(false); setFormData({}); fetchAllUsers(); }
        catch (e: any) { setError(e.response?.data?.error || 'Failed to create user'); }
        finally { setSaving(false); }
    };

    const handleUpdateUser = async () => {
        setSaving(true);
        try { await apiPut(`/api/admin/users/${editUser.id}`, formData); setShowUserModal(false); setEditUser(null); setFormData({}); fetchAllUsers(); }
        catch (e: any) { setError(e.response?.data?.error || 'Failed to update user'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSaving(true);
        try {
            await apiDel(`/api/admin/${deleteTarget.type}/${deleteTarget.id}`);
            setDeleteTarget(null);
            if (deleteTarget.type === 'users') fetchAllUsers();
            else if (deleteTarget.type === 'transactions') fetchAllTransactions();
            else if (deleteTarget.type === 'loans') fetchAllLoans();
            else if (deleteTarget.type === 'fraud-alerts') fetchFraudAlerts();
        } catch (e: any) { setError(e.response?.data?.error || 'Failed to delete'); }
        finally { setSaving(false); }
    };

    const handleCreateTransaction = async () => {
        setSaving(true);
        try { await apiPost('/api/admin/transactions', formData); setShowTxModal(false); setFormData({}); fetchAllTransactions(); }
        catch (e: any) { setError(e.response?.data?.error || 'Failed to create transaction'); }
        finally { setSaving(false); }
    };

    const handleCreateLoan = async () => {
        setSaving(true);
        try { await apiPost('/api/admin/loans', formData); setShowLoanModal(false); setFormData({}); fetchAllLoans(); }
        catch (e: any) { setError(e.response?.data?.error || 'Failed to create loan'); }
        finally { setSaving(false); }
    };

    const handleUpdateLoan = async () => {
        setSaving(true);
        try { await apiPut(`/api/admin/loans/${editLoan.id}`, formData); setShowLoanModal(false); setEditLoan(null); setFormData({}); fetchAllLoans(); }
        catch (e: any) { setError(e.response?.data?.error || 'Failed to update loan'); }
        finally { setSaving(false); }
    };

    const handleReviewFraudAlert = async () => {
        if (!reviewAlert) return;
        setSaving(true);
        try {
            await apiPatch(`/api/admin/fraud-alerts/${reviewAlert.id}/review`, { status: formData.status, action_taken: formData.action_taken });
            setReviewAlert(null); setFormData({}); fetchFraudAlerts();
        } catch (e: any) { setError(e.response?.data?.error || 'Failed to review alert'); }
        finally { setSaving(false); }
    };

    const handleCreateFraudAlert = async () => {
        setSaving(true);
        try { await apiPost('/api/admin/fraud-alerts', formData); setShowFraudModal(false); setFormData({}); fetchFraudAlerts(); }
        catch (e: any) { setError(e.response?.data?.error || 'Failed to create alert'); }
        finally { setSaving(false); }
    };

    const apiPatch = useCallback((url: string, data: any) =>
        axios.patch(`${API_BASE_URL}${url}`, data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data)
    , [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#061428] flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const renderStatsCards = () => {
        if (!stats) return null;
        return (
            <>
                <StatCardComponent title="Total Users" value={stats.total_users.toLocaleString()} icon={<Users size={24} />} trend="+12%" trendUp color="blue" />
                <StatCardComponent title="Total Transactions" value={stats.total_transactions.toLocaleString()} icon={<Activity size={24} />} trend="+8%" trendUp color="green" />
                <StatCardComponent title="Active Today" value={stats.active_users_today.toLocaleString()} icon={<TrendingUp size={24} />} trend="+5%" trendUp color="purple" />
                <StatCardComponent title="Fraud Alerts" value={stats.fraud_alerts_pending} icon={<AlertTriangle size={24} />} trend={stats.fraud_alerts_pending > 0 ? 'Active' : 'Clear'} color="red" />
                <StatCardComponent title="Total Revenue" value={`$${(stats.total_revenue / 1000000).toFixed(2)}M`} icon={<DollarSign size={24} />} color="emerald" />
                <StatCardComponent title="Total Savings" value={`$${(stats.total_savings / 1000000).toFixed(2)}M`} icon={<Wallet size={24} />} color="blue" />
                <StatCardComponent title="Pending Loans" value={`${stats.pending_loans}`} icon={<HandCoinsIcon />} subtitle={`$${(stats.pending_loans_amount / 1000000).toFixed(2)}M`} color="amber" />
                <StatCardComponent title="Total Accounts" value={stats.total_accounts.toLocaleString()} icon={<Users size={24} />} color="purple" />
            </>
        );
    };

    return (
        <AdminLayout
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            adminName={admin?.name}
            adminEmail={admin?.email}
            adminRole={admin?.role}
            onLogout={handleLogout}
        >
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
                    <AlertTriangle size={18} /> {error}
                    <button onClick={() => setError('')} className="ml-auto text-sm underline">Dismiss</button>
                </div>
            )}

            {/* OVERVIEW TAB */}
            {selectedTab === 'overview' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Metrics</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                <Clock size={12} className="inline mr-1" />
                                {lastRefresh.toLocaleTimeString()}
                            </span>
                            <button onClick={handleRefresh} disabled={refreshing} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center">
                                {refreshing ? <ThreeBody size={16} /> : <RefreshCw size={16} />}
                            </button>
                        </div>
                    </div>
                    {!stats ? (
                        <div className="col-span-4 text-center py-12 text-gray-500 dark:text-gray-400">
                            <BarChart3 size={48} className="mx-auto mb-3 opacity-50" />
                            <p>Unable to load statistics.</p>
                            <button onClick={handleRefresh} className="mt-3 text-blue-600 hover:underline text-sm">Retry</button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{renderStatsCards()}</div>
                            {analyticsData?.user_growth?.length > 0 && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <ChartCardComponent title="User Growth (30 Days)">
                                        <div style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <LineChart data={analyticsData.user_growth}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                                                    <YAxis stroke="#9ca3af" />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="users_created" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </ChartCardComponent>
                                    <ChartCardComponent title="Transaction Trends (30 Days)">
                                        <div style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <BarChart data={analyticsData.transaction_trends}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                                                    <YAxis stroke="#9ca3af" />
                                                    <Tooltip />
                                                    <Bar dataKey="transaction_count" fill="#10b981" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </ChartCardComponent>
                                </div>
                            )}
                            {analyticsData && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <ChartCardComponent title="Loan Status Distribution">
                                        <div style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <PieChart>
                                                    <Pie data={analyticsData.loan_distribution || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                                                        <Cell fill="#3b82f6" /><Cell fill="#10b981" /><Cell fill="#f59e0b" /><Cell fill="#ef4444" />
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </ChartCardComponent>
                                    <ChartCardComponent title="Savings Goal Status">
                                        <div style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <PieChart>
                                                    <Pie data={analyticsData.savings_distribution || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                                                        <Cell fill="#8b5cf6" /><Cell fill="#ec4899" /><Cell fill="#6366f1" />
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </ChartCardComponent>
                                </div>
                            )}
                            <div className="flex justify-center">
                                <button onClick={() => { if (stats) exportCSV([stats], 'admin-stats'); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <Download size={16} /> Export Overview Report
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* USERS TAB */}
            {selectedTab === 'users' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Registered Users ({allUsers.length})</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setEditUser(null); setFormData({}); setShowUserModal(true); }} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                <Plus size={16} /> Add User
                            </button>
                            <button onClick={() => exportCSV(allUsers, 'registered-users')} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                                    <tr className="border-b border-gray-200 dark:border-gray-800">
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No registered users yet</td></tr>
                                    ) : allUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{user.name || 'N/A'}</td>
                                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                                            <td className="px-6 py-3 text-sm">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'}`}>
                                                    {user.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-3 text-right">
                                                <button onClick={() => { setEditUser(user); setFormData({ name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status, balance: user.balance }); setShowUserModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => setDeleteTarget({ type: 'users', id: user.id, name: user.name || user.email })} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-1" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TRANSACTIONS TAB */}
            {selectedTab === 'transactions' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transactions ({allTransactions.length})</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setFormData({}); setShowTxModal(true); }} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                <Plus size={16} /> Add Transaction
                            </button>
                            <button onClick={() => exportCSV(allTransactions, 'transactions')} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                                    <tr className="border-b border-gray-200 dark:border-gray-800">
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Reference</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allTransactions.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No transactions yet</td></tr>
                                    ) : allTransactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{tx.reference_number}</td>
                                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">{tx.type}</td>
                                            <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">${Number(tx.amount).toLocaleString()}</td>
                                            <td className="px-6 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${tx.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>{tx.status}</span>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-3 text-right">
                                                <button onClick={() => setDeleteTarget({ type: 'transactions', id: tx.id, name: tx.reference_number })} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
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
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loans ({allLoans.length})</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setEditLoan(null); setFormData({}); setShowLoanModal(true); }} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                <Plus size={16} /> Add Loan
                            </button>
                            <button onClick={() => exportCSV(allLoans, 'loans')} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                                    <tr className="border-b border-gray-200 dark:border-gray-800">
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Borrower</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Duration</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Risk Score</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allLoans.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No loans yet</td></tr>
                                    ) : allLoans.map((loan) => (
                                        <tr key={loan.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{loan.name || loan.email || 'N/A'}</td>
                                            <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">${Number(loan.amount).toLocaleString()}</td>
                                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{loan.duration || '-'} months</td>
                                            <td className="px-6 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${loan.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : loan.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{loan.status}</span>
                                            </td>
                                            <td className="px-6 py-3 text-sm">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: getRiskColor(loan.risk_score) }}>
                                                    {loan.risk_score || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <button onClick={() => { setEditLoan(loan); setFormData({ amount: loan.amount, duration: loan.duration, interest_rate: loan.interest_rate, status: loan.status, purpose: loan.purpose }); setShowLoanModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => setDeleteTarget({ type: 'loans', id: loan.id, name: `Loan #${loan.id}` })} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-1" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SECURITY TAB */}
            {selectedTab === 'security' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security & Fraud Alerts ({fraudAlerts.length})</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setFormData({}); setShowFraudModal(true); }} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                <Plus size={16} /> Add Alert
                            </button>
                            <button onClick={() => exportCSV(fraudAlerts, 'fraud-alerts')} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </div>
                    {fraudAlerts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                            <CheckCircle size={48} className="mx-auto mb-2 text-green-600" />
                            <p className="font-medium">No fraud alerts detected</p>
                            <p className="text-sm mt-1">System is secure. All activities are normal.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {fraudAlerts.map((alert) => (
                                <div key={alert.id} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-red-900 dark:text-red-200">{alert.alert_type}</h4>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${alert.severity === 'critical' ? 'bg-red-600 text-white' : alert.severity === 'high' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`}>{alert.severity}</span>
                                            </div>
                                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{alert.description}</p>
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-2">User: {alert.email || 'Unknown'}</p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-3">
                                            <button onClick={() => { setReviewAlert(alert); setFormData({ status: 'resolved', action_taken: '' }); }} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Review">
                                                <CheckCircle size={16} />
                                            </button>
                                            <button onClick={() => setDeleteTarget({ type: 'fraud-alerts', id: alert.id, name: alert.alert_type })} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DashboardCardComponent title="Active Sessions Today" value={stats?.active_users_today || 0} subtitle="Users online today" bgColor="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20" textColor="text-green-600 dark:text-green-400" />
                        <DashboardCardComponent title="Pending Fraud Alerts" value={stats?.fraud_alerts_pending || 0} subtitle="Requiring investigation" bgColor="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20" textColor="text-red-600 dark:text-red-400" />
                    </div>
                </div>
            )}

            {/* AI ANALYTICS TAB */}
            {selectedTab === 'ai-analytics' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Analytics</h2>
                        <button onClick={() => aiAnalytics && exportCSV([aiAnalytics], 'ai-analytics')} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <Download size={16} /> Export
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCardComponent title="AI Predictions" value={aiAnalytics?.adminAnalytics?.prediction_counts?.total_predictions || 0} icon={<Sparkles size={24} />} trend={aiAnalytics?.modelStatus?.status === 'offline' ? 'Offline' : 'Live'} color="blue" />
                        <StatCardComponent title="Fraud Alerts" value={stats?.fraud_alerts_pending || 0} icon={<AlertTriangle size={24} />} trend={(stats?.fraud_alerts_pending ?? 0) > 0 ? `${stats?.fraud_alerts_pending || 0} Pending` : 'Clear'} color="red" />
                        <StatCardComponent title="Approved Loans" value={aiAnalytics?.adminAnalytics?.prediction_counts?.approved_count || 0} icon={<TrendingUp size={24} />} trend="AI Powered" color="green" />
                        <StatCardComponent title="AI Engine" value={aiAnalytics?.modelStatus?.status === 'offline' ? 'Fallback' : 'Active'} icon={<Brain size={24} />} trend={aiAnalytics?.modelStatus?.ai_powered ? 'AI' : 'Standard'} color="purple" />
                        <StatCardComponent title="Model Accuracy" value={aiAnalytics?.modelStatus?.accuracy ? `${aiAnalytics.modelStatus.accuracy}%` : 'N/A'} icon={<Target size={24} />} trend={aiAnalytics?.modelStatus?.accuracy ? 'Tracked' : 'Offline'} color="green" />
                        <StatCardComponent title="Last Trained" value={aiAnalytics?.modelStatus?.last_trained || 'N/A'} icon={<RefreshCw size={24} />} trend={aiAnalytics?.modelStatus?.last_trained ? 'Updated' : 'Pending'} color="blue" />
                    </div>
                    {aiAnalytics?.financialInsights && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <DashboardCardComponent title="Total Savings" value={`RWF ${(aiAnalytics.financialInsights.total_savings || 0).toLocaleString()}`} subtitle="Across all users" bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20" textColor="text-emerald-600 dark:text-emerald-400" />
                            <DashboardCardComponent title="Active Loans" value={`RWF ${(aiAnalytics.financialInsights.total_active_loans || 0).toLocaleString()}`} subtitle="Total outstanding" bgColor="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20" textColor="text-blue-600 dark:text-blue-400" />
                            <DashboardCardComponent title="Avg Transaction" value={`RWF ${(aiAnalytics.financialInsights.average_transaction || 0).toLocaleString()}`} subtitle="Per transaction" bgColor="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20" textColor="text-amber-600 dark:text-amber-400" />
                        </div>
                    )}
                    <ChartCardComponent title="AI Engine Activity">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center p-4">
                                <Brain size={32} className={`mx-auto mb-2 ${aiAnalytics?.modelStatus?.status === 'offline' ? 'text-amber-500' : 'text-blue-500'}`} />
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{aiAnalytics?.modelStatus?.status === 'offline' ? 'Offline' : 'Active'}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI Engine</div>
                            </div>
                            <div className="text-center p-4">
                                <Target size={32} className="mx-auto mb-2 text-emerald-500" />
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{aiAnalytics?.adminAnalytics?.prediction_counts?.total_predictions || 0}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Predictions</div>
                            </div>
                            <div className="text-center p-4">
                                <AlertTriangle size={32} className="mx-auto mb-2 text-amber-500" />
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.fraud_alerts_pending || 0}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pending Alerts</div>
                            </div>
                            <div className="text-center p-4">
                                <DollarSign size={32} className="mx-auto mb-2 text-cyan-500" />
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{aiAnalytics?.financialInsights?.total_deposits ? `RWF ${Math.round(aiAnalytics.financialInsights.total_deposits / 1000000)}M` : 'N/A'}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Deposits</div>
                            </div>
                        </div>
                    </ChartCardComponent>
                </div>
            )}

            {/* WEBSITE TAB */}
            {selectedTab === 'website' && <WebsiteEditor />}

            {/* CRUD MODALS */}
            {showUserModal && (
                <ModalOverlay onClose={() => { setShowUserModal(false); setEditUser(null); }}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {editUser ? 'Edit User' : 'Create User'}
                    </h3>
                    <div className="space-y-3">
                        <InputField label="Name" value={formData.name || ''} onChange={(v) => setFormData({ ...formData, name: v })} />
                        <InputField label="Email" value={formData.email || ''} onChange={(v) => setFormData({ ...formData, email: v })} />
                        <InputField label="Phone" value={formData.phone || ''} onChange={(v) => setFormData({ ...formData, phone: v })} />
                        {!editUser && <InputField label="Password" type="password" value={formData.password || ''} onChange={(v) => setFormData({ ...formData, password: v })} />}
                        <SelectField label="Role" value={formData.role || 'user'} onChange={(v) => setFormData({ ...formData, role: v })} options={[{ value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }]} />
                        <SelectField label="Status" value={formData.status || 'active'} onChange={(v) => setFormData({ ...formData, status: v })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'suspended', label: 'Suspended' }]} />
                        <InputField label="Balance" type="text" inputMode="decimal" value={formData.balance ?? ''} onChange={(v) => setFormData({ ...formData, balance: Number(v) })} />
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={() => { setShowUserModal(false); setEditUser(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                            <button onClick={editUser ? handleUpdateUser : handleCreateUser} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                {saving ? <><ThreeBody size={16} color="#fff" /> Saving...</> : editUser ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {showTxModal && (
                <ModalOverlay onClose={() => setShowTxModal(false)}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Transaction</h3>
                    <div className="space-y-3">
                        <InputField label="Sender ID" type="number" value={formData.sender_id ?? ''} onChange={(v) => setFormData({ ...formData, sender_id: v ? Number(v) : null })} />
                        <InputField label="Receiver ID" type="number" value={formData.receiver_id ?? ''} onChange={(v) => setFormData({ ...formData, receiver_id: v ? Number(v) : null })} />
                        <InputField label="Amount" type="text" inputMode="decimal" value={formData.amount ?? ''} onChange={(v) => setFormData({ ...formData, amount: Number(v) })} />
                        <SelectField label="Type" value={formData.type || 'transfer'} onChange={(v) => setFormData({ ...formData, type: v })} options={[
                            { value: 'transfer', label: 'Transfer' }, { value: 'deposit', label: 'Deposit' },
                            { value: 'withdrawal', label: 'Withdrawal' }, { value: 'payment', label: 'Payment' }
                        ]} />
                        <SelectField label="Status" value={formData.status || 'completed'} onChange={(v) => setFormData({ ...formData, status: v })} options={[
                            { value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }
                        ]} />
                        <InputField label="Description" value={formData.description || ''} onChange={(v) => setFormData({ ...formData, description: v })} />
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={() => setShowTxModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                            <button onClick={handleCreateTransaction} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                {saving ? <><ThreeBody size={16} color="#fff" /> Saving...</> : 'Create'}
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {showLoanModal && (
                <ModalOverlay onClose={() => { setShowLoanModal(false); setEditLoan(null); }}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {editLoan ? 'Edit Loan' : 'Create Loan'}
                    </h3>
                    <div className="space-y-3">
                        {!editLoan && <InputField label="User ID" type="number" value={formData.user_id ?? ''} onChange={(v) => setFormData({ ...formData, user_id: Number(v) })} />}
                        <InputField label="Amount" type="text" inputMode="decimal" value={formData.amount ?? ''} onChange={(v) => setFormData({ ...formData, amount: Number(v) })} />
                        <InputField label="Duration (months)" type="text" inputMode="numeric" value={formData.duration ?? 12} onChange={(v) => setFormData({ ...formData, duration: Number(v) })} />
                        <InputField label="Interest Rate (%)" type="number" value={formData.interest_rate ?? 5} onChange={(v) => setFormData({ ...formData, interest_rate: Number(v) })} />
                        <SelectField label="Status" value={formData.status || 'pending'} onChange={(v) => setFormData({ ...formData, status: v })} options={[
                            { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' },
                            { value: 'rejected', label: 'Rejected' }, { value: 'disbursed', label: 'Disbursed' }
                        ]} />
                        <InputField label="Purpose" value={formData.purpose || ''} onChange={(v) => setFormData({ ...formData, purpose: v })} />
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={() => { setShowLoanModal(false); setEditLoan(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                            <button onClick={editLoan ? handleUpdateLoan : handleCreateLoan} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                {saving ? <><ThreeBody size={16} color="#fff" /> Saving...</> : editLoan ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {showFraudModal && (
                <ModalOverlay onClose={() => setShowFraudModal(false)}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Fraud Alert</h3>
                    <div className="space-y-3">
                        <InputField label="User ID" type="number" value={formData.user_id ?? ''} onChange={(v) => setFormData({ ...formData, user_id: Number(v) })} />
                        <InputField label="Alert Type" value={formData.alert_type || ''} onChange={(v) => setFormData({ ...formData, alert_type: v })} />
                        <InputField label="Description" value={formData.description || ''} onChange={(v) => setFormData({ ...formData, description: v })} />
                        <SelectField label="Severity" value={formData.severity || 'medium'} onChange={(v) => setFormData({ ...formData, severity: v })} options={[
                            { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }
                        ]} />
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={() => setShowFraudModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                            <button onClick={handleCreateFraudAlert} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                {saving ? <><ThreeBody size={16} color="#fff" /> Saving...</> : 'Create'}
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {reviewAlert && (
                <ModalOverlay onClose={() => { setReviewAlert(null); setFormData({}); }}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review Fraud Alert</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Alert: <strong>{reviewAlert.alert_type}</strong> — {reviewAlert.description}
                    </p>
                    <div className="space-y-3">
                        <SelectField label="Status" value={formData.status || 'resolved'} onChange={(v) => setFormData({ ...formData, status: v })} options={[
                            { value: 'resolved', label: 'Resolved' }, { value: 'false_positive', label: 'False Positive' }
                        ]} />
                        <InputField label="Action Taken" value={formData.action_taken || ''} onChange={(v) => setFormData({ ...formData, action_taken: v })} />
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={() => { setReviewAlert(null); setFormData({}); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                            <button onClick={handleReviewFraudAlert} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                                {saving ? <><ThreeBody size={16} color="#fff" /> Saving...</> : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {deleteTarget && (
                <ModalOverlay onClose={() => setDeleteTarget(null)}>
                    <div className="text-center">
                        <AlertTriangle size={48} className="mx-auto mb-3 text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mb-4">This action cannot be undone.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                            <button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                                {saving ? <><ThreeBody size={16} color="#fff" /> Deleting...</> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}
        </AdminLayout>
    );
};

// Modal Overlay
const ModalOverlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div className="bg-white dark:bg-[#0B1F3A] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

// Input Field
const InputField: React.FC<{ label: string; type?: string; inputMode?: string; value: string | number; onChange: (v: string) => void }> = ({ label, type = 'text', inputMode, value, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input type={type} inputMode={inputMode as any} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
);

// Select Field
const SelectField: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }> = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

// Helper Components

interface StatCardComponentProps {
    title: string; value: string | number; icon: React.ReactNode;
    trend?: string; trendUp?: boolean; color: string; subtitle?: string;
}

const StatCardComponent: React.FC<StatCardComponentProps> = ({ title, value, icon, trend, trendUp, color, subtitle }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    };
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
                {trend && <span className={`text-xs font-bold px-2 py-1 rounded ${trendUp ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>{trend}</span>}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
    );
};

const DashboardCardComponent: React.FC<{ title: string; value: string | number; subtitle?: string; bgColor: string; textColor: string }> =
    ({ title, value, subtitle, bgColor, textColor }) => (
        <div className={`rounded-xl p-6 ${bgColor}`}>
            <p className={`text-sm font-medium ${textColor} mb-1`}>{title}</p>
            <p className={`text-3xl font-bold ${textColor} mb-2`}>{value}</p>
            {subtitle && <p className={`text-xs ${textColor} opacity-75`}>{subtitle}</p>}
        </div>
    );

const ChartCardComponent: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
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

function HandCoinsIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}

export default AdminDashboard;
