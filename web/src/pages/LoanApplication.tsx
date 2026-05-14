import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBanking } from '../context/BankingContext';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { profileService } from '../services/api';

const LoanApplication: React.FC = () => {
    const { applyLoan, loading } = useBanking();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { eligibleAmount?: number, monthlyIncome?: string, existingDebt?: string } | null;
    
    const [formData, setFormData] = useState({
        amount: state?.eligibleAmount?.toString() || '',
        purpose: '',
        duration: '12',
        monthlyIncome: state?.monthlyIncome || '',
        existingDebt: state?.existingDebt || '',
        sector: 'Employee'
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
                existingDebt: Number(formData.existingDebt)
            });

            navigate('/loans');
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
            <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <h2>Intelligent Loan Application</h2>
                <p style={{ color: '#475569' }}>Loading your profile information...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Intelligent Loan Application</h2>
            <p style={{ color: '#475569' }}>Complete the form and submit for AI-powered loan approval.</p>

            {/* Profile Status Alert */}
            <SectionCard 
                title={profileCompleted ? 'Profile Complete - Loan Eligible' : 'Profile Incomplete - Action Required'}
                subtitle={profileCompleted 
                    ? 'Your profile is complete and you can apply for loans with AI-powered approval.'
                    : 'Please complete your profile identification details before applying for a loan.'
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
                        Complete Profile Now
                    </LoadingButton>
                )}
            </SectionCard>

            <SectionCard 
                title="AI Loan Prediction"
                subtitle="Get personalized loan estimates based on your profile"
                style={{ marginTop: 24 }}
            >
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#0B1F3A', marginBottom: 12 }}>
                    {loanPrediction}
                </div>
                <div style={{ color: '#64748b' }}>Start transacting to build your credit profile for better loan eligibility.</div>
            </SectionCard>

            <form onSubmit={handleSubmit} style={{ marginTop: 28, display: 'grid', gap: 18 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                    Requested Amount (RWF) {maxEligibleAmount && <span style={{fontSize: '12px', color: '#0A9396'}}>(Max eligible: {maxEligibleAmount.toLocaleString()} RWF)</span>}
                    <input type="number" value={formData.amount} onChange={handleAmountChange} max={maxEligibleAmount} required style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                    Monthly Income (RWF)
                    <input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })} required style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                    Sector
                    <select value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #cbd5e1' }}>
                        <option>Employee</option>
                        <option>Agriculture</option>
                        <option>SME</option>
                        <option>Informal</option>
                        <option>Student</option>
                    </select>
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                    Existing Monthly Debt (RWF)
                    <input type="number" value={formData.existingDebt} onChange={(e) => setFormData({ ...formData, existingDebt: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                    Loan Purpose
                    <input type="text" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} required style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #cbd5e1' }} />
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
                        ? 'Complete Profile First' 
                        : 'Submit for AI Approval'
                    }
                </LoadingButton>
            </form>
            {error && <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: '#fee2e2', color: '#991b1b' }}>{error}</div>}
        </div>
    );
};

export default LoanApplication;
