import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, DollarSign, Pause, Play, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { scheduleService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const PaymentSchedules: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { theme } = useTheme();
    const darkMode = theme === 'dark';
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', amount: '', frequency: 'monthly', startDate: '', endDate: '', description: '' });
    const [error, setError] = useState('');
    const toast = useToast();

    useEffect(() => {
        loadSchedules();
    }, []);

    const loadSchedules = async () => {
        setLoading(true);
        try {
            const response = await scheduleService.getSchedules();
            setSchedules(response.data.data || response.data || []);
        } catch (err) {
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.amount || !formData.startDate) {
            setError('Name, amount, and start date are required');
            return;
        }
        try {
            await scheduleService.createSchedule({
                name: formData.name,
                amount: parseFloat(formData.amount),
                frequency: formData.frequency,
                startDate: formData.startDate,
                endDate: formData.endDate || undefined,
                description: formData.description || undefined
            });
            setShowModal(false);
            setFormData({ name: '', amount: '', frequency: 'monthly', startDate: '', endDate: '', description: '' });
            toast.success('Schedule created successfully!');
            loadSchedules();
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Failed to create schedule');
        }
    };

    const handlePauseResume = async (id: number, action: 'pause' | 'resume') => {
        try {
            await scheduleService.pauseSchedule(id, action);
            toast.success(`Schedule ${action}d successfully!`);
            loadSchedules();
        } catch (err) {
            console.error('Failed to update schedule:', err);
            toast.error('Failed to update schedule');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this schedule?')) return;
        try {
            await scheduleService.deleteSchedule(id);
            toast.success('Schedule deleted');
            loadSchedules();
        } catch (err) {
            console.error('Failed to delete schedule:', err);
            toast.error('Failed to delete schedule');
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'active': return '#10b981';
            case 'paused': return '#f59e0b';
            case 'completed': return '#6366f1';
            case 'cancelled': return '#ef4444';
            default: return '#64748b';
        }
    };

    const inputStyle = {
        width: '100%' as const,
        padding: 12,
        borderRadius: 12,
        border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
        background: darkMode ? 'rgba(0,0,0,0.2)' as const : 'white',
        color: darkMode ? '#f1f5f9' : '#1e293b',
        boxSizing: 'border-box' as const
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ flex: 1, padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', background: darkMode ? '#0f172a' : '#eef7fb' }}>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
                        <div>
                            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, margin: 0,
                                background: darkMode ? 'linear-gradient(135deg, #60a5fa, #34d399)' : 'linear-gradient(135deg, #0A9396, #059669)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {t('schedules.title')}
                            </h1>
                            <p style={{ color: darkMode ? '#94a3b8' : '#64748b', marginTop: 8 }}>{t('schedules.subtitle')}</p>
                        </div>
                        <LoadingButton onClick={() => setShowModal(true)} variant="primary" size="lg" style={{ background: 'linear-gradient(135deg, #0A9396, #059669)', border: 'none', boxShadow: '0 8px 25px rgba(10, 147, 150, 0.3)' }}>
                            <Plus size={20} /> {t('schedules.create')}
                        </LoadingButton>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 60, color: darkMode ? '#94a3b8' : '#64748b' }}>Loading schedules...</div>
                    ) : schedules.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60, color: darkMode ? '#94a3b8' : '#64748b' }}>
                            <Clock size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
                            <h3 style={{ color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 8 }}>{t('schedules.noSchedules')}</h3>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 16 }}>
                            {schedules.map((s) => (
                                <SectionCard key={s.id} style={{ background: darkMode ? 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(51,65,85,0.9))' : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 18, color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 4 }}>{s.name}</div>
                                            {s.description && <div style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: 14, marginBottom: 12 }}>{s.description}</div>}
                                            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                                <div><span style={{ fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b' }}>{t('schedules.amount')}</span><div style={{ fontSize: 18, fontWeight: 700, color: darkMode ? '#f1f5f9' : '#1e293b' }}>RWF {parseFloat(s.amount).toLocaleString()}</div></div>
                                                <div><span style={{ fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b' }}>{t('schedules.frequency')}</span><div style={{ fontSize: 16, fontWeight: 600, color: '#0A9396', textTransform: 'capitalize' }}>{s.frequency}</div></div>
                                                <div><span style={{ fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b' }}>{t('schedules.status')}</span><div style={{ fontSize: 16, fontWeight: 600, color: statusColor(s.status), textTransform: 'capitalize' }}>{s.status}</div></div>
                                                <div><span style={{ fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b' }}>{t('schedules.nextPayment')}</span><div style={{ fontSize: 16, fontWeight: 600, color: darkMode ? '#f1f5f9' : '#1e293b' }}>{s.next_payment_date || s.nextPaymentDate || 'N/A'}</div></div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {s.status === 'active' && (
                                                <button onClick={() => handlePauseResume(s.id, 'pause')} style={{ padding: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, cursor: 'pointer', color: '#f59e0b' }}>
                                                    <Pause size={16} /> {t('schedules.pause')}
                                                </button>
                                            )}
                                            {s.status === 'paused' && (
                                                <button onClick={() => handlePauseResume(s.id, 'resume')} style={{ padding: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, cursor: 'pointer', color: '#10b981' }}>
                                                    <Play size={16} /> {t('schedules.resume')}
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(s.id)} style={{ padding: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, cursor: 'pointer', color: '#ef4444' }}>
                                                <Trash2 size={16} /> {t('schedules.delete')}
                                            </button>
                                        </div>
                                    </div>
                                </SectionCard>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Create Modal */}
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 24, padding: 32, maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 24 }}>{t('schedules.create')}</div>
                            <form onSubmit={handleCreate} style={{ display: 'grid', gap: 16 }}>
                                <input placeholder={t('schedules.name')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required {...{style: inputStyle}} />
                                <input type="number" placeholder={t('schedules.amount')} value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required {...{style: inputStyle}} />
                                <select value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} {...{style: inputStyle}}>
                                    <option value="daily">{t('loanApplication.deductionPeriodDaily')}</option>
                                    <option value="weekly">{t('loanApplication.deductionPeriodWeekly')}</option>
                                    <option value="monthly">{t('loanApplication.deductionPeriodMonthly')}</option>
                                </select>
                                <input type="date" placeholder={t('schedules.startDate')} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required {...{style: inputStyle}} />
                                <input type="date" placeholder={t('schedules.endDate')} value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} {...{style: inputStyle}} />
                                <textarea placeholder={t('schedules.description')} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} {...{style: {...inputStyle, resize: 'vertical'}}} />
                                {error && <div style={{ padding: 12, borderRadius: 8, background: '#fee2e2', color: '#991b1b', fontSize: 14 }}>{error}</div>}
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', background: 'transparent', border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', borderRadius: 12, cursor: 'pointer', color: darkMode ? '#f1f5f9' : '#1e293b' }}>Cancel</button>
                                    <LoadingButton type="submit" variant="primary">{t('schedules.create')}</LoadingButton>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default PaymentSchedules;
