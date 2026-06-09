import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionCard from '../components/SectionCard';

import { paymentService } from '../services/api';
import * as aiEngine from '../services/aiService';
import { useTheme } from '../context/ThemeContext';
import { useBanking } from '../context/BankingContext';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Brain, TrendingUp, RefreshCw, DollarSign, Send, ArrowDown, ArrowUp, ArrowRightLeft } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

const RISK_COLORS: Record<string, string> = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed' };

const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
        case 'deposit': case 'credit': return <ArrowDown size={14} color="#10b981" />;
        case 'withdrawal': case 'withdraw': case 'debit': return <ArrowUp size={14} color="#ef4444" />;
        case 'transfer': return <ArrowRightLeft size={14} color="#f59e0b" />;
        case 'payment': case 'send': return <Send size={14} color="#3b82f6" />;
        default: return <DollarSign size={14} />;
    }
};

const toNum = (v: any) => Number(v) || 0;

const computeRiskScore = (tx: any): { level: 'low' | 'medium' | 'high' | 'critical'; score: number } => {
    const amount = toNum(tx.amount);
    let score = 0;
    if (amount > 1000000) score += 40;
    else if (amount > 500000) score += 30;
    else if (amount > 100000) score += 15;
    if (tx.status === 'flagged') score += 30;
    if (tx.status === 'failed') score += 20;
    const level = score >= 50 ? 'critical' : score >= 30 ? 'high' : score >= 15 ? 'medium' : 'low';
    return { level, score };
};

const computeFallbackFraudAlerts = (txData: any[]) => {
    return txData.filter(tx => toNum(tx.amount) > 500000 || tx.status === 'flagged').map(tx => ({
        id: `fraud-${tx.id}`,
        type: toNum(tx.amount) > 500000 ? 'large_transaction' : 'flagged',
        severity: toNum(tx.amount) > 1000000 ? 'high' : 'medium',
        status: 'pending',
        amount: toNum(tx.amount),
        description: toNum(tx.amount) > 500000 ? `Large transaction of RWF ${toNum(tx.amount).toLocaleString()} detected` : 'Flagged transaction',
        timestamp: tx.created_at || new Date().toISOString(),
        user_email: tx.recipient_name || 'Unknown',
        region: 'Kigali',
    }));
};

