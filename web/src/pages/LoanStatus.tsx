import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calculator, FileText, TrendingUp, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { loanService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const LoanStatus: React.FC = () => {
    const [loans, setLoans] = useState<any[]>([]);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();
    const darkMode = theme === 'dark';

    // Loan request form state
    const [loanRequest, setLoanRequest] = useState({
        amount: '',
        purpose: '',
        duration: '',
        income: '',
        employment: '',
        collateral: '',
        description: ''
    });

    useEffect(() => {
        const loadLoans = async () => {
            setLoading(true);
            try {
                const response = await loanService.getLoans();
                setLoans(response.data.loans || []);
            } catch (err) {
                setLoans([]);
            } finally {
                setLoading(false);
            }
        };

        loadLoans();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setLoanRequest(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitLoan = async () => {
        setLoading(true);
        try {
            const response = await loanService.apply({
                amount: Number(loanRequest.amount),
                purpose: loanRequest.purpose,
                duration: Number(loanRequest.duration),
                monthlyIncome: Number(loanRequest.income),
                existingDebt: 0
            });

            const newLoan = response.data.loan;
            setLoans(prev => [newLoan, ...prev]);
            setLoanRequest({
                amount: '',
                purpose: '',
                duration: '',
                income: '',
                employment: '',
                collateral: '',
                description: ''
            });
            setShowRequestForm(false);
        } catch (err: any) {
            console.error('Loan submission failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                .loan-modal-scroll::-webkit-scrollbar {
                    display: none;
                }
                .loan-modal-scroll {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
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
                            onClick={() => setShowRequestForm(true)}
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
                                    </div>
                                </div>
                            </SectionCard>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Loan Request Modal */}
            <AnimatePresence>
                {showRequestForm && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRequestForm(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 999,
                                backdropFilter: 'blur(4px)'
                            }}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                                padding: '20px',
                                boxSizing: 'border-box'
                            }}
                        >
                            <div style={{
                                width: '100%',
                                maxWidth: '600px',
                                maxHeight: '90vh',
                                position: 'relative'
                            }}>
                                <SectionCard 
                                className="loan-modal-scroll"
                                style={{
                                background: darkMode 
                                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(51, 65, 85, 0.98))'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98))',
                                border: darkMode 
                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                    : '1px solid rgba(255, 255, 255, 0.5)',
                                width: '100%',
                                maxWidth: '600px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                padding: '24px',
                                margin: 0,
                                boxSizing: 'border-box'
                            }}>
                                {/* Modal Header */}
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: 24,
                                    paddingBottom: 16,
                                    borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #0A9396, #059669)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FileText size={20} style={{ color: 'white' }} />
                                        </div>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                                                Request New Loan
                                            </h2>
                                            <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                                                Fill in the details below
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowRequestForm(false)}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '8px',
                                            background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                            border: 'none',
                                            color: darkMode ? '#f1f5f9' : '#1e293b',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <X size={18} />
                                    </motion.button>
                                </div>

                                {/* Loan Request Form */}
                                <div style={{ 
                                    display: 'grid', 
                                    gap: 20,
                                    maxHeight: 'calc(85vh - 120px)',
                                    overflowY: 'auto',
                                    paddingRight: '8px'
                                }}>
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: 8, 
                                            fontSize: '14px', 
                                            fontWeight: 600,
                                            color: darkMode ? '#f1f5f9' : '#1e293b'
                                        }}>
                                            Loan Amount (RWF)
                                        </label>
                                        <input
                                            type="number"
                                            value={loanRequest.amount}
                                            onChange={(e) => handleInputChange('amount', e.target.value)}
                                            placeholder="Enter amount"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                                                borderRadius: '8px',
                                                background: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
                                                color: darkMode ? '#f1f5f9' : '#1e293b',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: 8, 
                                            fontSize: '14px', 
                                            fontWeight: 600,
                                            color: darkMode ? '#f1f5f9' : '#1e293b'
                                        }}>
                                            Loan Purpose
                                        </label>
                                        <select
                                            value={loanRequest.purpose}
                                            onChange={(e) => handleInputChange('purpose', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                                                borderRadius: '8px',
                                                background: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
                                                color: darkMode ? '#f1f5f9' : '#1e293b',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="">Select purpose</option>
                                            <option value="Business Expansion">Business Expansion</option>
                                            <option value="Education">Education</option>
                                            <option value="Home Purchase">Home Purchase</option>
                                            <option value="Vehicle Purchase">Vehicle Purchase</option>
                                            <option value="Medical Emergency">Medical Emergency</option>
                                            <option value="Debt Consolidation">Debt Consolidation</option>
                                            <option value="Personal">Personal</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: 8, 
                                            fontSize: '14px', 
                                            fontWeight: 600,
                                            color: darkMode ? '#f1f5f9' : '#1e293b'
                                        }}>
                                            Loan Duration (months)
                                        </label>
                                        <input
                                            type="number"
                                            value={loanRequest.duration}
                                            onChange={(e) => handleInputChange('duration', e.target.value)}
                                            placeholder="Enter duration in months"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                                                borderRadius: '8px',
                                                background: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
                                                color: darkMode ? '#f1f5f9' : '#1e293b',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: 8, 
                                            fontSize: '14px', 
                                            fontWeight: 600,
                                            color: darkMode ? '#f1f5f9' : '#1e293b'
                                        }}>
                                            Monthly Income (RWF)
                                        </label>
                                        <input
                                            type="number"
                                            value={loanRequest.income}
                                            onChange={(e) => handleInputChange('income', e.target.value)}
                                            placeholder="Enter monthly income"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                                                borderRadius: '8px',
                                                background: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
                                                color: darkMode ? '#f1f5f9' : '#1e293b',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: 8, 
                                            fontSize: '14px', 
                                            fontWeight: 600,
                                            color: darkMode ? '#f1f5f9' : '#1e293b'
                                        }}>
                                            Employment Status
                                        </label>
                                        <select
                                            value={loanRequest.employment}
                                            onChange={(e) => handleInputChange('employment', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                                                borderRadius: '8px',
                                                background: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
                                                color: darkMode ? '#f1f5f9' : '#1e293b',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="">Select status</option>
                                            <option value="Employed">Employed</option>
                                            <option value="Self-Employed">Self-Employed</option>
                                            <option value="Business Owner">Business Owner</option>
                                            <option value="Student">Student</option>
                                            <option value="Retired">Retired</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: 8, 
                                            fontSize: '14px', 
                                            fontWeight: 600,
                                            color: darkMode ? '#f1f5f9' : '#1e293b'
                                        }}>
                                            Collateral (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={loanRequest.collateral}
                                            onChange={(e) => handleInputChange('collateral', e.target.value)}
                                            placeholder="Describe any collateral"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                                                borderRadius: '8px',
                                                background: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
                                                color: darkMode ? '#f1f5f9' : '#1e293b',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: 8, 
                                            fontSize: '14px', 
                                            fontWeight: 600,
                                            color: darkMode ? '#f1f5f9' : '#1e293b'
                                        }}>
                                            Additional Information
                                        </label>
                                        <textarea
                                            value={loanRequest.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Provide any additional information about your loan request"
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                                                borderRadius: '8px',
                                                background: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
                                                color: darkMode ? '#f1f5f9' : '#1e293b',
                                                fontSize: '14px',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>

                                    </div>

                                {/* Sticky Submit Button */}
                                <div style={{
                                    position: 'sticky',
                                    bottom: 0,
                                    background: darkMode 
                                        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(51, 65, 85, 0.98))'
                                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98))',
                                    padding: '20px 0 0 0',
                                    marginTop: '20px',
                                    borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                                }}>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <LoadingButton
                                            onClick={handleSubmitLoan}
                                            loading={loading}
                                            variant="primary"
                                            size="lg"
                                            style={{
                                                flex: 1,
                                                background: 'linear-gradient(135deg, #0A9396, #059669)',
                                                border: 'none',
                                                boxShadow: '0 4px 15px rgba(10, 147, 150, 0.3)'
                                            }}
                                        >
                                            <CheckCircle size={20} />
                                            Submit Loan Request
                                        </LoadingButton>
                                        <LoadingButton
                                            onClick={() => setShowRequestForm(false)}
                                            variant="outline"
                                            size="lg"
                                            style={{
                                                flex: 1,
                                                borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            Cancel
                                        </LoadingButton>
                                    </div>
                                </div>
                            </SectionCard>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
        </>
    );
};

export default LoanStatus;
