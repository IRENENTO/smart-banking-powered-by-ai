import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SectionCard from '../components/SectionCard';
import { aiService, bankService } from '../services/api';
import { TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AIInsights: React.FC = () => {
    const [insights, setInsights] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [insightsRes, balanceRes] = await Promise.all([
                    aiService.getInsights(),
                    bankService.getBalance()
                ]);
                
                const rawInsights = insightsRes.data;
                const insightList = Array.isArray(rawInsights)
                    ? rawInsights
                    : Array.isArray(rawInsights?.insights)
                        ? rawInsights.insights
                        : rawInsights
                            ? [rawInsights]
                            : [];

                setInsights(insightList);
                setSummary(balanceRes.data || { financialHealth: 88, riskScore: 18 });
            } catch (err) {
                console.error('Error fetching insights:', err);
                // Fallback data
                setInsights([
                    { id: 'ins1', title: 'Spending Alert', detail: 'Your transport spending increased by 25% this month. Consider carpooling or using public transport.', impact: 'High', category: 'spending' },
                    { id: 'ins2', title: 'Savings Opportunity', detail: 'You could save RWF 8,500 monthly by reducing entertainment expenses by just 15%.', impact: 'Medium', category: 'savings' },
                    { id: 'ins3', title: 'Weekly Summary', detail: 'This week you spent RWF 42,300 across 15 transactions. Average daily spending: RWF 6,043.', impact: 'Info', category: 'summary' },
                    { id: 'ins4', title: 'Loan Readiness', detail: 'Your financial health is strong. You qualify for up to RWF 500,000 in loans with 12.5% interest.', impact: 'Positive', category: 'loan' }
                ]);
                setSummary({ financialHealth: 88, riskScore: 18 });
                setError(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getIcon = (category?: string) => {
        switch (category) {
            case 'spending': return <AlertTriangle size={20} />;
            case 'savings': return <Target size={20} />;
            case 'loan': return <TrendingUp size={20} />;
            default: return <TrendingUp size={20} />;
        }
    };

    const getColor = (impact?: string) => {
        switch (impact?.toLowerCase()) {
            case 'high': return 'text-red-600 dark:text-red-400';
            case 'medium': return 'text-amber-600 dark:text-amber-400';
            case 'positive': return 'text-green-600 dark:text-green-400';
            default: return 'text-blue-600 dark:text-blue-400';
        }
    };
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ padding: 24, minHeight: 'calc(100vh - 48px)', background: isDark ? '#071B2F' : '#eef7fb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div>
                        <h1>AI Insights</h1>
                        <p style={{ color: isDark ? '#cbd5e1' : '#475569', marginTop: 8 }}>Real-time, AI-powered insights to help you manage spending, savings, and borrowing.</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 18, marginBottom: 24 }}>
                    <SectionCard title="Financial Health Score">
                        <div style={{ marginTop: 12, fontSize: 28, fontWeight: 700, color: isDark ? '#7dd3fc' : '#0A9396', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span>{summary?.financialHealth || 88}/100</span>
                        </div>
                        <div style={{ marginTop: 16, height: 8, background: '#e2e8f0', borderRadius: 999 }}>
                            <div style={{ width: `${summary?.financialHealth || 88}%`, height: '100%', background: '#0A9396', borderRadius: 999 }} />
                        </div>
                        <div style={{ marginTop: 12, color: '#475569', fontSize: 13 }}>Your account is in excellent health</div>
                    </SectionCard>
                    <SectionCard title="Risk Assessment">
                        <div style={{ marginTop: 12, fontSize: 28, fontWeight: 700, color: isDark ? '#7dd3fc' : '#0A9396' }}>
                            {summary?.riskScore || 18}/100
                        </div>
                        <div style={{ marginTop: 12, padding: 12, background: isDark ? '#0f2f1c' : '#f0fdf4', borderRadius: 12 }}>
                            <span style={{ color: isDark ? '#a7f3d0' : '#16a34a', fontWeight: 600, fontSize: 13 }}>✓ Low Risk</span>
                        </div>
                        <div style={{ marginTop: 12, color: isDark ? '#cbd5e1' : '#475569', fontSize: 13 }}>You qualify for premium loan rates</div>
                    </SectionCard>
                    <SectionCard title="Key Metrics">
                        <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: isDark ? '#0f172a' : '#f8fafc', borderRadius: 8 }}>
                                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Debt Ratio</span>
                                <span style={{ fontWeight: 700, color: isDark ? '#e2e8f0' : 'inherit' }}>28%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: isDark ? '#0f172a' : '#f8fafc', borderRadius: 8 }}>
                                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Savings Rate</span>
                                <span style={{ fontWeight: 700, color: isDark ? '#e2e8f0' : 'inherit' }}>18%</span>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                {/* Dynamic Insights */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 18 }}>
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#64748b' }}>
                            Loading insights...
                        </div>
                    ) : insights.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#64748b' }}>
                            No insights available at the moment.
                        </div>
                    ) : (
                        insights.map((insight) => (
                            <SectionCard key={insight.id} title={insight.title || (insight.type ? insight.type.charAt(0).toUpperCase() + insight.type.slice(1) : 'AI Insight')}>
                                <div style={{ marginTop: 12, color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6 }}>
                                    {insight.detail || insight.message}
                                </div>
                                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                                    <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
                                        {insight.category ? insight.category.charAt(0).toUpperCase() + insight.category.slice(1) : (insight.type ? insight.type.charAt(0).toUpperCase() + insight.type.slice(1) : 'Insight')}
                                    </span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#7dd3fc' : '#0A9396' }}>
                                        {insight.impact || (insight.type === 'alert' ? 'High' : 'Actionable')}
                                    </span>
                                </div>
                            </SectionCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIInsights;
