import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyzeSpending, getModelStatus } from '../services/aiService';
import { useBanking } from '../context/BankingContext';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

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