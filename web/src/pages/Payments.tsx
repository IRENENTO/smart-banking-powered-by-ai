import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import PinModal from '../components/PinModal';
import { useBanking } from '../context/BankingContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { scheduleService } from '../services/api';
import { Plus, Pause, Play, Trash2, Clock } from 'lucide-react';

type Tab = 'send' | 'deposit' | 'schedules';

const Payments: React.FC = () => {
    const { balance, realBalance, demoBalance, deposit, sendPayment, loading } = useBanking();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const toast = useToast();
    const { addNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState<Tab>('send');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Send state
    const [payType, setPayType] = useState<'phone' | 'account'>('account');
    const [sendData, setSendData] = useState({ recipient: '', phone: '', account: '', amount: '', note: '' });

    // Deposit state
    const [depositAmount, setDepositAmount] = useState('');
    const [depositPhoneNumber, setDepositPhoneNumber] = useState('');
    const [depositProvider, setDepositProvider] = useState<'mtn' | 'airtel'>('mtn');

    // Schedules state
    const [schedules, setSchedules] = useState<any[]>([]);
    const [schedLoading, setSchedLoading] = useState(false);
    const [showSchedModal, setShowSchedModal] = useState(false);
    const [schedPayType, setSchedPayType] = useState<'phone' | 'account'>('account');
    const [schedForm, setSchedForm] = useState({ name: '', amount: '', frequency: 'monthly', startDate: '', endDate: '', description: '', recipient: '' });
    const [pinAction, setPinAction] = useState<{ cb: () => void } | null>(null);

    useEffect(() => {
        if (activeTab === 'schedules') loadSchedules();
    }, [activeTab]);

    const loadSchedules = async () => {
        setSchedLoading(true);
        try {
            const r = await scheduleService.getSchedules();
            setSchedules(r.data.data || r.data || []);
        } catch { setSchedules([]); }
        finally { setSchedLoading(false); }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); setError('');
        const amountValue = parseFloat(sendData.amount);
        if (!Number.isFinite(amountValue) || amountValue <= 0) { setError('Enter a valid amount'); return; }
        if (!sendData.recipient) { setError('Enter recipient name'); return; }
        const recipientId = payType === 'phone' ? sendData.phone : sendData.account;
        if (!recipientId) { setError(payType === 'phone' ? 'Enter phone number' : 'Enter account number'); return; }
        setPinAction({
            cb: async () => {
                try {
                    await sendPayment(amountValue, recipientId, sendData.recipient, sendData.note);
                    setMessage(`Sent RWF ${amountValue.toLocaleString()} to ${sendData.recipient}`);
                    setSendData({ recipient: '', phone: '', account: '', amount: '', note: '' });
                    addNotification({
                        title: 'Payment Sent',
                        message: `RWF ${amountValue.toLocaleString()} sent to ${sendData.recipient} successfully.`,
                        type: 'success',
                        link: '/transactions',
                    });
                } catch (err: any) { setError(err.response?.data?.msg || 'Payment failed'); }
            }
        });
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); setError('');
        const amountValue = parseFloat(depositAmount);
        if (!Number.isFinite(amountValue) || amountValue <= 0) { setError('Enter a valid amount'); return; }
        try {
            await deposit(amountValue, `Deposit via ${depositProvider.toUpperCase()}`, depositPhoneNumber || undefined);
            setMessage(depositPhoneNumber ? `Deposit initiated via ${depositProvider.toUpperCase()} on ${depositPhoneNumber}.` : `Deposited RWF ${amountValue.toLocaleString()}`);
            setDepositAmount(''); setDepositPhoneNumber('');
            addNotification({
                title: 'Deposit Successful',
                message: depositPhoneNumber
                    ? `RWF ${amountValue.toLocaleString()} deposited via ${depositProvider.toUpperCase()} on ${depositPhoneNumber}.`
                    : `RWF ${amountValue.toLocaleString()} deposited to your account.`,
                type: 'success',
                link: '/transactions',
            });
        } catch (err: any) { setError(err.response?.data?.msg || 'Deposit failed'); }
    };

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await scheduleService.createSchedule({
                name: schedForm.name, amount: parseFloat(schedForm.amount),
                frequency: schedForm.frequency, startDate: schedForm.startDate,
                endDate: schedForm.endDate || undefined, description: schedForm.description || undefined,
                recipient_type: schedPayType, recipient_value: schedForm.recipient
            });
            setShowSchedModal(false);
            setSchedForm({ name: '', amount: '', frequency: 'monthly', startDate: '', endDate: '', description: '', recipient: '' });
            setSchedPayType('account');
            toast.success('Schedule created!');
            loadSchedules();
        } catch (err: any) { toast.error(err.response?.data?.msg || 'Failed to create schedule'); }
    };

    const handlePauseResume = async (id: number, action: 'pause' | 'resume') => {
        try { await scheduleService.pauseSchedule(id, action); toast.success(`Schedule ${action}d`); loadSchedules(); }
        catch { toast.error('Failed to update schedule'); }
    };

    const handleDeleteSchedule = async (id: number) => {
        if (!window.confirm('Delete this schedule?')) return;
        try { await scheduleService.deleteSchedule(id); toast.success('Schedule deleted'); loadSchedules(); }
        catch { toast.error('Failed to delete schedule'); }
    };

    const displayBalance = balance ?? 0;
    const inputStyle = { padding: 12, borderRadius: 14, border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0F172A' : 'white', color: isDark ? '#E2E8F0' : 'inherit', boxSizing: 'border-box' as const, width: '100%' as const };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ flex: 1, padding: 24, background: isDark ? '#0B1F3A' : '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div>
                        <h1>Payments</h1>
                        <p style={{ color: isDark ? '#cbd5e1' : '#475569', marginTop: 8 }}>Send money, deposit funds, transfer, and manage payment schedules.</p>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#0A9396' }}>
                        Balance: RWF {loading ? '...' : displayBalance.toLocaleString()}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    {(['send', 'deposit', 'schedules'] as const).map(tab => (
                        <button key={tab} onClick={() => { setActiveTab(tab); setMessage(''); setError(''); }}
                            style={{ borderRadius: 999, border: activeTab === tab ? '1px solid #0A9396' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                background: activeTab === tab ? '#0A9396' : (isDark ? '#0f172a' : 'white'),
                                color: activeTab === tab ? 'white' : (isDark ? '#e2e8f0' : '#0f172a'),
                                padding: '10px 20px', cursor: 'pointer', fontWeight: 700, textTransform: 'capitalize' }}>
                            {tab === 'schedules' ? 'Schedules' : tab}
                        </button>
                    ))}
                </div>

                {/* Deposit */}
                {activeTab === 'deposit' && (
                    <SectionCard title="Deposit Money">
                        <form onSubmit={handleDeposit} style={{ marginTop: 18, display: 'grid', gap: 16 }}>
                            <input value={depositAmount} placeholder="Amount (RWF)" type="text" inputMode="decimal" onChange={(e) => setDepositAmount(e.target.value)} {...{style: inputStyle}} required />
                            
                            {/* Provider Selector */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" onClick={() => setDepositProvider('mtn')}
                                    style={{ flex: 1, padding: 10, borderRadius: 10, border: depositProvider === 'mtn' ? '2px solid #0A9396' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                        background: depositProvider === 'mtn' ? (isDark ? 'rgba(10,147,150,0.15)' : 'rgba(10,147,150,0.08)') : 'transparent',
                                        color: isDark ? '#E2E8F0' : '#0f172a', cursor: 'pointer', fontWeight: depositProvider === 'mtn' ? 700 : 400 }}>
                                    MTN MoMo
                                </button>
                                <button type="button" onClick={() => setDepositProvider('airtel')}
                                    style={{ flex: 1, padding: 10, borderRadius: 10, border: depositProvider === 'airtel' ? '2px solid #0A9396' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                        background: depositProvider === 'airtel' ? (isDark ? 'rgba(10,147,150,0.15)' : 'rgba(10,147,150,0.08)') : 'transparent',
                                        color: isDark ? '#E2E8F0' : '#0f172a', cursor: 'pointer', fontWeight: depositProvider === 'airtel' ? 700 : 400 }}>
                                    Airtel Money
                                </button>
                            </div>

                            <input value={depositPhoneNumber} placeholder={`Phone number (${depositProvider === 'mtn' ? 'MTN' : 'Airtel'})`} type="tel" onChange={(e) => setDepositPhoneNumber(e.target.value)} {...{style: inputStyle}} required />
                            <button type="submit" style={{ padding: '12px 20px', background: '#059669', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700 }}>Deposit</button>
                        </form>
                    </SectionCard>
                )}

                {/* Send */}
                {activeTab === 'send' && (
                    <SectionCard title="Send Money">
                        <form onSubmit={handleSend} style={{ marginTop: 18, display: 'grid', gap: 16 }}>
                            <input value={sendData.recipient} placeholder="Recipient name" onChange={(e) => setSendData({ ...sendData, recipient: e.target.value })} {...{style: inputStyle}} required />

                            {/* Payment Type Selector */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" onClick={() => setPayType('phone')}
                                    style={{ flex: 1, padding: 10, borderRadius: 10, border: payType === 'phone' ? '2px solid #0A9396' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                        background: payType === 'phone' ? (isDark ? 'rgba(10,147,150,0.15)' : 'rgba(10,147,150,0.08)') : 'transparent',
                                        color: isDark ? '#E2E8F0' : '#0f172a', cursor: 'pointer', fontWeight: payType === 'phone' ? 700 : 400 }}>
                                    Phone Number
                                </button>
                                <button type="button" onClick={() => setPayType('account')}
                                    style={{ flex: 1, padding: 10, borderRadius: 10, border: payType === 'account' ? '2px solid #0A9396' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                        background: payType === 'account' ? (isDark ? 'rgba(10,147,150,0.15)' : 'rgba(10,147,150,0.08)') : 'transparent',
                                        color: isDark ? '#E2E8F0' : '#0f172a', cursor: 'pointer', fontWeight: payType === 'account' ? 700 : 400 }}>
                                    Account ID
                                </button>
                            </div>

                            {payType === 'phone' ? (
                                <input value={sendData.phone} placeholder="Phone number (e.g., 078xxxxxxx)" type="tel" onChange={(e) => setSendData({ ...sendData, phone: e.target.value })} {...{style: inputStyle}} required />
                            ) : (
                                <input value={sendData.account} placeholder="Account number" onChange={(e) => setSendData({ ...sendData, account: e.target.value })} {...{style: inputStyle}} required />
                            )}
                            <input value={sendData.amount} placeholder="Amount (RWF)" type="text" inputMode="decimal" onChange={(e) => setSendData({ ...sendData, amount: e.target.value })} {...{style: inputStyle}} required />
                            <input value={sendData.note} placeholder="Note (optional)" onChange={(e) => setSendData({ ...sendData, note: e.target.value })} {...{style: inputStyle}} />
                            <button type="submit" style={{ padding: '12px 20px', background: '#0A9396', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700 }}>Send Payment</button>
                        </form>
                    </SectionCard>
                )}

                {/* Schedules */}
                {activeTab === 'schedules' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ margin: 0, color: isDark ? '#f1f5f9' : '#0f172a' }}>Payment Schedules</h2>
                            <LoadingButton onClick={() => setShowSchedModal(true)} variant="primary" style={{ background: '#0A9396', border: 'none' }}>
                                <Plus size={18} /> Create Schedule
                            </LoadingButton>
                        </div>
                        {schedLoading ? (
                            <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#94a3b8' : '#64748b' }}>Loading schedules...</div>
                        ) : schedules.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#94a3b8' : '#64748b' }}>
                                <Clock size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
                                <h3 style={{ color: isDark ? '#f1f5f9' : '#1e293b', marginBottom: 8 }}>No schedules yet</h3>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: 16 }}>
                                {schedules.map((s: any) => (
                                    <SectionCard key={s.id} style={{ background: isDark ? 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(51,65,85,0.9))' : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: 18, color: isDark ? '#f1f5f9' : '#1e293b', marginBottom: 4 }}>{s.name}</div>
                                                {s.description && <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 14, marginBottom: 12 }}>{s.description}</div>}
                                                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                                    <div><span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>Amount</span><div style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#f1f5f9' : '#1e293b' }}>RWF {parseFloat(s.amount).toLocaleString()}</div></div>
                                                    <div><span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>Recipient</span><div style={{ fontSize: 14, fontWeight: 600, color: '#0A9396' }}>{s.recipient_type === 'phone' ? 'Phone' : 'Account'}: {s.recipient_value}</div></div>
                                                    <div><span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>Frequency</span><div style={{ fontSize: 16, fontWeight: 600, color: '#0A9396', textTransform: 'capitalize' }}>{s.frequency}</div></div>
                                                    <div><span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>Status</span><div style={{ fontSize: 16, fontWeight: 600, color: s.status === 'active' ? '#10b981' : s.status === 'paused' ? '#f59e0b' : '#64748b', textTransform: 'capitalize' }}>{s.status}</div></div>
                                                    <div><span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>Next</span><div style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b' }}>{s.next_payment_date || 'N/A'}</div></div>
                                            </div>
                                        </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {s.status === 'active' && <button onClick={() => handlePauseResume(s.id, 'pause')} style={{ padding: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, cursor: 'pointer', color: '#f59e0b' }}><Pause size={16} /></button>}
                                                {s.status === 'paused' && <button onClick={() => handlePauseResume(s.id, 'resume')} style={{ padding: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, cursor: 'pointer', color: '#10b981' }}><Play size={16} /></button>}
                                                <button onClick={() => handleDeleteSchedule(s.id)} style={{ padding: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </SectionCard>
                                ))}
                            </div>
                        )}

                        {/* Create Schedule Modal */}
                        {showSchedModal && (
                            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
                                <div style={{ background: isDark ? '#1e293b' : 'white', borderRadius: 24, padding: 32, maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: isDark ? '#f1f5f9' : '#1e293b', marginBottom: 24 }}>Create Schedule</div>
                                    <form onSubmit={handleCreateSchedule} style={{ display: 'grid', gap: 16 }}>
                                        <input placeholder="Schedule name" value={schedForm.name} onChange={(e) => setSchedForm({ ...schedForm, name: e.target.value })} required {...{style: inputStyle}} />
                                        <input type="text" inputMode="decimal" placeholder="Amount (RWF)" value={schedForm.amount} onChange={(e) => setSchedForm({ ...schedForm, amount: e.target.value })} required {...{style: inputStyle}} />
                                        
                                        {/* Recipient Type Selector */}
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button type="button" onClick={() => { setSchedPayType('account'); setSchedForm({ ...schedForm, recipient: '' }); }}
                                                style={{ flex: 1, padding: 10, borderRadius: 10, border: schedPayType === 'account' ? '2px solid #0A9396' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                                    background: schedPayType === 'account' ? (isDark ? 'rgba(10,147,150,0.15)' : 'rgba(10,147,150,0.08)') : 'transparent',
                                                    color: isDark ? '#E2E8F0' : '#0f172a', cursor: 'pointer', fontWeight: schedPayType === 'account' ? 700 : 400 }}>
                                                Account ID
                                            </button>
                                            <button type="button" onClick={() => { setSchedPayType('phone'); setSchedForm({ ...schedForm, recipient: '' }); }}
                                                style={{ flex: 1, padding: 10, borderRadius: 10, border: schedPayType === 'phone' ? '2px solid #0A9396' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                                    background: schedPayType === 'phone' ? (isDark ? 'rgba(10,147,150,0.15)' : 'rgba(10,147,150,0.08)') : 'transparent',
                                                    color: isDark ? '#E2E8F0' : '#0f172a', cursor: 'pointer', fontWeight: schedPayType === 'phone' ? 700 : 400 }}>
                                                Phone Number
                                            </button>
                                        </div>

                                        {schedPayType === 'phone' ? (
                                            <input placeholder="Phone number (e.g., 078xxxxxxx)" type="tel" value={schedForm.recipient} onChange={(e) => setSchedForm({ ...schedForm, recipient: e.target.value })} required {...{style: inputStyle}} />
                                        ) : (
                                            <input placeholder="Account number" value={schedForm.recipient} onChange={(e) => setSchedForm({ ...schedForm, recipient: e.target.value })} required {...{style: inputStyle}} />
                                        )}

                                        <select value={schedForm.frequency} onChange={(e) => setSchedForm({ ...schedForm, frequency: e.target.value })} {...{style: inputStyle}}>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                        <input type="date" placeholder="Start date" value={schedForm.startDate} onChange={(e) => setSchedForm({ ...schedForm, startDate: e.target.value })} required {...{style: inputStyle}} />
                                        <input type="date" placeholder="End date (optional)" value={schedForm.endDate} onChange={(e) => setSchedForm({ ...schedForm, endDate: e.target.value })} {...{style: inputStyle}} />
                                        <textarea placeholder="Description (optional)" value={schedForm.description} onChange={(e) => setSchedForm({ ...schedForm, description: e.target.value })} rows={3} {...{style: {...inputStyle, resize: 'vertical'}}} />
                                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                            <button type="button" onClick={() => setShowSchedModal(false)} style={{ padding: '12px 24px', background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}`, borderRadius: 12, cursor: 'pointer', color: isDark ? '#f1f5f9' : '#1e293b' }}>Cancel</button>
                                            <LoadingButton type="submit" variant="primary">Create</LoadingButton>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {message && <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: isDark ? '#064e3b' : '#d1fae5', color: isDark ? '#d1fae5' : '#065f46' }}>{message}</div>}
                {error && <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: isDark ? '#7f1d1d' : '#fee2e2', color: isDark ? '#fde2e2' : '#991b1b' }}>{error}</div>}
            </div>
            <Footer />
            {pinAction && (
                <PinModal
                    action="Confirm sending money"
                    onSuccess={() => { const cb = pinAction.cb; setPinAction(null); cb(); }}
                    onCancel={() => setPinAction(null)}
                />
            )}
        </div>
    );
};

export default Payments;
