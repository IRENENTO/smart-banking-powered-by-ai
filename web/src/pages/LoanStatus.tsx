import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calculator, Shield, Clock, CheckCircle, AlertCircle, Calendar, DollarSign, RotateCcw } from 'lucide-react';
import Navbar from '../components/Navbar';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { loanService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const LoanStatus: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [extendingLoan, setExtendingLoan] = useState<number | null>(null);
    const [extensionDays, setExtensionDays] = useState('');
    const [extensionResult, setExtensionResult] = useState<{ loanId: number; approved: boolean; reason?: string } | null>(null);
    const { theme } = useTheme();
    const darkMode = theme === 'dark';
    const toast = useToast();

    useEffect(() => {
        const loadLoans = async () => {
            setLoading(true);
            try {
                const response = await loanService.getLoans();
                const rawLoans = response.data.loans || [];
                const normalized = rawLoans.map((loan: any) => {
                    const ai = loan.aiDecision || loan.ai_decision || {};
                    const totalAmt = loan.total_amount || loan.amount * (1 + (loan.interest_rate || 10) / 100);
                    const paidAmt = parseFloat(loan.paid_amount || 0);
                    const paidPct = totalAmt > 0 ? Math.min(100, Math.round((paidAmt / totalAmt) * 100)) : 0;
                    return {
                        ...loan,
                        aiDecision: {
                            riskScore: ai.riskScore ?? ai.risk_score ?? 50,
                            confidence: ai.confidence ?? (ai.risk_score ? `${100 - ai.risk_score}%` : '50%'),
                            explanation: ai.explanation || ai.reason || 'Application is being processed.'
                        },
                        status: loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
                        paid_amount: paidAmt,
                        total_amount: totalAmt,
                        paid_percentage: paidPct
                    };
                });
                setLoans(normalized);
            } catch (err) {
                setLoans([]);
            } finally {
                setLoading(false);
            }
        };

        loadLoans();
    }, []);

    const handleExtension = async (loanId: number) => {
        if (!extensionDays || parseInt(extensionDays) < 1) return;
        try {
            const response = await loanService.requestExtension(loanId, parseInt(extensionDays));
            const approved = response.data.data?.approved || false;
            setExtensionResult({ loanId, approved, reason: response.data.data?.reason });
            setExtendingLoan(null);
            setExtensionDays('');
            if (approved) {
                toast.success('Extension approved!');
            } else {
                toast.error('Extension denied — less than 50% paid');
            }
            // Reload loans
            const resp = await loanService.getLoans();
            const rawLoans = resp.data.loans || [];
            const normalized = rawLoans.map((loan: any) => {
                const ai = loan.aiDecision || loan.ai_decision || {};
                const totalAmt = loan.total_amount || loan.amount * (1 + (loan.interest_rate || 10) / 100);
                const paidAmt = parseFloat(loan.paid_amount || 0);
                const paidPct = totalAmt > 0 ? Math.min(100, Math.round((paidAmt / totalAmt) * 100)) : 0;
                return {
                    ...loan,
                    aiDecision: {
                        riskScore: ai.riskScore ?? ai.risk_score ?? 50,
                        confidence: ai.confidence ?? (ai.risk_score ? `${100 - ai.risk_score}%` : '50%'),
                        explanation: ai.explanation || ai.reason || 'Application is being processed.'
                    },
                    status: loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
                    paid_amount: paidAmt,
                    total_amount: totalAmt,
                    paid_percentage: paidPct
                };
            });
            setLoans(normalized);
        } catch (err) {
            setExtensionResult({ loanId, approved: false, reason: 'Failed to process extension request' });
        }
    };

    return (
        <>
            <div style={{ minHeight: '100vh', background: darkMode ? '#0f172a' : '#eef7fb' }}>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ 
                    padding: '32px 24px', 
                    maxWidth: '1200px', 
                    margin: '0 auto',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ marginBottom: 32 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                        <div>
                            <h1 style={{ 
                                fontSize: 'clamp(28px, 4vw, 40px)', 
                                fontWeight: 800, 
                                margin: 0,
                                background: darkMode 
                                    ? 'linear-gradient(135deg, #60a5fa, #34d399)' 
                                    : 'linear-gradient(135deg, #0A9396, #059669)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                My Loan Applications
                            </h1>
                            <p style={{ 
                                color: darkMode ? '#94a3b8' : '#64748b', 
                                marginTop: 8, 
                                fontSize: '16px' 
                            }}>
                                Track your loan applications and request new loans
                            </p>
                        </div>
                        
                        <LoadingButton
                            onClick={() => navigate('/apply-loan')}
                            variant="primary"
                            size="lg"
                            style={{
                                background: 'linear-gradient(135deg, #0A9396, #059669)',
                                border: 'none',
                                boxShadow: '0 8px 25px rgba(10, 147, 150, 0.3)'
                            }}
                        >
                            <Plus size={20} />
                            Request New Loan
                        </LoadingButton>
                    </div>
                </motion.div>

                {/* Empty State */}
                {!loading && loans.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 60, color: darkMode ? '#94a3b8' : '#64748b' }}>
                        <AlertCircle size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
                        <h3 style={{ color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 8 }}>{t('loanStatus.noLoans')}</h3>
                        <LoadingButton onClick={() => navigate('/apply-loan')} variant="primary">
                            <Plus size={18} /> {t('common.applyLoan')}
                        </LoadingButton>
                    </div>
                )}

                {/* Loan Applications Grid */}
                <div style={{ display: 'grid', gap: 24, marginBottom: 32 }}>
                    {loans.map((loan, index) => (
                        <motion.div
                            key={loan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                        >
                            <SectionCard style={{ 
                                background: darkMode 
                                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9))'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))',
                                border: darkMode 
                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                    : '1px solid rgba(255, 255, 255, 0.5)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                            <div style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #0A9396, #059669)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Calculator size={24} style={{ color: 'white' }} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                                                    {loan.purpose}
                                                </h3>
                                                <div style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '14px', marginTop: 2 }}>
                                                    Amount: <strong style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                                                        RWF {loan.amount.toLocaleString()}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: 24, 
                                            marginTop: 16,
                                            padding: '12px 16px',
                                            background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
                                            borderRadius: '8px'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 4 }}>
                                                    AI Risk Score
                                                </div>
                                                <div style={{ 
                                                    fontSize: '20px', 
                                                    fontWeight: 700,
                                                    color: loan.aiDecision.riskScore < 40 ? '#10b981' : 
                                                           loan.aiDecision.riskScore < 70 ? '#f59e0b' : '#ef4444'
                                                }}>
                                                    {loan.aiDecision.riskScore}/100
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 4 }}>
                                                    Status
                                                </div>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 6,
                                                    fontWeight: 600
                                                }}>
                                                    {loan.status === 'Approved' && <CheckCircle size={16} style={{ color: '#10b981' }} />}
                                                    {loan.status === 'Pending' && <Clock size={16} style={{ color: '#f59e0b' }} />}
                                                    {loan.status === 'Rejected' && <AlertCircle size={16} style={{ color: '#ef4444' }} />}
                                                    <span style={{
                                                        color: loan.status === 'Approved' ? '#10b981' : 
                                                               loan.status === 'Pending' ? '#f59e0b' : '#ef4444'
                                                    }}>
                                                        {loan.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 4 }}>
                                                    AI Confidence
                                                </div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                                                    {loan.aiDecision.confidence}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style={{ marginTop: 12, color: darkMode ? '#94a3b8' : '#64748b', fontSize: '14px' }}>
                                            <Shield size={14} style={{ marginRight: 6, color: '#0A9396' }} />
                                            {loan.aiDecision.explanation}
                                        </div>

                                        {loan.status === 'Approved' && loan.deduction_amount && (
                                            <>
                                                <div style={{ marginTop: 20, borderTop: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', paddingTop: 16 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 16, color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <DollarSign size={18} style={{ color: '#0A9396' }} />
                                                        {t('loanStatus.progress')}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
                                                        <div>
                                                            <div style={{ fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b' }}>{t('loanStatus.paidPercentage')}</div>
                                                            <div style={{ fontSize: 20, fontWeight: 700, color: loan.paid_percentage >= 100 ? '#10b981' : '#0A9396' }}>
                                                                {loan.paid_percentage}%
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b' }}>{t('loanStatus.remainingAmount')}</div>
                                                            <div style={{ fontSize: 20, fontWeight: 700, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                                                                RWF {(loan.total_amount - loan.paid_amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b' }}>{t('loanStatus.nextDeduction')}</div>
                                                            <div style={{ fontSize: 14, fontWeight: 600, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                                                                {loan.next_deduction_date || 'N/A'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b' }}>
                                                                <Calendar size={14} style={{ marginRight: 4, color: '#0A9396' }} />
                                                                {t('loanStatus.daysRemaining')}
                                                            </div>
                                                            <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>
                                                                {(() => {
                                                                    if (!loan.due_date) return 'N/A';
                                                                    const due = new Date(loan.due_date);
                                                                    const now = new Date();
                                                                    return Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ height: 10, background: darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: 999, marginBottom: 16 }}>
                                                        <div style={{
                                                            width: `${Math.min(100, loan.paid_percentage)}%`,
                                                            height: '100%',
                                                            background: loan.paid_percentage >= 100 ? '#10b981' : 'linear-gradient(90deg, #0A9396, #059669)',
                                                            borderRadius: 999,
                                                            transition: 'width 0.5s ease'
                                                        }} />
                                                    </div>
                                                </div>

                                                {/* Extension UI */}
                                                {extendingLoan === loan.id ? (
                                                    <div style={{ marginTop: 16, padding: 16, background: darkMode ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)', borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                                                        <div style={{ fontWeight: 600, marginBottom: 12, color: darkMode ? '#f1f5f9' : '#1e293b' }}>{t('loanStatus.extensionRequest')}</div>
                                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                            <input
                                                                type="number"
                                                                value={extensionDays}
                                                                onChange={(e) => setExtensionDays(e.target.value)}
                                                                placeholder={t('loanStatus.extensionDays')}
                                                                min="1"
                                                                max="365"
                                                                style={{ flex: 1, padding: 10, borderRadius: 8, border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' }}
                                                            />
                                                            <LoadingButton
                                                                onClick={() => handleExtension(loan.id)}
                                                                variant="primary"
                                                                style={{ background: '#0A9396', border: 'none', whiteSpace: 'nowrap' }}
                                                            >
                                                                {t('loanStatus.extend')}
                                                            </LoadingButton>
                                                            <button
                                                                onClick={() => { setExtendingLoan(null); setExtensionResult(null); }}
                                                                style={{ padding: '10px 16px', background: 'transparent', border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer', color: darkMode ? '#f1f5f9' : '#1e293b' }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                                        <LoadingButton
                                                            onClick={() => { setExtendingLoan(loan.id); setExtensionResult(null); }}
                                                            variant="ghost"
                                                            size="sm"
                                                            style={{ border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', color: darkMode ? '#f1f5f9' : '#1e293b' }}
                                                        >
                                                            <RotateCcw size={14} style={{ marginRight: 6 }} />
                                                            {t('loanStatus.extend')}
                                                        </LoadingButton>
                                                    </div>
                                                )}

                                                {extensionResult && extensionResult.loanId === loan.id && (
                                                    <div style={{
                                                        marginTop: 12,
                                                        padding: 12,
                                                        borderRadius: 8,
                                                        background: extensionResult.approved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                        color: extensionResult.approved ? '#10b981' : '#ef4444',
                                                        fontWeight: 600,
                                                        fontSize: 14
                                                    }}>
                                                        {extensionResult.approved ? t('loanStatus.extensionApproved') : t('loanStatus.extensionDenied')}
                                                        {extensionResult.reason && <div style={{ fontWeight: 400, marginTop: 4, color: darkMode ? '#94a3b8' : '#64748b' }}>{extensionResult.reason}</div>}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </SectionCard>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
        </>
    );
};

export default LoanStatus;
