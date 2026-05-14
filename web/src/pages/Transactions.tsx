import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SectionCard from '../components/SectionCard';
import { paymentService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState('All');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await paymentService.getTransactionHistory();
            const txData = response.data?.transactions ?? [];
            setTransactions(txData);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', ...Array.from(new Set(transactions.map(t => t.type)))];
    const filtered = selected === 'All' ? transactions : transactions.filter((item) => item.type === selected);

    const totalByType = categories.filter(c => c !== 'All').map(category => ({
        category,
        total: transactions.filter(tx => tx.type === category).reduce((sum, tx) => sum + (tx.amount || 0), 0)
    }));
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ padding: 24, minHeight: 'calc(100vh - 48px)', background: isDark ? '#071B2F' : '#eef7fb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                    <div>
                        <h1>Transactions</h1>
                        <p style={{ color: isDark ? '#cbd5e1' : '#475569', marginTop: 8 }}>Review your spending across categories and track your financial activity.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelected(category)}
                                style={{
                                    borderRadius: 999,
                                    border: selected === category ? '1px solid #0A9396' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                    background: selected === category ? '#0A9396' : (isDark ? '#0F172A' : 'white'),
                                    color: selected === category ? 'white' : (isDark ? '#e2e8f0' : '#0f172a'),
                                    padding: '10px 16px',
                                    cursor: 'pointer'
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 24 }}>
                    <SectionCard title="Summary" subtitle="Total transactions by type.">
                        <div style={{ marginTop: 16 }}>
                            {totalByType.length === 0 ? (
                                <div style={{ color: '#64748b', padding: 16 }}>No transactions yet.</div>
                            ) : (
                                totalByType.map(({ category, total }) => (
                                    <div key={category} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <span>{category}</span>
                                        <strong>RWF {total.toLocaleString()}</strong>
                                    </div>
                                ))
                            )}
                        </div>
                    </SectionCard>
                    <SectionCard title="Account Info" subtitle="Your account details.">
                        <div style={{ marginTop: 16, color: '#475569' }}>
                            <div style={{ marginBottom: 12 }}>Total Transactions: <strong>{transactions.length}</strong></div>
                            <div>Completed: <strong>{transactions.filter(t => t.status === 'completed').length}</strong></div>
                        </div>
                    </SectionCard>
                </div>

                <SectionCard title="Transaction History">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading transactions...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                            No transactions yet. Make your first deposit or transfer to get started.
                        </div>
                    ) : (
                        filtered.map((tx) => (
                            <div key={tx.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, padding: 16, marginTop: 12, borderRadius: 16, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, background: isDark ? '#0B1527' : 'white' }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: isDark ? '#e2e8f0' : 'inherit' }}>{tx.description}</div>
                                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', marginTop: 6 }}>{tx.type} • {new Date(tx.created_at).toLocaleDateString()}</div>
                                    {tx.recipient_name && <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}>To: {tx.recipient_name}</div>}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, color: isDark ? '#f8fafc' : 'inherit' }}>RWF {tx.amount.toLocaleString()}</div>
                                    <div style={{ color: isDark ? '#cbd5e1' : '#0f172a', marginTop: 6 }}>{tx.status}</div>
                                </div>
                            </div>
                        ))
                    )}
                </SectionCard>
            </div>
        </div>
    );
};

export default Transactions;
