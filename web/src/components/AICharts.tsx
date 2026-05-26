import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyzeSpending, getModelStatus } from '../services/aiService';
import { useBanking } from '../context/BankingContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

const AICharts: React.FC = () => {
    const { transactions } = useBanking();
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

    return (
        <div className="ai-charts-container" style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
                🤖 AI-Powered Financial Intelligence
            </h2>
            
            {/* Model Status */}
            {modelStatus && (
                <div style={{ 
                    background: modelStatus.ai_powered ? '#e6f7e6' : '#fff3e0',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>{modelStatus.ai_powered ? '✅' : '⚠️'}</span>
                    <span>{modelStatus.ai_powered ? 'AI Engine Active' : 'AI Engine Offline - Using Fallback'}</span>
                </div>
            )}
            
            {/* Spending by Category Chart */}
            {spendingData?.category_breakdown && spendingData.category_breakdown.length > 0 && (
                <div style={{ 
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginBottom: '16px' }}>Spending by Category</h3>
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
                    
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '12px' }}>
                        <h4>Insights</h4>
                        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                            {spendingData.spending_insights?.map((insight: string, i: number) => (
                                <li key={i}>💡 {insight}</li>
                            ))}
                            <li>💰 Total Spent: RWF {spendingData.total_spent?.toLocaleString()}</li>
                            <li>📈 Savings Rate: {spendingData.savings_rate}%</li>
                            <li>🏆 Top Category: {spendingData.top_spending_category}</li>
                        </ul>
                    </div>
                </div>
            )}
            
            {/* Spending Trend Chart */}
            {transactions && transactions.length > 0 && (
                <div style={{ 
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginBottom: '16px' }}>Spending Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={transactions.slice(0, 30).map((t: any) => ({
                            date: new Date(t.created_at).toLocaleDateString(),
                            amount: t.amount
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
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
                    background: '#f8f9fa',
                    borderRadius: '12px'
                }}>
                    <p>No transaction data available for AI analysis.</p>
                    <p>Make some transactions to see AI-powered insights!</p>
                </div>
            )}
        </div>
    );
};

export default AICharts;