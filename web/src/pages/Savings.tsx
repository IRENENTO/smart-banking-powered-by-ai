import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SectionCard from '../components/SectionCard';
import SavingsGoalModal from '../components/SavingsGoalModal';
import { savingsService } from '../services/api';
import { Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Savings: React.FC = () => {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const response = await savingsService.getGoals();
            setGoals(response.data || []);
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
    const { theme } = useTheme();
    const isDark = theme === 'dark';

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
                    <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                        Loading goals...
                    </div>
                ) : goals.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                        No savings goals yet. Create your first goal to get started!
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
                        {goals.map((goal) => (
                            <SectionCard key={goal.id} title={goal.name} headerRight={<span style={{ fontWeight: 700, color: '#0A9396' }}>{progress(goal)}%</span>}>
                                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700 }}>RWF {(goal.current_amount ?? goal.current).toLocaleString()} / {(goal.target_amount ?? goal.target).toLocaleString()}</div>
                                <div style={{ marginTop: 18, height: 10, background: '#e2e8f0', borderRadius: 999 }}>
                                    <div style={{ width: `${progress(goal)}%`, height: '100%', background: '#0A9396', borderRadius: 999 }} />
                                </div>
                                <div style={{ marginTop: 14, color: '#64748b', fontSize: 12 }}>Target due: {goal.target_date || goal.dueDate || goal.deadline}</div>
                                {goal.locked && (
                                    <div style={{ marginTop: 12, padding: 8, background: '#f3e8ff', color: '#7c3aed', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                                        Locked
                                    </div>
                                )}
                            </SectionCard>
                        ))}
                    </div>
                )}
            </div>

            <SavingsGoalModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={handleGoalCreated} />
        </div>
    );
};

export default Savings;
