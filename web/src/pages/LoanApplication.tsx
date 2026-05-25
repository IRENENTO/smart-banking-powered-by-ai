import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBanking } from '../context/BankingContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { profileService } from '../services/api';
import * as aiEngine from '../services/aiService';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Shield, TrendingUp, AlertTriangle, CheckCircle, Brain } from 'lucide-react';

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

    const [aiPrediction, setAiPrediction] = useState<any>(null);
    const [predicting, setPredicting] = useState(false);

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

    const fetchPrediction = async () => {
        const amount = Number(formData.amount);
        const income = Number(formData.monthlyIncome);
        if (!amount || amount <= 0 || !income || income <= 0) return;

        setPredicting(true);
        try {
            const result = await aiEngine.predictLoan({
                loan_amount: amount,
                income: income,
                expenses: Number(formData.existingDebt) || 0,
                employment_status: formData.sector.toLowerCase(),
                credit_score: 650,
            });
            setAiPrediction(result);
        } catch (err) {
            console.error('Prediction error:', err);
            setAiPrediction(null);
        } finally {
            setPredicting(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchPrediction, 800);
        return () => clearTimeout(timer);
    }, [formData.amount, formData.monthlyIncome, formData.existingDebt, formData.sector]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

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

    const approvalColor = aiPrediction?.approval_status === 'APPROVED' ? '#10b981' 
        : aiPrediction?.approval_status === 'REJECTED' ? '#ef4444' : '#f59e0b';
    const riskColor = aiPrediction?.risk_score >= 70 ? '#ef4444' 
        : aiPrediction?.risk_score >= 40 ? '#f59e0b' : '#10b981';

    if (loadingProfile) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar authenticated={!!localStorage.getItem('token')} />
                <div style={{ flex: 1, padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', background: darkMode ? '#0f172a' : '#eef7fb' }}>
                    <h2 style={{ color: darkMode ? '#f1f5f9' : '#0B1F3A' }}>{t('loanApplication.title')}</h2>
                    <p style={{ color: darkMode ? '#94a3b8' : '#475569' }}>{t('loanApplication.loading')}</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ flex: 1, padding: '20px', maxWidth: '600px', margin: '0 auto', background: darkMode ? '#0f172a' : '#eef7fb' }}>
                <h2 style={{ margin: 0, color: darkMode ? '#f1f5f9' : '#0B1F3A' }}>{t('loanApplication.title')}</h2>
                <p style={{ color: darkMode ? '#94a3b8' : '#475569' }}>{t('loanApplication.subtitle')}</p>

                <SectionCard 
                    title={profileCompleted ? t('loanApplication.profileComplete') : t('loanApplication.profileIncomplete')}
                    subtitle={profileCompleted 
                        ? t('loanApplication.profileCompleteDesc')
                        : t('loanApplication.profileIncompleteDesc')
                    }
                    headerRight={
                        <div style={{
                            width: 50, height: 50, borderRadius: '50%',
                            background: profileCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: profileCompleted ? '#10b981' : '#f59e0b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
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
                        <LoadingButton onClick={() => navigate('/settings')} variant="primary" style={{ marginTop: 12 }}>
                            {t('loanApplication.completeProfile')}
                        </LoadingButton>
                    )}
                </SectionCard>

                {aiPrediction && (
                    <SectionCard 
                        title="AI Loan Prediction" 
                        subtitle="Real-time AI analysis based on your inputs"
                        style={{ marginTop: 24, border: `2px solid ${approvalColor}40` }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                            <div style={{ padding: 16, borderRadius: 12, background: darkMode ? `${approvalColor}15` : `${approvalColor}10`, border: `1px solid ${approvalColor}30` }}>
                                <div style={{ fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 4 }}>AI Decision</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {aiPrediction.approval_status === 'APPROVED' 
                                        ? <CheckCircle size={20} color={approvalColor} />
                                        : <AlertTriangle size={20} color={approvalColor} />
                                    }
                                    <span style={{ fontWeight: 700, fontSize: 16, color: approvalColor }}>
                                        {aiPrediction.approval_status}
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: 16, borderRadius: 12, background: darkMode ? `${riskColor}15` : `${riskColor}10`, border: `1px solid ${riskColor}30` }}>
                                <div style={{ fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 4 }}>Risk Score</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Shield size={20} color={riskColor} />
                                    <span style={{ fontWeight: 700, fontSize: 16, color: riskColor }}>{aiPrediction.risk_score}/100</span>
                                </div>
                            </div>
                            <div style={{ padding: 16, borderRadius: 12, background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff', border: '1px solid rgba(59,130,246,0.2)' }}>
                                <div style={{ fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 4 }}>Approval Probability</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <TrendingUp size={20} color="#3b82f6" />
                                    <span style={{ fontWeight: 700, fontSize: 16, color: '#3b82f6' }}>
                                        {aiPrediction.approval_probability 
                                            ? `${(aiPrediction.approval_probability * 100).toFixed(0)}%` 
                                            : aiPrediction.approval_status === 'APPROVED' ? '> 70%' : '< 50%'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: 16, borderRadius: 12, background: darkMode ? 'rgba(245,158,11,0.1)' : '#fffbeb', border: '1px solid rgba(245,158,11,0.2)' }}>
                                <div style={{ fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 4 }}>Default Probability</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <AlertTriangle size={20} color="#f59e0b" />
                                    <span style={{ fontWeight: 700, fontSize: 16, color: '#f59e0b' }}>
                                        {aiPrediction.default_probability 
                                            ? `${(aiPrediction.default_probability * 100).toFixed(1)}%` 
                                            : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b' }}>
                            <Brain size={14} />
                            <span>{aiPrediction.ai_powered ? 'AI Engine powered prediction' : 'Estimated prediction (AI Engine offline)'}</span>
                        </div>
                        {aiPrediction.explanation && (
                            <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: darkMode ? 'rgba(10,147,150,0.08)' : '#ecfeff', border: '1px solid rgba(10,147,150,0.2)', fontSize: 13, color: darkMode ? '#cbd5e1' : '#475569' }}>
                                <strong>AI Insight:</strong> {aiPrediction.explanation}
                            </div>
                        )}
                    </SectionCard>
                )}

                {predicting && (
                    <SectionCard title="AI Analyzing..." style={{ marginTop: 24 }}>
                        <div style={{ textAlign: 'center', padding: 20 }}>
                            <div style={{ animation: 'spin 1s linear infinite', width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#0A9396', margin: '0 auto 12px' }} />
                            <div style={{ fontSize: 14, color: darkMode ? '#94a3b8' : '#64748b' }}>AI Engine analyzing your loan application...</div>
                        </div>
                    </SectionCard>
                )}

                <form onSubmit={handleSubmit} style={{ marginTop: 28, display: 'grid', gap: 18 }}>
                    <label style={{ display: 'grid', gap: 8, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                        {t('loanApplication.requestedAmount')} {maxEligibleAmount && <span style={{fontSize: '12px', color: '#0A9396'}}>({t('loanApplication.maxEligible')}: {maxEligibleAmount.toLocaleString()} RWF)</span>}
                        <input type="text" inputMode="decimal" value={formData.amount} onChange={handleAmountChange} max={maxEligibleAmount} required style={{ width: '100%', padding: 12, borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' }} />
                    </label>
                    <label style={{ display: 'grid', gap: 8, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                        {t('loanApplication.monthlyIncome')}
                        <input type="text" inputMode="decimal" value={formData.monthlyIncome} onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })} required style={{ width: '100%', padding: 12, borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' }} />
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
                        <input type="text" inputMode="decimal" value={formData.existingDebt} onChange={(e) => setFormData({ ...formData, existingDebt: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' }} />
                    </label>
                    <SectionCard title={t('loanApplication.deductionInfo')} style={{ background: darkMode ? 'rgba(10,147,150,0.08)' : 'rgba(10,147,150,0.04)', border: '1px solid rgba(10,147,150,0.2)' }}>
                        <div style={{ display: 'grid', gap: 18 }}>
                            <label style={{ display: 'grid', gap: 8, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                                {t('loanApplication.deductionAmount')}
                                <input type="text" inputMode="decimal" value={formData.deductionAmount} onChange={(e) => setFormData({ ...formData, deductionAmount: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' }} />
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
                        style={{ width: '100%', opacity: profileCompleted ? 1 : 0.6 }}
                    >
                        {!profileCompleted 
                            ? t('loanApplication.completeProfileFirst')
                            : t('loanApplication.submit')
                        }
                    </LoadingButton>
                </form>
                {error && <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: '#fee2e2', color: '#991b1b' }}>{error}</div>}
            </div>
            <Footer />
        </div>
    );
};

export default LoanApplication;
