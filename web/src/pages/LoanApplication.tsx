import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBanking } from '../context/BankingContext';
import Navbar from '../components/Navbar';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { profileService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const LoanApplication: React.FC = () => {
    const { applyLoan, loading } = useBanking();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { eligibleAmount?: number, monthlyIncome?: string, existingDebt?: string } | null;
    const { t } = useLanguage();
    const { theme } = useTheme();
    const darkMode = theme === 'dark';
    
    const [formData, setFormData] = useState({
        amount: state?.eligibleAmount?.toString() || '',
        purpose: '',
        duration: '12',
        monthlyIncome: state?.monthlyIncome || '',
        existingDebt: state?.existingDebt || '',
        sector: 'Employee',
        deductionAmount: '',
        deductionPeriod: 'monthly'
    });
    const maxEligibleAmount = state?.eligibleAmount;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = Number(e.target.value);
        if (maxEligibleAmount && val > maxEligibleAmount) {
            val = maxEligibleAmount;
        }
        setFormData({ ...formData, amount: val ? val.toString() : '' });
    };
    const [error, setError] = useState('');
    const [userProfile, setUserProfile] = useState<any>(null);
    const [profileCompleted, setProfileCompleted] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await profileService.getProfile();
                setUserProfile(response.data.user);
                setProfileCompleted(response.data.user?.profile_completed || false);
            } catch (err: any) {
                console.error('Failed to load profile:', err);
            } finally {
                setLoadingProfile(false);
            }
        };

        loadProfile();
    }, []);

    const loanPrediction = formData.monthlyIncome ? `You can borrow up to ${Math.min(500000, Number(formData.monthlyIncome) * 6).toLocaleString()} RWF` : 'Build transaction history for personalized predictions';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Check if profile is completed
        if (!profileCompleted) {
            setError('Please complete your profile before requesting a loan. Complete your identification details first.');
            navigate('/settings');
            return;
        }

        try {
            await applyLoan({
                amount: Number(formData.amount),
                purpose: formData.purpose,
                duration: Number(formData.duration),
                monthlyIncome: Number(formData.monthlyIncome),
                existingDebt: Number(formData.existingDebt),
                deductionAmount: formData.deductionAmount ? Number(formData.deductionAmount) : undefined,
                deductionPeriod: formData.deductionPeriod || undefined
            });

            navigate('/loan-status');
        } catch (err: any) {
            const response = err.response;
            if (response?.status === 403 && response?.data?.msg?.includes('Profile')) {
                setError('Please complete your profile before requesting a loan.');
                navigate('/complete-profile');
                return;
            }
            setError(response?.data?.msg || 'Loan application failed');
        }
    };

    if (loadingProfile) {
        return (
            <>
                <Navbar authenticated={!!localStorage.getItem('token')} />
                <div style={{ minHeight: '100vh', padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', background: darkMode ? '#0f172a' : '#eef7fb' }}>
                    <h2 style={{ color: darkMode ? '#f1f5f9' : '#0B1F3A' }}>{t('loanApplication.title')}</h2>
                    <p style={{ color: darkMode ? '#94a3b8' : '#475569' }}>{t('loanApplication.loading')}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ minHeight: '100vh', padding: '20px', maxWidth: '600px', margin: '0 auto', background: darkMode ? '#0f172a' : '#eef7fb' }}>
                <h2 style={{ margin: 0, color: darkMode ? '#f1f5f9' : '#0B1F3A' }}>{t('loanApplication.title')}</h2>
                <p style={{ color: darkMode ? '#94a3b8' : '#475569' }}>{t('loanApplication.subtitle')}</p>

                {/* Profile Status Alert */}
                <SectionCard 
                    title={profileCompleted ? t('loanApplication.profileComplete') : t('loanApplication.profileIncomplete')}
                    subtitle={profileCompleted 
                        ? t('loanApplication.profileCompleteDesc')
                        : t('loanApplication.profileIncompleteDesc')
                    }
                    headerRight={
                        <div style={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: profileCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: profileCompleted ? '#10b981' : '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                        }}>
                            {profileCompleted ? '✓' : '⚠️'}
                        </div>
                    }
                    style={{
                        background: profileCompleted 
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))'
                            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))'
                    }}
                >
                    {!profileCompleted && (
                        <LoadingButton
                            onClick={() => navigate('/settings')}
                            variant="primary"
                            style={{ marginTop: 12 }}
                        >
                            {t('loanApplication.completeProfile')}
                        </LoadingButton>
                    )}
                </SectionCard>

                <SectionCard 
                    title={t('loanApplication.aiPrediction')}
                    subtitle={t('loanApplication.aiPredictionDesc')}
                    style={{ marginTop: 24 }}
                >
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#0B1F3A', marginBottom: 12 }}>
                        {loanPrediction}
                    </div>
                    <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>{t('loanApplication.buildCredit')}</div>
                </SectionCard>

                <form onSubmit={handleSubmit} style={{ marginTop: 28, display: 'grid', gap: 18 }}>
                    <label style={{ display: 'grid', gap: 8, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                        {t('loanApplication.requestedAmount')} {maxEligibleAmount && <span style={{fontSize: '12px', color: '#0A9396'}}>({t('loanApplication.maxEligible')}: {maxEligibleAmount.toLocaleString()} RWF)</span>}
                        <input type="number" value={formData.amount} onChange={handleAmountChange} max={maxEligibleAmount} required style={{ width: '100%', padding: 12, borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' }} />
                    </label>
                    <label style={{ display: 'grid', gap: 8, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                        {t('loanApplication.monthlyIncome')}
                        <input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })} required style={{ width: '100%', padding: 12, borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' }} />
                    </label>
                    <label style={{ display: 'grid', gap: 8, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                        {t('loanApplication.sector')}
                        <select value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                            <option>{t('loanApplication.employee')}</option>
                            <option>{t('loanApplication.agriculture')}</option>
                            <option>{t('loanApplication.sme')}</option>
                            <option>{t('loanApplication.informal')}</option>
                            <option>{t('loanApplication.student')}</option>
                        </select>
                    </label>
                    <label style={{ display: 'grid', gap: 8, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                        {t('loanApplication.existingDebt')}
                        <input type="number" value={formData.existingDebt} onChange={(e) => setFormData({ ...formData, existingDebt: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' }} />
                    </label>
                    <SectionCard title={t('loanApplication.deductionInfo')} style={{ background: darkMode ? 'rgba(10,147,150,0.08)' : 'rgba(10,147,150,0.04)', border: '1px solid rgba(10,147,150,0.2)' }}>
                        <div style={{ display: 'grid', gap: 18 }}>
                            <label style={{ display: 'grid', gap: 8, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                                {t('loanApplication.deductionAmount')}
                                <input type="number" value={formData.deductionAmount} onChange={(e) => setFormData({ ...formData, deductionAmount: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' }} />
                            </label>
                            <label style={{ display: 'grid', gap: 8, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                                {t('loanApplication.deductionPeriod')}
                                <select value={formData.deductionPeriod} onChange={(e) => setFormData({ ...formData, deductionPeriod: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                                    <option value="daily">{t('loanApplication.deductionPeriodDaily')}</option>
                                    <option value="weekly">{t('loanApplication.deductionPeriodWeekly')}</option>
                                    <option value="monthly">{t('loanApplication.deductionPeriodMonthly')}</option>
                                </select>
                            </label>
                        </div>
                    </SectionCard>
                    <label style={{ display: 'grid', gap: 8, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                        {t('loanApplication.purpose')}
                        <input type="text" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} required style={{ width: '100%', padding: 12, borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' }} />
                    </label>
                    <LoadingButton 
                        type="submit" 
                        disabled={loading || !profileCompleted} 
                        variant={profileCompleted ? "primary" : "ghost"}
                        loading={loading}
                        style={{ 
                            width: '100%',
                            opacity: profileCompleted ? 1 : 0.6
                        }}
                    >
                        {!profileCompleted 
                            ? t('loanApplication.completeProfileFirst')
                            : t('loanApplication.submit')
                        }
                    </LoadingButton>
                </form>
                {error && <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: '#fee2e2', color: '#991b1b' }}>{error}</div>}
            </div>
        </>
    );
};

export default LoanApplication;
