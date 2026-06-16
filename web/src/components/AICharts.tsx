import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyzeSpending, getModelStatus } from '../services/aiService';
import { useBanking } from '../context/BankingContext';
import { useTheme } from '../context/ThemeContext';
import { pendingCategoryBreakdown, pendingMonthlyTrend, SPENDING_CATEGORIES, pendingAnalysisTransactions } from '../data/mockData';

const COLORS = ['#0A9396', '#005F73', '#94D2BD', '#E9C46A', '#F4A261', '#E76F51', '#CA6702', '#9B2226', '#6A4C93', '#1982C4', '#8AC926', '#6C757D'];

const AICharts: React.FC = () => {
    const { transactions } = useBanking();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [spendingData, setSpendingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modelStatus, setModelStatus] = useState<any>(null);

    useEffect(() => {
        loadAIData();
    }, [transactions]);

    const loadAIData = async () => {
        setLoading(true);
        
        try {
            // Get model status
            const status = await getModelStatus();
            setModelStatus(status);
            
            // Analyze spending
            if (transactions && transactions.length > 0) {
                const analysis = await analyzeSpending(transactions, 5000);
                setSpendingData(analysis);
            }
        } catch (error) {
            console.error('Error loading AI data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading AI insights...</div>;
    }

    // Custom label renderer to handle undefined percent
    const renderCustomLabel = ({ name, percent }: { name?: string; percent?: number }) => {
        if (percent === undefined) return name;
        return `${name ?? ''}: ${(percent * 100).toFixed(0)}%`;
    };

    const cardBg = isDark ? '#0f172a' : 'white';
    const cardText = isDark ? '#e2e8f0' : '#1e293b';
    const mutedBg = isDark ? '#1e293b' : '#f8f9fa';
    const mutedText = isDark ? '#94a3b8' : '#475569';

    return (
        <div className="ai-charts-container" style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', color: cardText }}>
                AI-Powered Financial Intelligence
            </h2>
            
            {/* Model Status */}
            {modelStatus && (
                <div style={{ 
                    background: modelStatus.ai_powered ? (isDark ? '#064e3b' : '#e6f7e6') : (isDark ? '#78350f' : '#fff3e0'),
                    padding: '12px 20px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: modelStatus.ai_powered ? (isDark ? '#a7f3d0' : '#000') : (isDark ? '#fde68a' : '#000'),
                }}>
                    <span>{modelStatus.ai_powered ? '✅' : '⚠️'}</span>
                    <span>{modelStatus.ai_powered ? 'AI Engine Active' : 'AI Engine Offline - Using Fallback'}</span>
                </div>
            )}
            
            {/* ═══════════════════════════════════════════════════════════
                PENDING ANALYSIS DATASET — Demo data with 12 clear categories
                This dataset is loaded and waiting for AI/ML analysis.
                ═══════════════════════════════════════════════════════════ */}
            <div style={{ 
                background: cardBg,
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '2px dashed #f59e0b',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ 
                        background: '#fef3c7', color: '#92400e', 
                        padding: '6px 14px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: 700, 
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                    }}>
                        ⏳ DATASET PENDING ANALYSIS
                    </span>
                    <span style={{ fontSize: '13px', color: mutedText }}>
                        {pendingAnalysisTransactions.length} transactions · 12 categories · 12-month trend
                    </span>
                </div>

                <h3 style={{ marginBottom: '16px', color: cardText, fontSize: '16px', fontWeight: 600 }}>
                    Spending by Category — Pending Analysis
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                        <Pie
                            data={pendingCategoryBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }: { name?: string; percent?: number }) => `${name}: ${(percent != null ? (percent * 100).toFixed(0) : 0)}%`}
                            outerRadius={150}
                            dataKey="value"
                            nameKey="name"
                        >
                            {pendingCategoryBreakdown.map((entry, index) => (
                                <Cell key={`pending-cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `RWF ${value?.toLocaleString()}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>

                {/* Category Legend Table */}
                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                    {pendingCategoryBreakdown.map(cat => (
                        <div key={cat.name} style={{ 
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 12px', borderRadius: '8px',
                            background: mutedBg,
                        }}>
                            <span style={{ width: 12, height: 12, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: cardText }}>{cat.name}</div>
                                <div style={{ fontSize: '11px', color: mutedText }}>
                                    RWF {cat.value.toLocaleString()} ({cat.percentage}%)
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trend Chart */}
                <h3 style={{ margin: '24px 0 16px', color: cardText, fontSize: '16px', fontWeight: 600 }}>
                    Spending Trend — Pending Analysis (12 months)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={pendingMonthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                        <XAxis dataKey="month" tick={{ fill: mutedText, fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fill: mutedText, fontSize: 11 }} />
                        <Tooltip formatter={(value: any) => `RWF ${value?.toLocaleString()}`} />
                        <Legend />
                        <Line type="monotone" dataKey="income" name="Income" stroke="#0A9396" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="spending" name="Spending" stroke="#E76F51" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>

                <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fef3c7', borderRadius: '10px', fontSize: '13px', color: '#92400e' }}>
                    <strong>📋 Research Note:</strong> This dataset contains {pendingAnalysisTransactions.length} categorized transactions across 12 distinct spending categories with 12 months of trend data — ready for AI/ML analysis, statistical modeling, and dissertation visualization.
                </div>
            </div>

            {/* Spending by Category Chart */}
            {spendingData?.category_breakdown && spendingData.category_breakdown.length > 0 && (
                <div style={{ 
                    background: cardBg,
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginBottom: '16px', color: cardText }}>Spending by Category</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={spendingData.category_breakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomLabel}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                            >
                                {spendingData.category_breakdown.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => `RWF ${value?.toLocaleString()}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    
                    <div style={{ marginTop: '20px', padding: '16px', background: mutedBg, borderRadius: '12px' }}>
                        <h4 style={{ color: cardText, margin: 0 }}>Insights</h4>
                        <ul style={{ marginTop: '8px', paddingLeft: '20px', color: mutedText }}>
                            {(Array.isArray(spendingData.spending_insights) ? spendingData.spending_insights : []).map((insight: string, i: number) => (
                                <li key={i}>{insight}</li>
                            ))}
                            <li>Total Spent: RWF {spendingData.total_spent?.toLocaleString()}</li>
                            <li>Savings Rate: {spendingData.savings_rate}%</li>
                            <li>Top Category: {spendingData.top_spending_category}</li>
                        </ul>
                    </div>
                </div>
            )}
            
            {/* Spending Trend Chart */}
            {transactions && transactions.length > 0 && (
                <div style={{ 
                    background: cardBg,
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginBottom: '16px', color: cardText }}>Spending Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={transactions.slice(0, 30).map((t: any) => ({
                            date: new Date(t.created_at).toLocaleDateString(),
                            amount: Number(t.amount) || 0
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                            <XAxis dataKey="date" tick={{ fill: mutedText, fontSize: 12 }} />
                            <YAxis tick={{ fill: mutedText, fontSize: 12 }} />
                            <Tooltip formatter={(value: any) => `RWF ${value?.toLocaleString()}`} />
                            <Line type="monotone" dataKey="amount" stroke="#0A9396" name="Spending" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
            
            {/* No Data Message */}
            {(!spendingData?.category_breakdown || spendingData.category_breakdown.length === 0) && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    background: mutedBg,
                    borderRadius: '12px',
                    color: mutedText,
                }}>
                    <p>No transaction data available for AI analysis.</p>
                    <p>Make some transactions to see AI-powered insights!</p>
                </div>
            )}
        </div>
    );
};

export default AICharts;