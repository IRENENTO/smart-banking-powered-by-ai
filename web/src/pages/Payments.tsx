import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SectionCard from '../components/SectionCard';
import { useBanking } from '../context/BankingContext';
import { useTheme } from '../context/ThemeContext';

const Payments: React.FC = () => {
    const { balance, deposit, sendPayment, transfer, loading } = useBanking();
    const [activeTab, setActiveTab] = useState<'send' | 'deposit' | 'transfer'>('send');
    const [sendData, setSendData] = useState({ recipient: '', account: '', amount: '', note: '' });
    const [depositAmount, setDepositAmount] = useState('');
    const [depositPhoneNumber, setDepositPhoneNumber] = useState('');
    const [transferData, setTransferData] = useState({ account: '', amount: '', note: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const amountValue = parseFloat(sendData.amount);
        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            setError('Enter a valid payment amount');
            return;
        }

        try {
            await sendPayment(
                amountValue,
                sendData.account,
                sendData.recipient,
                sendData.note
            );
            setMessage(`Sent RWF ${amountValue.toLocaleString()} to ${sendData.recipient}`);
            setSendData({ recipient: '', account: '', amount: '', note: '' });
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Payment failed');
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const amountValue = parseFloat(depositAmount);
        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            setError('Enter a valid deposit amount');
            return;
        }

        try {
            await deposit(amountValue, 'Deposit', depositPhoneNumber || undefined);
            if (depositPhoneNumber) {
                setMessage(`Deposit initiated. Please complete the payment on ${depositPhoneNumber}.`);
            } else {
                setMessage(`Deposited RWF ${amountValue.toLocaleString()}`);
            }
            setDepositAmount('');
            setDepositPhoneNumber('');
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Deposit failed');
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const amountValue = parseFloat(transferData.amount);
        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            setError('Enter a valid transfer amount');
            return;
        }

        try {
            await transfer(
                amountValue,
                transferData.account,
                transferData.note
            );
            setMessage(`Transferred RWF ${amountValue.toLocaleString()}`);
            setTransferData({ account: '', amount: '', note: '' });
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Transfer failed');
        }
    };

    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const displayBalance = balance ?? 0;

    return (
        <div>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ padding: 24, minHeight: 'calc(100vh - 48px)', background: isDark ? '#071B2F' : '#eef7fb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div>
                        <h1>Payments</h1>
                        <p style={{ color: isDark ? '#cbd5e1' : '#475569', marginTop: 8 }}>Send money, deposit funds, and manage transfers from one place.</p>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#0A9396' }}>
                        Balance: RWF {loading ? '...' : displayBalance.toLocaleString()}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    {(['send', 'deposit', 'transfer'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setMessage(''); setError(''); }}
                            style={{
                                borderRadius: 999,
                                border: activeTab === tab ? '1px solid #0A9396' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                background: activeTab === tab ? '#0A9396' : (isDark ? '#0f172a' : 'white'),
                                color: activeTab === tab ? 'white' : (isDark ? '#e2e8f0' : '#0f172a'),
                                padding: '10px 20px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'deposit' && (
                    <SectionCard title="Deposit Money">
                        <form onSubmit={handleDeposit} style={{ marginTop: 18, display: 'grid', gap: 16 }}>
                            <input
                                value={depositAmount}
                                placeholder="Amount (RWF)"
                                type="number"
                                min="0.01"
                                step="0.01"
                                onChange={(e) => setDepositAmount(e.target.value)}
                                style={{ padding: 12, borderRadius: 14, border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0F172A' : 'white', color: isDark ? '#E2E8F0' : 'inherit' }}
                                required
                            />
                            <input
                                value={depositPhoneNumber}
                                placeholder="Source phone number (mobile money)"
                                type="tel"
                                onChange={(e) => setDepositPhoneNumber(e.target.value)}
                                style={{ padding: 12, borderRadius: 14, border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0F172A' : 'white', color: isDark ? '#E2E8F0' : 'inherit' }}
                            />
                            <button type="submit" style={{ padding: '12px 20px', background: '#059669', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700 }}>Deposit</button>
                        </form>
                    </SectionCard>
                )}

                {activeTab === 'send' && (
                    <SectionCard title="Send Money">
                        <form onSubmit={handleSend} style={{ marginTop: 18, display: 'grid', gap: 16 }}>
                            <input value={sendData.recipient} placeholder="Recipient name" onChange={(e) => setSendData({ ...sendData, recipient: e.target.value })} style={{ padding: 12, borderRadius: 14, border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0F172A' : 'white', color: isDark ? '#E2E8F0' : 'inherit' }} required />
                            <input value={sendData.account} placeholder="Account number" onChange={(e) => setSendData({ ...sendData, account: e.target.value })} style={{ padding: 12, borderRadius: 14, border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0F172A' : 'white', color: isDark ? '#E2E8F0' : 'inherit' }} required />
                            <input value={sendData.amount} placeholder="Amount (RWF)" type="number" min="0.01" step="0.01" onChange={(e) => setSendData({ ...sendData, amount: e.target.value })} style={{ padding: 12, borderRadius: 14, border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0F172A' : 'white', color: isDark ? '#E2E8F0' : 'inherit' }} required />
                            <input value={sendData.note} placeholder="Note" onChange={(e) => setSendData({ ...sendData, note: e.target.value })} style={{ padding: 12, borderRadius: 14, border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0F172A' : 'white', color: isDark ? '#E2E8F0' : 'inherit' }} />
                            <button type="submit" style={{ padding: '12px 20px', background: '#0A9396', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700 }}>Send Payment</button>
                        </form>
                    </SectionCard>
                )}

                {activeTab === 'transfer' && (
                    <SectionCard title="Transfer Money">
                        <form onSubmit={handleTransfer} style={{ marginTop: 18, display: 'grid', gap: 16 }}>
                            <input value={transferData.account} placeholder="Recipient account number" onChange={(e) => setTransferData({ ...transferData, account: e.target.value })} style={{ padding: 12, borderRadius: 14, border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0F172A' : 'white', color: isDark ? '#E2E8F0' : 'inherit' }} required />
                            <input value={transferData.amount} placeholder="Amount (RWF)" type="number" min="0.01" step="0.01" onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })} style={{ padding: 12, borderRadius: 14, border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0F172A' : 'white', color: isDark ? '#E2E8F0' : 'inherit' }} required />
                            <input value={transferData.note} placeholder="Note" onChange={(e) => setTransferData({ ...transferData, note: e.target.value })} style={{ padding: 12, borderRadius: 14, border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0F172A' : 'white', color: isDark ? '#E2E8F0' : 'inherit' }} />
                            <button type="submit" style={{ padding: '12px 20px', background: '#0A9396', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700 }}>Transfer</button>
                        </form>
                    </SectionCard>
                )}

                {message && <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: isDark ? '#064e3b' : '#d1fae5', color: isDark ? '#d1fae5' : '#065f46' }}>{message}</div>}
                {error && <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: isDark ? '#7f1d1d' : '#fee2e2', color: isDark ? '#fde2e2' : '#991b1b' }}>{error}</div>}
            </div>
        </div>
    );
};

export default Payments;
