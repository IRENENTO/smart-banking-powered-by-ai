import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SectionCard from '../components/SectionCard';
import SavingsGoalModal from '../components/SavingsGoalModal';
import { savingsService, accountService } from '../services/api';
import { Plus, Settings, DollarSign } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

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

    useEffect(() => {
        fetchGoals();
        fetchBalance();
    }, []);

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

    const progress = (goal: any) => Math.min(100, Math.round(((goal.current_amount ?? goal.current) / (goal.target_amount ?? goal.target)) * 100));

    const handleGoalCreated = () => {
        fetchGoals();
    };

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

    return (
        <div>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ padding: 24, minHeight: 'calc(100vh - 48px)', background: isDark ? '#071B2F' : '#eef7fb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div>
                        <h1>Savings Goals</h1>
                        <p style={{ color: isDark ? '#cbd5e1' : '#475569', marginTop: 8 }}>Build goals, watch progress, and secure funds for the future.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            padding: '10px 20px',
                            background: '#0A9396',
                            color: 'white',
                            border: 'none',
                            borderRadius: 10,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}
                    >
                        <Plus size={18} /> Create Goal
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 18, marginBottom: 24 }}>
                    <SectionCard title="Quick Stats">
                        <div style={{ marginTop: 18, display: 'grid', gap: 16 }}>
                            <div style={{ padding: 14, background: isDark ? '#1a3a3a' : '#e0f2fe', borderRadius: 12, borderLeft: '4px solid #0A9396' }}>
                                <div style={{ color: isDark ? '#67e8f9' : '#0A9396', fontSize: 12, fontWeight: 600 }}>Account Balance</div>
                                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: isDark ? '#a5f3fc' : '#0A9396' }}>RWF {balance.toLocaleString()}</div>
                            </div>
                            <div style={{ padding: 14, background: isDark ? '#18364f' : '#f0fdf4', borderRadius: 12, borderLeft: '4px solid #16a34a' }}>
                                <div style={{ color: isDark ? '#86efac' : '#16a34a', fontSize: 12, fontWeight: 600 }}>Total Saved</div>
                                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: isDark ? '#a7f3d0' : '#15803d' }}>RWF {goals.reduce((sum, g) => sum + (g.current_amount ?? g.current ?? 0), 0).toLocaleString()}</div>
                            </div>
                            <div style={{ padding: 14, background: isDark ? '#452a0d' : '#fef3c7', borderRadius: 12, borderLeft: '4px solid #f59e0b' }}>
                                <div style={{ color: isDark ? '#fb923c' : '#d97706', fontSize: 12, fontWeight: 600 }}>Target Amount</div>
                                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: isDark ? '#fcd34d' : '#b45309' }}>RWF {goals.reduce((sum, g) => sum + (g.target_amount ?? g.target ?? 0), 0).toLocaleString()}</div>
                            </div>
                            <div style={{ padding: 14, background: isDark ? '#1e293b' : '#e0e7ff', borderRadius: 12, borderLeft: '4px solid #6366f1' }}>
                                <div style={{ color: isDark ? '#93c5fd' : '#4f46e5', fontSize: 12, fontWeight: 600 }}>Active Goals</div>
                                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: isDark ? '#c7d2fe' : '#4338ca' }}>{goals.length}</div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Locked Savings">
                        <div style={{ marginTop: 16, color: '#475569' }}>Keep money safe with locked savings that support your long-term objectives.</div>
                        <div style={{ marginTop: 24, padding: 18, background: '#f8fafc', borderRadius: 16 }}>
                            <div style={{ fontWeight: 700 }}>Savings Lock</div>
                            <div style={{ marginTop: 8 }}>Create a goal to lock savings.</div>
                        </div>
                    </SectionCard>
                </div>

                <h2 style={{ marginTop: 24, marginBottom: 18, fontSize: 18, fontWeight: 700 }}>Your Savings Goals</h2>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#94a3b8' : '#64748b' }}>
                        Loading goals...
                    </div>
                ) : goals.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#94a3b8' : '#64748b' }}>
                        {t('savings.noGoals')}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
                        {goals.map((goal) => (
                            <SectionCard key={goal.id} title={goal.name} headerRight={<span style={{ fontWeight: 700, color: '#0A9396' }}>{progress(goal)}%</span>}>
                                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                                    RWF {(goal.current_amount ?? goal.current).toLocaleString()} / {(goal.target_amount ?? goal.target).toLocaleString()}
                                </div>
                                <div style={{ marginTop: 18, height: 10, background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: 999 }}>
                                    <div style={{ width: `${progress(goal)}%`, height: '100%', background: 'linear-gradient(90deg, #0A9396, #059669)', borderRadius: 999 }} />
                                </div>
                                <div style={{ marginTop: 14, color: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}>
                                    {t('savings.targetDue')}: {goal.target_date || goal.deadline || 'N/A'}
                                </div>
                                {goal.last_deduction_date && (
                                    <div style={{ marginTop: 6, color: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}>
                                        {t('savings.lastDeduction')}: {goal.last_deduction_date}
                                    </div>
                                )}
                                {goal.auto_deduction_amount && (
                                    <div style={{ marginTop: 8, padding: '8px 12px', background: isDark ? 'rgba(10,147,150,0.15)' : 'rgba(10,147,150,0.08)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 12, color: '#0A9396' }}>{t('savings.autoDeduction')}: RWF {parseFloat(goal.auto_deduction_amount).toLocaleString()} / {goal.auto_deduction_period}</span>
                                    </div>
                                )}
                                <div style={{ marginTop: 12 }}>
                                    <button
                                        onClick={() => { setAutoGoalId(goal.id); setAutoForm({ deductionAmount: goal.auto_deduction_amount?.toString() || '', deductionPeriod: goal.auto_deduction_period || 'monthly' }); setShowAutoModal(true); }}
                                        style={{ padding: '8px 14px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                                    >
                                        <Settings size={14} /> {t('savings.autoDeduction')}
                                    </button>
                                </div>
                            </SectionCard>
                        ))}
                    </div>
                )}
            </div>

            <SavingsGoalModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={handleGoalCreated} />

            {/* Auto-deduction Modal */}
            {showAutoModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
                    <div style={{ background: isDark ? '#1e293b' : 'white', borderRadius: 24, padding: 32, maxWidth: 450, width: '100%' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: isDark ? '#f1f5f9' : '#1e293b', marginBottom: 8 }}>{t('savings.autoDeduction')}</div>
                        <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 14, marginBottom: 24 }}>{t('savings.autoDeductionInfo')}</div>
                        <div style={{ display: 'grid', gap: 16 }}>
                            <label style={{ display: 'grid', gap: 6, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                                {t('savings.autoDeductionAmount')}
                                <input type="number" value={autoForm.deductionAmount} onChange={(e) => setAutoForm({ ...autoForm, deductionAmount: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: isDark ? 'rgba(0,0,0,0.2)' : 'white', color: isDark ? '#f1f5f9' : '#1e293b', boxSizing: 'border-box' }} />
                            </label>
                            <label style={{ display: 'grid', gap: 6, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                                {t('savings.autoDeductionPeriod')}
                                <select value={autoForm.deductionPeriod} onChange={(e) => setAutoForm({ ...autoForm, deductionPeriod: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: isDark ? 'rgba(0,0,0,0.2)' : 'white', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                                    <option value="daily">{t('loanApplication.deductionPeriodDaily')}</option>
                                    <option value="weekly">{t('loanApplication.deductionPeriodWeekly')}</option>
                                    <option value="monthly">{t('loanApplication.deductionPeriodMonthly')}</option>
                                </select>
                            </label>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                                <button onClick={() => setShowAutoModal(false)} style={{ padding: '12px 24px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', borderRadius: 12, cursor: 'pointer', color: isDark ? '#f1f5f9' : '#1e293b' }}>Cancel</button>
                                <button onClick={handleAutoDeductionSave} style={{ padding: '12px 24px', background: '#0A9396', border: 'none', borderRadius: 12, cursor: 'pointer', color: 'white', fontWeight: 700 }}>
                                    <DollarSign size={16} style={{ marginRight: 6 }} /> Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Savings;
