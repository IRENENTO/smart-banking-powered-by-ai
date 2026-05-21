import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionCard from '../components/SectionCard';
import { accountService } from '../services/api';
import { useBanking } from '../context/BankingContext';
import { useTheme } from '../context/ThemeContext';

const Accounts: React.FC = () => {
    const { balance, loading } = useBanking();
    const [account, setAccount] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const [accountRes, profileRes] = await Promise.all([
                    accountService.getAccount(),
                    fetch('/api/profile', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    }).then(r => r.json())
                ]);
                setAccount(accountRes.data?.account ?? null);
                setProfile(profileRes.user ?? null);
            } catch (error) {
                console.error('Error fetching account:', error);
            }
        };
        fetchAccount();
    }, []);

    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const displayBalance = balance ?? 0;
    const accountNumber = account?.user?.account_number ?? profile?.account_number ?? 'N/A';
    const userName = account?.user?.name ?? profile?.name ?? 'User';
    const userEmail = account?.user?.email ?? profile?.email ?? '';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ flex: 1, padding: 24, background: isDark ? '#0B1F3A' : '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1>My Accounts</h1>
                        <p style={{ color: isDark ? '#cbd5e1' : '#475569', marginTop: 8 }}>Track your balance and account details.</p>
                    </div>
                    <Link to="/dashboard"><button style={{ padding: '10px 20px', background: '#0A9396', color: 'white', border: 'none', borderRadius: 8 }}>Back to Dashboard</button></Link>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading account...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
                        <SectionCard style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#7dd3fc' : '#0B1F3A' }}>Savings</div>
                                    <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: isDark ? '#e2e8f0' : 'inherit' }}>{userName}</div>
            <Footer />
        </div>
                                <div style={{ background: '#0A9396', borderRadius: 12, color: 'white', padding: '8px 12px', fontSize: 14 }}>Active</div>
                            </div>
                            <div style={{ marginTop: 24 }}>
                                <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>Balance</div>
                                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8, color: isDark ? '#f8fafc' : 'inherit' }}>RWF {displayBalance.toLocaleString()}</div>
                                <div style={{ marginTop: 14, color: isDark ? '#cbd5e1' : '#475569' }}>{accountNumber}</div>
                                <div style={{ marginTop: 8, fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>{userEmail}</div>
                            </div>
                        </SectionCard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Accounts;
