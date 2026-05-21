import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, TrendingUp, PiggyBank, BookOpen, AlertTriangle } from 'lucide-react';
import SectionCard from './SectionCard';
import { useTheme } from '../context/ThemeContext';
import * as aiEngine from '../services/aiService';

const AIRecommendationPanel: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await aiEngine.getRecommendations({
                    income: 300000,
                    expenses: 150000,
                    risk_tolerance: 'moderate',
                    goals: ['savings', 'investment'],
                });
                setData(result);
            } catch (err) {
                console.error('Failed to fetch recommendations:', err);
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const mutedColor = isDark ? '#94a3b8' : '#64748b';
    const textColor = isDark ? '#e2e8f0' : '#1e293b';

    if (loading) {
        return (
            <SectionCard title="AI Recommendations">
                <div className="shimmer" style={{ height: 200, borderRadius: 12, background: isDark ? '#1e293b' : '#e2e8f0' }} />
            </SectionCard>
        );
    }

    const aiPowered = data?.ai_powered;

    return (
        <SectionCard title="AI Recommendations" headerRight={
            <span style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: aiPowered ? 'linear-gradient(135deg, #0A9396, #4ECDC4)' : isDark ? '#334155' : '#e2e8f0',
                color: aiPowered ? 'white' : mutedColor,
            }}>
                {aiPowered ? 'AI POWERED' : 'Standard'}
            </span>
        }>
            <div style={{ display: 'grid', gap: 16 }}>
                {/* Savings Recommendations */}
                {data?.savings_recommendations && data.savings_recommendations.length > 0 && (
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <PiggyBank size={16} color="#10b981" /> Savings Advice
                        </div>
                        <div style={{ display: 'grid', gap: 8 }}>
                            {data.savings_recommendations.map((rec: string, idx: number) => (
                                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>{idx + 1}</span>
                                    </div>
                                    <span style={{ fontSize: 13, color: mutedColor }}>{rec}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Investment Recommendations */}
                {data?.investment_recommendations && data.investment_recommendations.length > 0 && (
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TrendingUp size={16} color="#3b82f6" /> Investment Suggestions
                        </div>
                        <div style={{ display: 'grid', gap: 8 }}>
                            {data.investment_recommendations.map((rec: string, idx: number) => (
                                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>{idx + 1}</span>
                                    </div>
                                    <span style={{ fontSize: 13, color: mutedColor }}>{rec}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Budgeting Advice */}
                {data?.budgeting_advice && data.budgeting_advice.length > 0 && (
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BookOpen size={16} color="#f59e0b" /> Budgeting Advice
                        </div>
                        <div style={{ display: 'grid', gap: 8 }}>
                            {data.budgeting_advice.map((advice: string, idx: number) => (
                                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                                    style={{ padding: '10px 14px', borderRadius: 10, background: isDark ? 'rgba(245,158,11,0.08)' : '#fffbeb', border: '1px solid rgba(245,158,11,0.15)', fontSize: 13, color: mutedColor }}>
                                    {advice}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Priority Actions */}
                {data?.priority_actions && data.priority_actions.length > 0 && (
                    <div style={{ marginTop: 8, padding: 16, borderRadius: 14, background: isDark ? 'rgba(10,147,150,0.08)' : '#ecfeff', border: '1px solid rgba(10,147,150,0.2)' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#7dd3fc' : '#0A9396', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Target size={16} /> Priority Actions
                        </div>
                        <div style={{ display: 'grid', gap: 8 }}>
                            {data.priority_actions.map((action: string, idx: number) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: mutedColor }}>
                                    <span style={{ color: '#0A9396', fontWeight: 700, flexShrink: 0 }}>{idx + 1}.</span>
                                    {action}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!data && (
                    <div style={{ textAlign: 'center', padding: 20, color: mutedColor }}>
                        <AlertTriangle size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <div>AI Engine unavailable. Enable the AI Engine for personalized recommendations.</div>
                    </div>
                )}
            </div>
        </SectionCard>
    );
};

export default AIRecommendationPanel;