const DEMO_TRANSACTIONS = [
  { id: 1, type: 'deposit', amount: 1500000, description: 'Salary Deposit - March 2026', status: 'completed', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), balance_after: 3500000, recipient_name: '' },
  { id: 2, type: 'payment', amount: 250000, description: 'Payment to Kigali Mart', status: 'completed', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), balance_after: 3250000, recipient_name: 'Kigali Mart', recipient_account_number: 'RW1001234567' },
  { id: 3, type: 'transfer', amount: 500000, description: 'Transfer to Savings Account', status: 'completed', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), balance_after: 2750000, recipient_name: 'My Savings' },
  { id: 4, type: 'withdrawal', amount: 100000, description: 'ATM Withdrawal - Downtown', status: 'completed', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), balance_after: 2650000 },
  { id: 5, type: 'deposit', amount: 800000, description: 'Freelance Payment - Web Project', status: 'completed', created_at: new Date(Date.now() - 7 * 86400000).toISOString(), balance_after: 3450000 },
  { id: 6, type: 'send', amount: 75000, description: 'Mobile Money to Mom', status: 'completed', created_at: new Date(Date.now() - 10 * 86400000).toISOString(), balance_after: 3375000, recipient_name: 'Marie', recipient_account_number: '0788123456' },
  { id: 7, type: 'payment', amount: 180000, description: 'MTN Airtime & Data Bundle', status: 'completed', created_at: new Date(Date.now() - 12 * 86400000).toISOString(), balance_after: 3195000 },
  { id: 8, type: 'transfer', amount: 2000000, description: 'Investment Portfolio Transfer', status: 'flagged', created_at: new Date(Date.now() - 14 * 86400000).toISOString(), balance_after: 1195000, recipient_name: 'Wealth Management Fund' },
];

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState('All');
    const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiOnline, setAiOnline] = useState(false);
    const { balance } = useBanking();
    const navigate = useNavigate();

    const isInflow = (t: any) => {
        if (t.balance_before != null && t.balance_after != null) return Number(t.balance_after) > Number(t.balance_before);
        return ['deposit', 'credit'].includes(t.type);
    };
    const isOutflow = (t: any) => {
        if (t.balance_before != null && t.balance_after != null) return Number(t.balance_after) < Number(t.balance_before);
        return ['withdrawal', 'debit', 'transfer', 'payment', 'send'].includes(t.type);
    };
    const computedAnalysis = useMemo(() => {
        const totalIn = transactions.filter(t => isInflow(t)).reduce((s, t) => s + Number(t.amount || 0), 0);
        const totalOut = transactions.filter(t => isOutflow(t)).reduce((s, t) => s + Number(t.amount || 0), 0);
        const riskDist: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
        transactions.forEach(tx => {
            const { level } = computeRiskScore(tx);
            riskDist[level]++;
        });
        return {
            total_in: totalIn,
            total_out: totalOut,
            net_flow: totalIn - totalOut,
            tx_count: transactions.length,
            risk_distribution: riskDist,
        };
    }, [transactions]);

    const displayAnalysis = aiAnalysis || computedAnalysis;

    useEffect(() => {
        fetchTransactions();
    }, []);

    const normalizeTx = (tx: any) => ({
        ...tx,
        amount: Number(tx.amount) || 0,
        type: String(tx.type || ''),
        description: String(typeof tx.description === 'string' ? tx.description : tx.description || ''),
        status: String(tx.status || ''),
        category: String(tx.category || '') || 'other',
        recipient_name: typeof tx.recipient_name === 'string' ? tx.recipient_name : '',
        sender_name: typeof tx.sender_name === 'string' ? tx.sender_name : '',
        recipient_account_number: typeof tx.recipient_account_number === 'string' ? tx.recipient_account_number : '',
        created_at: typeof tx.created_at === 'string' ? tx.created_at : new Date().toISOString(),
        balance_after: tx.balance_after != null ? Number(tx.balance_after) : undefined,
    });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await paymentService.getTransactionHistory();
            const txData = (response.data?.transactions ?? []).map(normalizeTx);
            setTransactions(txData);
            await analyzeWithAI(txData);
            await loadAIAnalysis();
        } catch (error) {
            console.error('Error fetching transactions, using demo data:', error);
            const demo = DEMO_TRANSACTIONS.map(normalizeTx);
            setTransactions(demo);
            await analyzeWithAI(demo);
        } finally {
            setLoading(false);
        }
    };

    const loadAIAnalysis = async () => {
        setAiLoading(true);
        try {
            const status = await aiEngine.getModelStatus().catch(() => null);
            setAiOnline(status?.status && status?.status !== 'offline');
        } catch { } finally { setAiLoading(false); }
    };

    const analyzeWithAI = async (txData: any[]) => {
        const totalIn = txData.filter(t => isInflow(t)).reduce((s, t) => s + Number(t.amount || 0), 0);
        const totalOut = txData.filter(t => isOutflow(t)).reduce((s, t) => s + Number(t.amount || 0), 0);

        const riskDistribution: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
        let aiAlerts: any[] = [];

        const suspicious = txData.filter(tx => toNum(tx.amount) > 500000 || tx.status === 'flagged');
        for (const tx of suspicious.slice(0, 10)) {
            try {
                const result = await aiEngine.detectFraud({ amount: toNum(tx.amount), transaction_time: tx.created_at }).catch(() => null);
                if (result?.is_fraudulent) {
                    aiAlerts.push({
                        id: `ai-fraud-${tx.id}`,
                        type: 'ai_detected_fraud',
                        severity: typeof result.risk_level === 'string' ? result.risk_level : 'high',
                        status: 'pending',
                        amount: toNum(tx.amount),
                        description: typeof result.reason === 'string' ? result.reason : `AI flagged transaction of RWF ${toNum(tx.amount).toLocaleString()}`,
                        timestamp: typeof tx.created_at === 'string' ? tx.created_at : new Date().toISOString(),
                        user_email: typeof tx.recipient_name === 'string' ? tx.recipient_name : 'Unknown',
                        region: typeof result.location === 'string' ? result.location : 'Kigali',
                    });
                }
            } catch {}
        }

        if (aiAlerts.length === 0) {
            aiAlerts = computeFallbackFraudAlerts(txData);
        }

        txData.forEach(tx => {
            const { level } = computeRiskScore(tx);
            riskDistribution[level]++;
        });

        let spendingInsight = '';
        try {
            if (txData.length > 0) {
                const spending = await aiEngine.analyzeSpending(txData, undefined).catch(() => null);
                const raw = spending?.insight || spending?.summary;
                spendingInsight = typeof raw === 'string' ? raw : '';
            }
        } catch {}

        setFraudAlerts(aiAlerts);
        setAiAnalysis({
            total_in: totalIn,
            total_out: totalOut,
            net_flow: totalIn - totalOut,
            suspicious_count: aiAlerts.length,
            tx_count: txData.length,
            risk_distribution: riskDistribution,
            insight: spendingInsight || `Your account shows ${totalIn > totalOut ? 'positive' : 'negative'} net flow of RWF ${Math.abs(totalIn - totalOut).toLocaleString()}.`,
        });
    };

    const categories = ['All', 'Sent', ...Array.from(new Set(transactions.map(t => t.type)))];
    const filtered = selected === 'All' ? transactions : selected === 'Sent' ? transactions.filter(t => ['payment', 'send', 'transfer'].includes(t.type)) : transactions.filter((item) => item.type === selected);
    const totalByType = categories.filter(c => c !== 'All' && c !== 'Sent').map(category => ({
        category,
        total: transactions.filter(tx => tx.type === category).reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
    }));
    const sentTotal = transactions.filter(t => ['payment', 'send', 'transfer'].includes(t.type)).reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const mutedColor = isDark ? '#94a3b8' : '#64748b';
    const textColor = isDark ? '#e2e8f0' : '#1e293b';

    const flowData = [
        { name: 'Inflow', value: displayAnalysis.total_in },
        { name: 'Outflow', value: displayAnalysis.total_out },
    ];

    const typeKeys = Array.from(new Set(transactions.map(t => t.type)));
    const typeData = typeKeys.map(type => ({
        type,
        total: transactions.filter(tx => tx.type === type).reduce((s, tx) => s + Number(tx.amount || 0), 0),
    }));

    const TYPE_COLORS: Record<string, string> = {
        deposit: '#10b981', credit: '#10b981',
        withdrawal: '#ef4444', debit: '#ef4444',
        transfer: '#f59e0b',
        payment: '#3b82f6', send: '#3b82f6',
    };

    const COLORS = ['#10b981', '#ef4444'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ flex: 1, padding: 24, background: isDark ? '#0B1F3A' : '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                    <div>
                        <h1 style={{ color: textColor }}>Transactions</h1>
                        <p style={{ color: mutedColor, marginTop: 8 }}>Review your spending with AI-powered fraud detection and risk analysis.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>

                        {balance !== null && (
                            <div style={{
                                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                                background: 'rgba(16,185,129,0.15)', color: '#10b981',
                            }}>
                                Balance: RWF {balance.toLocaleString()}
                            </div>
                        )}
                        <div style={{
                            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                            background: aiOnline ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: aiOnline ? '#10b981' : '#f59e0b',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <Brain size={14} /> AI {aiOnline ? 'Active' : 'Standard'}
                        </div>
                        <button onClick={fetchTransactions} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, background: isDark ? '#0f172a' : 'white', color: mutedColor, cursor: 'pointer' }}>
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <SectionCard title="AI Transaction Analysis" subtitle="Real-time risk assessment">
                        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                            {loading && transactions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 20, color: mutedColor }}>Loading analysis...</div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                        <span style={{ fontSize: 13, color: mutedColor }}>Total Inflow</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>RWF {(displayAnalysis.total_in || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                        <span style={{ fontSize: 13, color: mutedColor }}>Total Outflow</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>RWF {(displayAnalysis.total_out || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                        <span style={{ fontSize: 13, color: mutedColor }}>Net Flow</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: (displayAnalysis.net_flow || 0) >= 0 ? '#10b981' : '#ef4444' }}>RWF {(displayAnalysis.net_flow || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                        <span style={{ fontSize: 13, color: mutedColor }}>Suspicious Detected</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: (displayAnalysis.suspicious_count || 0) > 0 ? '#ef4444' : '#10b981' }}>{displayAnalysis.suspicious_count || 0}</span>
                                    </div>
                                    {displayAnalysis.insight && (
                                        <div style={{ padding: '10px 12px', borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc', fontSize: 12, color: mutedColor, lineHeight: 1.5 }}>
                                            <Brain size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                            {displayAnalysis.insight}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </SectionCard>

                    <SectionCard title="Flow Analysis" subtitle="Income vs Spending breakdown">
                        {displayAnalysis.total_in > 0 || displayAnalysis.total_out > 0 ? (
                            <div style={{ marginTop: 8 }}>
                                <div style={{ width: '100%', height: 200 }}>
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                        <PieChart>
                                            <Pie data={flowData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} label={({ name, value }: any) => `${name}: RWF ${(value || 0).toLocaleString()}`}>
                                                {flowData.map((_, idx) => <Cell key={idx} fill={COLORS[idx]} />)}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => `RWF ${Number(value || 0).toLocaleString()}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 12, color: mutedColor, marginTop: 8, marginBottom: 12 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 4, background: '#10b981' }} /> Inflow: RWF {(displayAnalysis.total_in || 0).toLocaleString()}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 4, background: '#ef4444' }} /> Outflow: RWF {(displayAnalysis.total_out || 0).toLocaleString()}</span>
                                </div>
                                {typeData.length > 1 && (
                                    <div style={{ width: '100%', height: 160, borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, paddingTop: 12 }}>
                                        <div style={{ fontSize: 11, color: mutedColor, marginBottom: 6, fontWeight: 600 }}>By Type</div>
                                        <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <BarChart data={typeData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                                                    <XAxis dataKey="type" tick={{ fill: mutedColor, fontSize: 11 }} />
                                                    <YAxis tick={{ fill: mutedColor, fontSize: 10 }} />
                                                    <Tooltip formatter={(value: any) => `RWF ${Number(value || 0).toLocaleString()}`} />
                                                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                                        {typeData.map((entry) => (
                                                            <Cell key={entry.type} fill={TYPE_COLORS[entry.type] || '#64748b'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mutedColor, fontSize: 13 }}>
                                No flow data available yet
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard title="Transaction Risk Scoring">
                        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                            {['low', 'medium', 'high', 'critical'].map(level => (
                                <div key={level} style={{ padding: 12, borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <AlertTriangle size={16} color={RISK_COLORS[level]} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: textColor, textTransform: 'capitalize' }}>{level} Risk</div>
                                        <div style={{ fontSize: 12, color: mutedColor }}>
                                            {(displayAnalysis.risk_distribution?.[level] || 0)} transactions
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                    {categories.map((category) => (
                        <button key={category} onClick={() => setSelected(category)}
                            style={{
                                borderRadius: 999, border: selected === category ? '1px solid #0A9396' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                background: selected === category ? '#0A9396' : (isDark ? '#0F172A' : 'white'),
                                color: selected === category ? 'white' : (isDark ? '#e2e8f0' : '#0f172a'),
                                padding: '10px 16px', cursor: 'pointer'
                            }}>
                            {category}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 24 }}>
                    <SectionCard title="Summary" subtitle="Total transactions by type.">
                        <div style={{ marginTop: 16 }}>
                            {totalByType.length === 0 && transactions.length === 0 ? (
                                <div style={{ color: '#64748b', padding: 16 }}>No transactions yet.</div>
                            ) : totalByType.length === 0 && transactions.length > 0 ? (
                                transactions.map(tx => (
                                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <span style={{ color: textColor }}>{tx.type || 'transaction'}</span>
                                        <strong style={{ color: textColor }}>RWF {Number(tx.amount || 0).toLocaleString()}</strong>
                                    </div>
                                ))
                            ) : (
                                <>
                                    {totalByType.map(({ category, total }) => (
                                        <div key={category} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{ color: textColor }}>{category}</span>
                                            <strong style={{ color: textColor }}>RWF {total.toLocaleString()}</strong>
                                        </div>
                                    ))}
                                    {sentTotal > 0 && (
                                        <div key="sent" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, paddingTop: 12 }}>
                                            <span style={{ color: textColor, fontWeight: 600 }}>Sent (Total)</span>
                                            <strong style={{ color: '#ef4444' }}>RWF {sentTotal.toLocaleString()}</strong>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </SectionCard>
                    <SectionCard title="Account Info" subtitle="Your account details.">
                        <div style={{ marginTop: 16, color: mutedColor }}>
                            <div style={{ marginBottom: 12 }}>Total Transactions: <strong style={{ color: textColor }}>{transactions.length}</strong></div>
                            <div>Completed: <strong style={{ color: textColor }}>{transactions.filter(t => t.status === 'completed').length}</strong></div>
                        </div>
                    </SectionCard>
                </div>

                <SectionCard title="Transaction History">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading transactions...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>{selected === 'Sent' ? 'No sent transactions found. Make a payment or transfer to see it here.' : 'No transactions yet. Make your first deposit or transfer to get started.'}</div>
                    ) : (
                        filtered.map((tx) => {
                            const { level, score } = computeRiskScore(tx);
                            const riskColor = RISK_COLORS[level];
                            return (
                                <div key={tx.id} style={{
                                    display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, padding: 16, marginTop: 12,
                                    borderRadius: 16, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                    background: level === 'critical' || level === 'high' ? (isDark ? '#3b1c1c' : '#fef2f2') : (isDark ? '#0B1527' : 'white'),
                                    borderLeft: `4px solid ${riskColor}`,
                                    alignItems: 'center',
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: tx.type === 'deposit' || tx.type === 'credit' ? 'rgba(16,185,129,0.15)' :
                                            tx.type === 'transfer' ? 'rgba(245,158,11,0.15)' :
                                            tx.type === 'payment' || tx.type === 'send' ? 'rgba(59,130,246,0.15)' :
                                            'rgba(239,68,68,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {getTypeIcon(tx.type)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: textColor }}>{tx.description || tx.type}</div>
                                        <div style={{ color: mutedColor, marginTop: 4, fontSize: 12 }}>
                                            {getTypeIcon(tx.type)} {tx.type} • {new Date(tx.created_at).toLocaleDateString()}
                                            {tx.recipient_name && <span> • To: {tx.recipient_name}</span>}
                                            {tx.sender_name && <span> • From: {tx.sender_name}</span>}
                                            {tx.recipient_account_number && <span> • Acct: {tx.recipient_account_number}</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                                                background: `${riskColor}20`, color: riskColor,
                                            }}>
                                                Risk: {level.toUpperCase()} ({score})
                                            </span>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                                                background: tx.status === 'completed' ? 'rgba(16,185,129,0.15)' :
                                                    tx.status === 'failed' ? 'rgba(239,68,68,0.15)' :
                                                    tx.status === 'flagged' ? 'rgba(245,158,11,0.15)' :
                                                    'rgba(148,163,184,0.15)',
                                                color: tx.status === 'completed' ? '#10b981' :
                                                    tx.status === 'failed' ? '#ef4444' :
                                                    tx.status === 'flagged' ? '#f59e0b' : mutedColor,
                                            }}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: textColor, fontSize: 15 }}>
                                            {['withdrawal', 'debit', 'payment', 'send', 'transfer'].includes(tx.type) ? '-' : ''}
                                            RWF {Number(tx.amount).toLocaleString()}
                                        </div>
                                        {tx.balance_after != null && (
                                            <div style={{ color: mutedColor, marginTop: 4, fontSize: 11 }}>
                                                Balance: RWF {Number(tx.balance_after).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </SectionCard>
            </div>
            <Footer />
        </div>
    );
};

export default Transactions;
