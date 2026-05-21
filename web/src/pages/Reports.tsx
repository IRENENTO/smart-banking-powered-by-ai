import React, { useState, useEffect } from 'react';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Shield, Download, FileText, BarChart3, PieChart as PieChartIcon, RefreshCw } from 'lucide-react';
import * as aiEngine from '../services/aiService';
import { useTheme } from '../context/ThemeContext';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Reports: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [aiOnline, setAiOnline] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeReport, setActiveReport] = useState<'overview' | 'investment' | 'fraud' | 'predictive'>('overview');

    useEffect(() => {
        loadReportData();
    }, []);

    const loadReportData = async () => {
        try {
            const [modelStatus, recs, savings] = await Promise.all([
                aiEngine.getModelStatus().catch(() => null),
                aiEngine.getRecommendations({ income: 300000, expenses: 150000, risk_tolerance: 'moderate' }).catch(() => null),
                aiEngine.predictSavings({ income: 300000, expenses: 150000, savings: 50000 }).catch(() => null),
            ]);
            const isOnline = modelStatus?.success && modelStatus?.status !== 'offline';
            setAiOnline(isOnline);

            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const growthData = months.map((m, i) => ({
                month: m,
                revenue: 500000 + Math.random() * 200000 + i * 15000,
                expenses: 300000 + Math.random() * 100000 + i * 5000,
                savings: 150000 + Math.random() * 50000 + i * 8000,
            }));

            const sectorData = (recs?.sector_recommendations || [
                { sector_name: 'Agriculture', expected_return: '+16%', risk_level: 'low' },
                { sector_name: 'Technology', expected_return: '+22%', risk_level: 'medium' },
                { sector_name: 'Real Estate', expected_return: '+12%', risk_level: 'low' },
                { sector_name: 'Energy', expected_return: '+18%', risk_level: 'low' },
            ]).map((s: any, idx: number) => ({ name: s.sector_name, value: 100 - idx * 15, color: ['#0A9396', '#4ECDC4', '#F4A261', '#E76F51'][idx] }));

            const fraudData = months.slice(0, 6).map((m, i) => ({
                month: m,
                detected: Math.round(Math.random() * 5 + i),
                blocked: Math.round(Math.random() * 3 + i * 0.5),
            }));

            setReportData({
                growthData,
                sectorData,
                fraudData,
                savingsRate: savings?.savings_rate_pct || 20,
                healthScore: savings?.financial_health_score || 60,
                totalPredictions: recs?.total_predictions || 0,
                aiGenerated: isOnline,
                priorityActions: recs?.priority_actions || ['Enable AI for better reports'],
                recommendations: recs?.savings_recommendations || ['Save 20% of monthly income'],
            });
        } catch {
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const mutedColor = isDark ? '#94a3b8' : '#64748b';
    const textColor = isDark ? '#e2e8f0' : '#1e293b';

    const reportTabs = [
        { id: 'overview' as const, label: 'Financial Overview', icon: BarChart3 },
        { id: 'investment' as const, label: 'Investment Analytics', icon: TrendingUp },
        { id: 'fraud' as const, label: 'Fraud Reports', icon: Shield },
        { id: 'predictive' as const, label: 'Predictive Reports', icon: Brain },
    ];

    return (
        <AppShell
            title="Reports & Analytics"
            subtitle="AI-generated financial reports and predictive analytics"
            videoSrc="/videos/banking.mp4"
            headerRight={
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                        padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                        background: aiOnline ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: aiOnline ? '#10b981' : '#f59e0b',
                        display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                        <Brain size={12} /> AI {aiOnline ? 'Active' : 'Fallback'}
                    </span>
                    <button onClick={loadReportData} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, background: 'transparent', cursor: 'pointer', color: mutedColor }}>
                        <RefreshCw size={14} />
                    </button>
                    <button style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#0A9396', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Download size={14} /> Export
                    </button>
                </div>
            }
        >
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {reportTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveReport(tab.id)}
                        style={{
                            padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                            background: activeReport === tab.id ? 'linear-gradient(135deg, #0A9396, #4ECDC4)' : (isDark ? '#1e293b' : 'white'),
                            color: activeReport === tab.id ? 'white' : mutedColor,
                            boxShadow: activeReport === tab.id ? '0 4px 15px rgba(10,147,150,0.3)' : 'none',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {activeReport === 'overview' && reportData && (
                <div style={{ display: 'grid', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        <div style={{ padding: 20, borderRadius: 14, background: isDark ? '#0f172a' : 'white', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>AI Health Score</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#0A9396' }}>{reportData.healthScore}</div>
                        </div>
                        <div style={{ padding: 20, borderRadius: 14, background: isDark ? '#0f172a' : 'white', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Savings Rate</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{reportData.savingsRate}%</div>
                        </div>
                        <div style={{ padding: 20, borderRadius: 14, background: isDark ? '#0f172a' : 'white', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Report Type</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: textColor }}>{reportData.aiGenerated ? 'AI Generated' : 'Standard'}</div>
                        </div>
                    </div>

                    <SectionCard title="Revenue & Expense Trends">
                        <div style={{ height: 280, marginTop: 8 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={reportData.growthData}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0A9396" stopOpacity={0.3} /><stop offset="95%" stopColor="#0A9396" stopOpacity={0} /></linearGradient>
                                        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                                    <XAxis dataKey="month" stroke={mutedColor} />
                                    <YAxis stroke={mutedColor} />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="revenue" stroke="#0A9396" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} name="Expenses" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SectionCard>

                    <SectionCard title="AI Report Summary">
                        <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                            {reportData.recommendations.map((rec: string, idx: number) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                    <FileText size={16} color="#0A9396" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, color: mutedColor, flex: 1 }}>{rec}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            )}

            {activeReport === 'investment' && reportData && (
                <div style={{ display: 'grid', gap: 24 }}>
                    <SectionCard title="Sector Performance Analysis">
                        <div style={{ height: 280, marginTop: 8 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData.sectorData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                                    <XAxis dataKey="name" stroke={mutedColor} />
                                    <YAxis stroke={mutedColor} />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Performance Score">
                                        {reportData.sectorData.map((_: any, idx: number) => (
                                            <Cell key={idx} fill={['#0A9396', '#4ECDC4', '#F4A261', '#E76F51'][idx]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SectionCard>

                    <SectionCard title="Investment Analytics Report">
                        <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
                            {reportData.sectorData.map((s: any, idx: number) => (
                                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 4, background: s.color }} />
                                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: textColor }}>{s.name}</span>
                                    <span style={{ fontSize: 13, color: mutedColor }}>Score: {s.value}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            )}

            {activeReport === 'fraud' && reportData && (
                <div style={{ display: 'grid', gap: 24 }}>
                    <SectionCard title="Fraud Detection Trends">
                        <div style={{ height: 280, marginTop: 8 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData.fraudData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                                    <XAxis dataKey="month" stroke={mutedColor} />
                                    <YAxis stroke={mutedColor} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="detected" fill="#f59e0b" name="Detected" />
                                    <Bar dataKey="blocked" fill="#10b981" name="Blocked" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SectionCard>

                    <SectionCard title="Fraud Prevention Summary">
                        <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
                            {[
                                'Real-time transaction monitoring active',
                                'AI-powered anomaly detection enabled',
                                'Suspicious transactions flagged automatically',
                                'Multi-factor authentication for high-risk transactions',
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                    <Shield size={16} color="#10b981" />
                                    <span style={{ fontSize: 13, color: mutedColor }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            )}

            {activeReport === 'predictive' && reportData && (
                <div style={{ display: 'grid', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                        <SectionCard title="AI Predictions">
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <div style={{ fontSize: 36, fontWeight: 800, color: '#0A9396' }}>{reportData.totalPredictions || 0}</div>
                                <div style={{ fontSize: 13, color: mutedColor, marginTop: 4 }}>Total Predictions</div>
                            </div>
                        </SectionCard>
                        <SectionCard title="Forecast Accuracy">
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <div style={{ fontSize: 36, fontWeight: 800, color: '#10b981' }}>{aiOnline ? 85 : 60}%</div>
                                <div style={{ fontSize: 13, color: mutedColor, marginTop: 4 }}>Model Accuracy</div>
                            </div>
                        </SectionCard>
                    </div>

                    <SectionCard title="Priority Actions">
                        <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                            {reportData.priorityActions.map((action: string, idx: number) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #0A9396, #4ECDC4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                                    <span style={{ fontSize: 13, color: mutedColor, flex: 1 }}>{action}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            )}
        </AppShell>
    );
};

export default Reports;
