import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionCard from '../components/SectionCard';
import SavingsGoalModal from '../components/SavingsGoalModal';
import FinancialHealthCard from '../components/FinancialHealthCard';
import { savingsService, accountService } from '../services/api';
import * as aiEngine from '../services/aiService';
import { Plus, Settings, DollarSign, TrendingUp, Brain, Target, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

const Savings: React.FC = () => {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAutoModal, setShowAutoModal] = useState(false);
    const [autoGoalId, setAutoGoalId] = useState<number | null>(null);
    const [autoForm, setAutoForm] = useState({ deductionAmount: '', deductionPeriod: 'monthly' });
    const [balance, setBalance] = useState(0);
    const { t } = useLanguage();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const toast = useToast();

    const [aiPrediction, setAiPrediction] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(true);

    useEffect(() => {
        fetchGoals();
        fetchBalance();
        loadAIPrediction();
    }, []);

    const loadAIPrediction = async () => {
        try {
            const [prediction, modelStatus] = await Promise.all([
                aiEngine.predictSavings({ income: 300000, expenses: 150000, savings: Math.round(balance / 2), age: 30, employment_type: 'employed' }).catch(() => null),
                aiEngine.getModelStatus().catch(() => null),
            ]);
            const isOnline = modelStatus?.success && modelStatus?.status !== 'offline';
            if (prediction) {
                setAiPrediction({ ...prediction, ai_powered: isOnline });
            } else {
                setAiPrediction({
                    financial_health_score: 60, financial_health_rating: 'Fair',
                    savings_rate_pct: 20, projected_savings_6m: balance * 1.15,
                    projected_savings_12m: balance * 1.3, monthly_forecast: generateMockForecast(balance),
                    recommendations: ['Save at least 20% of monthly income.'], ai_powered: false,
                });
            }
        } catch {
            setAiPrediction(null);
        } finally {
            setAiLoading(false);
        }
    };

    const generateMockForecast = (bal: number) => {
        const data = [];
        for (let i = 0; i < 12; i++) {
            data.push({ month: `M${i + 1}`, projected: Math.round(bal * (1 + i * 0.03)), actual: i < 3 ? Math.round(bal * (1 + i * 0.025)) : null });
        }
        return data;
    };

    const fetchBalance = async () => {
        try {
            const response = await accountService.getBalance();
            setBalance(response.data.balance || response.data || 0);
        } catch (err) {
            console.error('Error fetching balance:', err);
        }
    };

    const fetchGoals = async () => {
        try {
            const response = await savingsService.getGoals();
            setGoals(response.data.goals || response.data || []);
        } catch (error) {
            console.error('Error fetching goals:', error);
            setGoals([]);
        } finally {
            setLoading(false);
        }
    };

    const progress = (goal: any) => Math.min(100, Math.round((toNum(goal.current_amount ?? goal.current) / toNum(goal.target_amount ?? goal.target)) * 100));

    const handleGoalCreated = () => { fetchGoals(); };

    const handleAutoDeductionSave = async () => {
        if (!autoGoalId || !autoForm.deductionAmount) return;
        try {
            await savingsService.updateGoal(autoGoalId, {
                autoDeductionAmount: parseFloat(autoForm.deductionAmount),
                autoDeductionPeriod: autoForm.deductionPeriod
            });
            toast.success('Auto-deduction saved successfully!');
            setShowAutoModal(false);
            setAutoGoalId(null);
            setAutoForm({ deductionAmount: '', deductionPeriod: 'monthly' });
            await fetchGoals();
        } catch (err) {
            console.error('Error setting auto-deduction:', err);
            toast.error('Failed to save auto-deduction');
        }
    };

    const mutedColor = isDark ? '#94a3b8' : '#64748b';
    const textColor = isDark ? '#e2e8f0' : '#1e293b';
    const toNum = (v: any) => typeof v === 'number' ? v : Number(v) || 0;
const totalSaved = goals.reduce((sum, g) => sum + toNum(g.current_amount ?? g.current), 0);
    const forecastData = aiPrediction?.monthly_forecast || generateMockForecast(balance);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ flex: 1, padding: 24, background: isDark ? '#0B1F3A' : '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div>
                        <h1 style={{ color: textColor }}>Savings Goals</h1>
                        <p style={{ color: mutedColor, marginTop: 8 }}>Build goals, watch progress, and secure funds for the future.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{
                            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                            background: aiPrediction?.ai_powered ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: aiPrediction?.ai_powered ? '#10b981' : '#f59e0b',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <Brain size={14} />
                            AI {aiPrediction?.ai_powered ? 'Powered' : 'Fallback'}
                        </div>
                        <button onClick={() => setShowModal(true)}
                            style={{ padding: '10px 20px', background: '#0A9396', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Plus size={18} /> Create Goal
                        </button>
                    </div>
                </div>

                {aiPrediction && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 24 }}>
                        <FinancialHealthCard
                            score={aiPrediction.financial_health_score || 60}
                            rating={aiPrediction.financial_health_rating || 'Fair'}
                            totalIncome={300000}
                            totalExpenses={150000}
                            savingsRate={aiPrediction.savings_rate_pct || 20}
                            recommendations={aiPrediction.recommendations || ['Enable AI for personalized insights.']}
                            loading={aiLoading}
                        />
                        <SectionCard title="AI Savings Forecast">
                            <div style={{ marginTop: 8 }}>
                                <div style={{ width: '100%', height: 160 }}>
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                        <AreaChart data={forecastData}>
                                            <defs>
                                                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0A9396" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#0A9396" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                                            <XAxis dataKey="month" stroke={mutedColor} fontSize={11} />
                                            <YAxis stroke={mutedColor} fontSize={11} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="projected" stroke="#0A9396" fill="url(#savingsGrad)" strokeWidth={2} />
                                            <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                                    <div style={{ padding: 12, borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                        <div style={{ fontSize: 11, color: mutedColor }}>Projected (6 Months)</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0A9396' }}>RWF {Math.round(aiPrediction.projected_savings_6m || (balance * 1.15)).toLocaleString()}</div>
                                    </div>
                                    <div style={{ padding: 12, borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                        <div style={{ fontSize: 11, color: mutedColor }}>Projected (12 Months)</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>RWF {Math.round(aiPrediction.projected_savings_12m || (balance * 1.3)).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 18, marginBottom: 24 }}>
                    <SectionCard title="Quick Stats">
                        <div style={{ marginTop: 18, display: 'grid', gap: 16 }}>
                            <div style={{ padding: 14, background: isDark ? '#1a3a3a' : '#e0f2fe', borderRadius: 12, borderLeft: '4px solid #0A9396' }}>
                                <div style={{ color: isDark ? '#67e8f9' : '#0A9396', fontSize: 12, fontWeight: 600 }}>Account Balance</div>
                                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: isDark ? '#a5f3fc' : '#0A9396' }}>RWF {balance.toLocaleString()}</div>
                            </div>
                            <div style={{ padding: 14, background: isDark ? '#18364f' : '#f0fdf4', borderRadius: 12, borderLeft: '4px solid #16a34a' }}>
                                <div style={{ color: isDark ? '#86efac' : '#16a34a', fontSize: 12, fontWeight: 600 }}>Total Saved</div>
                                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: isDark ? '#a7f3d0' : '#15803d' }}>RWF {Number(totalSaved).toLocaleString()}</div>
                            </div>
                            <div style={{ padding: 14, background: isDark ? '#452a0d' : '#fef3c7', borderRadius: 12, borderLeft: '4px solid #f59e0b' }}>
                                <div style={{ color: isDark ? '#fb923c' : '#d97706', fontSize: 12, fontWeight: 600 }}>Target Amount</div>
                                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: isDark ? '#fcd34d' : '#b45309' }}>RWF {goals.reduce((sum, g) => sum + toNum(g.target_amount ?? g.target), 0).toLocaleString()}</div>
                            </div>
                            <div style={{ padding: 14, background: isDark ? '#1e293b' : '#e0e7ff', borderRadius: 12, borderLeft: '4px solid #6366f1' }}>
                                <div style={{ color: isDark ? '#93c5fd' : '#4f46e5', fontSize: 12, fontWeight: 600 }}>Active Goals</div>
                                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: isDark ? '#c7d2fe' : '#4338ca' }}>{goals.length}</div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="AI Smart Budgeting" subtitle={aiPrediction?.ai_powered ? 'AI-powered recommendations' : 'Standard budgeting tips'}>
                        <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                            {[
                                { label: 'Save at least 20% of income', value: '60,000 RWF/mo', icon: Target, color: '#0A9396' },
                                { label: 'Emergency fund target', value: '3-6 months', icon: Shield, color: '#10b981' },
                                { label: 'Projected savings rate', value: `${aiPrediction?.savings_rate_pct || 20}%`, icon: TrendingUp, color: '#f59e0b' },
                            ].map((item, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <item.icon size={16} color={item.color} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: textColor }}>{item.label}</div>
                                        <div style={{ fontSize: 12, color: mutedColor }}>{item.value}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                {aiPrediction?.recommendations && aiPrediction.recommendations.length > 0 && (
                    <SectionCard title="AI Savings Recommendations" style={{ marginBottom: 24 }}>
                        <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
                            {aiPrediction.recommendations.map((rec: string, idx: number) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #0A9396, #4ECDC4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                                    <span style={{ fontSize: 13, color: mutedColor, flex: 1 }}>{rec}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}

                <h2 style={{ marginTop: 24, marginBottom: 18, fontSize: 18, fontWeight: 700, color: textColor }}>Your Savings Goals</h2>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: mutedColor }}>Loading goals...</div>
                ) : goals.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: mutedColor }}>{t('savings.noGoals')}</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
                        {goals.map((goal) => (
                            <SectionCard key={goal.id} title={goal.name} headerRight={<span style={{ fontWeight: 700, color: '#0A9396' }}>{progress(goal)}%</span>}>
                                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: textColor }}>
                                    RWF {toNum(goal.current_amount ?? goal.current).toLocaleString()} / {toNum(goal.target_amount ?? goal.target).toLocaleString()}
                                </div>
                                <div style={{ marginTop: 18, height: 10, background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: 999 }}>
                                    <div style={{ width: `${progress(goal)}%`, height: '100%', background: 'linear-gradient(90deg, #0A9396, #059669)', borderRadius: 999 }} />
                                </div>
                                <div style={{ marginTop: 14, color: mutedColor, fontSize: 12 }}>{t('savings.targetDue')}: {goal.target_date || goal.deadline || 'N/A'}</div>
                                {goal.last_deduction_date && (
                                    <div style={{ marginTop: 6, color: mutedColor, fontSize: 12 }}>{t('savings.lastDeduction')}: {goal.last_deduction_date}</div>
                                )}
                                {goal.auto_deduction_amount && (
                                    <div style={{ marginTop: 8, padding: '8px 12px', background: isDark ? 'rgba(10,147,150,0.15)' : 'rgba(10,147,150,0.08)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 12, color: '#0A9396' }}>{t('savings.autoDeduction')}: RWF {parseFloat(goal.auto_deduction_amount).toLocaleString()} / {goal.auto_deduction_period}</span>
                                    </div>
                                )}
                                <div style={{ marginTop: 12 }}>
                                    <button onClick={() => { setAutoGoalId(goal.id); setAutoForm({ deductionAmount: goal.auto_deduction_amount?.toString() || '', deductionPeriod: goal.auto_deduction_period || 'monthly' }); setShowAutoModal(true); }}
                                        style={{ padding: '8px 14px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer', color: textColor, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Settings size={14} /> {t('savings.autoDeduction')}
                                    </button>
                                </div>
                            </SectionCard>
                        ))}
                    </div>
                )}
            </div>

            <SavingsGoalModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={handleGoalCreated} />

            {showAutoModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
                    <div style={{ background: isDark ? '#1e293b' : 'white', borderRadius: 24, padding: 32, maxWidth: 450, width: '100%' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: textColor, marginBottom: 8 }}>{t('savings.autoDeduction')}</div>
                        <div style={{ color: mutedColor, fontSize: 14, marginBottom: 24 }}>{t('savings.autoDeductionInfo')}</div>
                        <div style={{ display: 'grid', gap: 16 }}>
                            <label style={{ display: 'grid', gap: 6, color: textColor }}>
                                {t('savings.autoDeductionAmount')}
                                <input type="text" inputMode="decimal" value={autoForm.deductionAmount} onChange={(e) => setAutoForm({ ...autoForm, deductionAmount: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: isDark ? 'rgba(0,0,0,0.2)' : 'white', color: textColor, boxSizing: 'border-box' }} />
                            </label>
                            <label style={{ display: 'grid', gap: 6, color: textColor }}>
                                {t('savings.autoDeductionPeriod')}
                                <select value={autoForm.deductionPeriod} onChange={(e) => setAutoForm({ ...autoForm, deductionPeriod: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: isDark ? 'rgba(0,0,0,0.2)' : 'white', color: textColor }}>
                                    <option value="daily">{t('loanApplication.deductionPeriodDaily')}</option>
                                    <option value="weekly">{t('loanApplication.deductionPeriodWeekly')}</option>
                                    <option value="monthly">{t('loanApplication.deductionPeriodMonthly')}</option>
                                </select>
                            </label>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                                <button onClick={() => setShowAutoModal(false)} style={{ padding: '12px 24px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', borderRadius: 12, cursor: 'pointer', color: textColor }}>Cancel</button>
                                <button onClick={handleAutoDeductionSave} style={{ padding: '12px 24px', background: '#0A9396', border: 'none', borderRadius: 12, cursor: 'pointer', color: 'white', fontWeight: 700 }}>
                                    <DollarSign size={16} style={{ marginRight: 6 }} /> Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Savings;
