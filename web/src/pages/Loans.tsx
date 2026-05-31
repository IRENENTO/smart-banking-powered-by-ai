import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calculator, Shield, Clock, CheckCircle,
  Calendar, DollarSign, Brain, TrendingUp, AlertTriangle,
  FileCheck, BarChart3, Eye, Zap, Sparkles,
  Wallet, List, Info as InfoIcon, ClipboardCheck,
  ThumbsUp, CreditCard
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import PinModal from '../components/PinModal';
import { loanService, profileService } from '../services/api';
import * as aiEngine from '../services/aiService';
import { useBanking } from '../context/BankingContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { calculateSimpleInterest, calculateCompoundEMI, generateYearlyBreakdown, SimpleInterestResult, CompoundInterestResult } from '../utils/interestCalculations';

const Loans: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const toast = useToast();
  const { addNotification } = useNotifications();
  const { balance, deposit, loading: bankingLoading, refresh: refreshBankData } = useBanking();

  const eligibilityState = location.state as { eligibleAmount?: number; monthlyIncome?: string; existingDebt?: string } | null;

  const [activeTab, setActiveTab] = useState<'overview' | 'apply' | 'history' | 'info'>(eligibilityState?.eligibleAmount ? 'apply' : 'overview');
  const [loans, setLoans] = useState<any[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [aiEngineOnline, setAiEngineOnline] = useState(false);

  const [aiPrediction, setAiPrediction] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionForm, setPredictionForm] = useState({ income: 300000, expenses: 150000, amount: 1000000, credit_score: 650, duration: 12, interestRate: 10 });

  const [selectedLoanType, setSelectedLoanType] = useState<'simple' | 'compound' | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    duration: '12',
    interestRate: '10',
    monthlyIncome: '',
    existingDebt: '',
    sector: 'Employee'
  });
  const [applyPredicting, setApplyPredicting] = useState(false);
  const [applyPrediction, setApplyPrediction] = useState<any>(null);

  const [extendingLoan, setExtendingLoan] = useState<string | null>(null);
  const [extensionDays, setExtensionDays] = useState('');
  const [extensionResult, setExtensionResult] = useState<{ loanId: string; approved: boolean; reason?: string } | null>(null);
  const [pinAction, setPinAction] = useState<{ cb: () => void } | null>(null);

  const [demoLoans, setDemoLoans] = useState<any[]>([
    {
      id: 'demo-1',
      amount: 1500000,
      purpose: 'Business Expansion - Retail Store',
      duration: 12,
      status: 'active',
      risk_score: 22,
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      monthly_payment: 138000,
      interest_rate: 8.5,
      progress: 45,
      aiDecision: { riskScore: 22, confidence: '78%', explanation: 'Strong business plan with consistent revenue history.' },
      paid_amount: 675000,
      total_amount: 1656000,
      paid_percentage: 41,
      due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      next_deduction_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      id: 'demo-2',
      amount: 500000,
      purpose: 'School Fees - University Tuition',
      duration: 6,
      status: 'pending',
      risk_score: 15,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      monthly_payment: 88000,
      interest_rate: 7.5,
      progress: 0,
      aiDecision: { riskScore: 15, confidence: '85%', explanation: 'Low risk applicant with stable employment history.' },
      paid_amount: 0,
      total_amount: 537500,
      paid_percentage: 0,
    },
    {
      id: 'demo-3',
      amount: 3000000,
      purpose: 'Home Renovation',
      duration: 24,
      status: 'approved',
      risk_score: 35,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      monthly_payment: 145000,
      interest_rate: 9.0,
      progress: 5,
      aiDecision: { riskScore: 35, confidence: '65%', explanation: 'Moderate risk — collateral confirmed, verifying income documents.' },
      paid_amount: 145000,
      total_amount: 3480000,
      paid_percentage: 4,
      due_date: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(),
      next_deduction_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      id: 'demo-4',
      amount: 200000,
      purpose: 'Emergency Medical Expenses',
      duration: 3,
      status: 'repaid',
      risk_score: 10,
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      monthly_payment: 70000,
      interest_rate: 6.5,
      progress: 100,
      aiDecision: { riskScore: 10, confidence: '92%', explanation: 'Fully repaid — excellent borrower.' },
      paid_amount: 210000,
      total_amount: 210000,
      paid_percentage: 100,
      due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      next_deduction_date: null,
    },
    {
      id: 'demo-5',
      amount: 800000,
      purpose: 'Agricultural Equipment Purchase',
      duration: 12,
      status: 'active',
      risk_score: 28,
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      monthly_payment: 74000,
      interest_rate: 8.0,
      progress: 60,
      aiDecision: { riskScore: 28, confidence: '72%', explanation: 'Agricultural sector performing well — manageable risk.' },
      paid_amount: 444000,
      total_amount: 864000,
      paid_percentage: 51,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      next_deduction_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      id: 'demo-6',
      amount: 100000,
      purpose: 'Personal Loan - Debt Consolidation',
      duration: 6,
      status: 'pending',
      risk_score: 40,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      monthly_payment: 18000,
      interest_rate: 10.0,
      progress: 0,
      aiDecision: { riskScore: 40, confidence: '60%', explanation: 'Higher debt-to-income ratio — additional review required.' },
      paid_amount: 0,
      total_amount: 108000,
      paid_percentage: 0,
    },
  ]);

  const bgStyle = isDark ? '#0B1F3A' : '#f8fafc';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? 'rgba(15,23,42,0.6)' : 'white';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
    background: isDark ? '#0f172a' : 'white', color: textColor, fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: mutedColor, marginBottom: 6,
  };

  useEffect(() => {
    if (eligibilityState?.eligibleAmount) {
      setFormData(prev => ({
        ...prev,
        amount: String(eligibilityState.eligibleAmount!),
        monthlyIncome: eligibilityState.monthlyIncome || '',
        existingDebt: eligibilityState.existingDebt || '',
      }));
      window.history.replaceState({}, '');
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingLoans(true);
      try {
        const [profileRes, loansRes] = await Promise.all([
          profileService.getProfile().catch(() => null),
          loanService.getLoans().catch(() => null),
        ]);
        if (profileRes) setProfileCompleted(profileRes.data.user?.profile_completed || false);
        if (loansRes?.data) {
          const serverLoans = loansRes.data.loans || [];
          if (serverLoans.length > 0) {
            setLoans(serverLoans);
            return;
          }
        }
        setLoans(demoLoans);
      } catch {
        setLoans(demoLoans);
      } finally {
        setLoadingLoans(false);
      }
    };
    checkAIStatus();
    loadInitialData();
  }, []);

  const checkAIStatus = async () => {
    try {
      const result = await aiEngine.getModelStatus();
      const data = result?.data;
      if (data && typeof data === 'object') {
        setAiEngineOnline(data.status !== 'offline' && data.success !== false);
      } else {
        setAiEngineOnline(false);
      }
    } catch {
      setAiEngineOnline(false);
    }
  };

  const computeFallbackPrediction = (income: number, expenses: number, amount: number, creditScore?: number) => {
    const dti = income > 0 ? Math.round((expenses / income) * 100) : 50;
    const riskScore = Math.min(95, Math.max(5, Math.round(
      dti * 0.5 +
      (amount / Math.max(income, 1)) * 0.2 +
      (creditScore ? (850 - creditScore) * 0.1 : 15)
    )));
    const approved = riskScore < 65;
    return {
      approved,
      risk_score: riskScore,
      approval_probability: Math.max(5, Math.min(98, 100 - riskScore)),
      default_probability: Math.round(riskScore * 0.4),
      insight: approved
        ? 'Your financial profile looks good. The AI recommends proceeding with the application.'
        : 'Your debt-to-income ratio is high. Consider reducing expenses or increasing income before applying.',
      ai_powered: false,
    };
  };

  const extractPredictionData = (response: any, fallback: () => any) => {
    try {
      const data = response?.data;
      if (data && typeof data === 'object' && ('approved' in data || 'risk_score' in data)) {
        return data;
      }
    } catch {}
    return fallback();
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      setPredicting(true);
      try {
        const result = await aiEngine.predictLoan({
          income: predictionForm.income,
          expenses: predictionForm.expenses,
          loan_amount: predictionForm.amount,
          credit_score: predictionForm.credit_score,
        });
        setAiPrediction(extractPredictionData(result, () => computeFallbackPrediction(
          predictionForm.income, predictionForm.expenses, predictionForm.amount, predictionForm.credit_score
        )));
      } catch {
        setAiPrediction(computeFallbackPrediction(
          predictionForm.income, predictionForm.expenses, predictionForm.amount, predictionForm.credit_score
        ));
      } finally {
        setPredicting(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [predictionForm.income, predictionForm.expenses, predictionForm.amount, predictionForm.credit_score]);

  const handleApplyFromPrediction = () => {
    if (!aiPrediction?.approved) return;
    setFormData({
      amount: String(predictionForm.amount),
      purpose: '',
      duration: String(predictionForm.duration),
      interestRate: String(predictionForm.interestRate),
      monthlyIncome: String(predictionForm.income),
      existingDebt: String(predictionForm.expenses),
      sector: 'Employee',
    });
    setActiveTab('apply');
    setAiPrediction(null);
    toast.success('Form pre-filled from AI prediction. Complete the assessment below.');
  };

  useEffect(() => {
    if (!formData.amount || !formData.monthlyIncome) {
      setApplyPrediction(null);
      setSelectedLoanType(null);
      return;
    }
    const timer = setTimeout(async () => {
      setApplyPredicting(true);
      setSelectedLoanType(null);
      try {
        const result = await aiEngine.predictLoan({
          loan_amount: Number(formData.amount),
          income: Number(formData.monthlyIncome),
          expenses: Number(formData.existingDebt) || 0,
        });
        setApplyPrediction(extractPredictionData(result, () => computeFallbackPrediction(
          Number(formData.monthlyIncome), Number(formData.existingDebt) || 0, Number(formData.amount)
        )));
      } catch {
        setApplyPrediction(computeFallbackPrediction(
          Number(formData.monthlyIncome), Number(formData.existingDebt) || 0, Number(formData.amount)
        ));
      } finally {
        setApplyPredicting(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.amount, formData.monthlyIncome, formData.existingDebt]);

  const calculateRemainingDays = (createdAt: string, durationMonths: number) => {
    const start = new Date(createdAt);
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);
    const diff = end.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleDemoApprove = async (loanId: string) => {
    const loan = demoLoans.find(l => l.id === loanId);
    if (!loan || loan.status !== 'pending') return;
    try {
      await deposit(loan.amount, `Loan disbursement: ${loan.purpose}`);
      setDemoLoans(prev => prev.map(l =>
        l.id === loanId ? {
          ...l, status: 'approved', progress: 5, created_at: new Date().toISOString(),
          aiDecision: { riskScore: 25, confidence: '80%', explanation: 'Application reviewed and approved — funds disbursed.' },
          paid_amount: 0, total_amount: Math.round(l.amount * (1 + (l.interest_rate || 10) / 100)),
          paid_percentage: 0, due_date: new Date(Date.now() + l.duration * 30 * 24 * 60 * 60 * 1000).toISOString(),
          next_deduction_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        } : l
      ));
      setLoans(prev => prev.map(l =>
        l.id === loanId ? { ...l, status: 'approved', progress: 5 } : l
      ));
      toast.success(`Loan approved! RWF ${loan.amount.toLocaleString()} added to balance`);
      addNotification({
        title: 'Loan Approved',
        message: `Your loan of RWF ${loan.amount.toLocaleString()} for ${loan.purpose} has been approved and disbursed.`,
        type: 'success',
        link: '/loans',
      });
      await refreshBankData();
    } catch (err) {
      toast.error('Failed to disburse loan. API may be offline.');
    }
  };

  const handleExtension = async (loanId: string) => {
    if (!extensionDays || parseInt(extensionDays) < 1) return;
    try {
      const response = await loanService.requestExtension(Number(loanId), parseInt(extensionDays)).catch(() => null);
      if (response?.data?.data) {
        const approved = response.data.data.approved || false;
        setExtensionResult({ loanId, approved, reason: response.data.data.reason });
        toast.success(approved ? 'Extension approved!' : 'Extension denied');
      } else {
        setExtensionResult({ loanId, approved: true, reason: 'Demo mode — extension simulated.' });
        toast.success(`Loan extended by ${extensionDays} days (demo)`);
      }
    } catch {
      setExtensionResult({ loanId, approved: true, reason: 'Demo mode — extension simulated.' });
      toast.success(`Loan extended by ${extensionDays} days (demo)`);
    }
    setExtendingLoan(null);
    setExtensionDays('');
  };

  const tabs: { key: 'overview' | 'apply' | 'history' | 'info'; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'apply', label: 'Apply' },
    { key: 'history', label: 'History' },
    { key: 'info', label: 'Info' },
  ];

  const renderTabIcon = (key: string) => {
    switch (key) {
      case 'overview': return <TrendingUp size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />;
      case 'apply': return <ClipboardCheck size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />;
      case 'history': return <List size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />;
      case 'info': return <InfoIcon size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />;
      default: return null;
    }
  };

  const renderStatIcon = (label: string, size: number, color: string) => {
    const iconProps = { size, color };
    switch (label) {
      case 'Active Loans': return <CreditCard {...iconProps} />;
      case 'Total Borrowed': return <DollarSign {...iconProps} />;
      case 'Pending Approval': return <Clock {...iconProps} />;
      case 'Current Balance': return <Wallet {...iconProps} />;
      default: return null;
    }
  };

  const renderStepIcon = (title: string) => {
    switch (title) {
      case 'Application': return <FileCheck size={24} color="white" />;
      case 'AI Approval': return <Brain size={24} color="white" />;
      case 'Disbursement': return <Calendar size={24} color="white" />;
      case 'Loan Tracking': return <Eye size={24} color="white" />;
      default: return null;
    }
  };

  const statCards = [
    { label: 'Active Loans', value: demoLoans.filter(l => l.status === 'active' || l.status === 'approved').length, color: '#0A9396', bg: isDark ? 'rgba(10,147,150,0.15)' : 'rgba(10,147,150,0.1)' },
    { label: 'Total Borrowed', value: `RWF ${demoLoans.reduce((s, l) => s + l.amount, 0).toLocaleString()}`, color: '#10b981', bg: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)' },
    { label: 'Pending Approval', value: demoLoans.filter(l => l.status === 'pending').length, color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)' },
    { label: 'Current Balance', value: balance !== null ? `RWF ${balance.toLocaleString()}` : '---', color: '#8b5cf6', bg: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)' },
  ];

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb', label: 'Pending' },
    approved: { color: '#3b82f6', bg: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff', label: 'Approved' },
    active: { color: '#10b981', bg: isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4', label: 'Active' },
    repaid: { color: '#64748b', bg: isDark ? 'rgba(100,116,139,0.15)' : '#f1f5f9', label: 'Repaid' },
    declined: { color: '#ef4444', bg: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2', label: 'Declined' },
  };

  const steps = [
    { title: 'Application', description: 'Fill out a simple loan application with your basic financial information.' },
    { title: 'AI Approval', description: 'Our AI analyzes your profile and provides instant approval decisions.' },
    { title: 'Disbursement', description: 'Approved funds are disbursed directly to your account within minutes.' },
    { title: 'Loan Tracking', description: 'Monitor your loan status and repayment schedule in real-time.' },
  ];

  const loanTypes = [
    { type: 'Personal Loans', amount: '10,000 - 5,000,000 RWF', rate: 'From 8.5% p.a.', term: '3 - 36 months' },
    { type: 'Business Loans', amount: '100,000 - 100,000,000 RWF', rate: 'Competitive rates', term: 'Flexible terms' },
    { type: 'Emergency Loans', amount: '5,000 - 1,000,000 RWF', rate: 'Premium rates', term: '1 - 12 months' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar authenticated={!!localStorage.getItem('token')} />
      <div style={{ flex: 1, padding: 24, background: bgStyle }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ color: textColor, margin: 0 }}>Loans</h1>
              <p style={{ color: mutedColor, marginTop: 8 }}>
                Smart borrowing with AI-powered insights
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: aiEngineOnline ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: aiEngineOnline ? '#10b981' : '#f59e0b',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Brain size={14} />
                AI Engine: {aiEngineOnline ? 'Online' : 'Fallback'}
              </div>
              {tabs.map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      fontWeight: 600, fontSize: 13, textTransform: 'capitalize',
                      background: isActive ? 'linear-gradient(135deg, #0A9396, #4ECDC4)' : isDark ? '#0f172a' : 'white',
                      color: isActive ? 'white' : mutedColor,
                      boxShadow: isActive ? '0 4px 15px rgba(10,147,150,0.3)' : 'none',
                      transition: 'all 0.3s',
                    }}
                  >
                    {renderTabIcon(tab.key)}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'linear-gradient(135deg, #0A9396, #059669)', color: 'white',
                  padding: '30px', borderRadius: 16, marginBottom: 24,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h2 style={{ margin: 0 }}>Quick & Fair Loans</h2>
                    <p style={{ lineHeight: 1.8, fontSize: 15, maxWidth: 600, marginTop: 8, opacity: 0.9 }}>
                      Apply for loans in minutes. Our AI evaluates your application fairly and transparently,
                      giving you instant decisions and competitive rates based on your actual financial situation.
                    </p>
                  </div>
                  <div style={{
                    padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: 'rgba(255,255,255,0.2)', color: 'white',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Sparkles size={14} />
                    AI Powered
                  </div>
                </div>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                {statCards.map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      style={{
                        padding: 20, borderRadius: 16, background: cardBg,
                        border: `1px solid ${borderColor}`, backdropFilter: 'blur(10px)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {renderStatIcon(stat.label, 20, stat.color)}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: mutedColor }}>{stat.label}</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: textColor }}>{stat.value}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>

              <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                <SectionCard title="AI Loan Prediction">
                  <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
                    <div>
                      <label style={labelStyle}>Monthly Income (RWF)</label>
                      <input type="text" inputMode="decimal" value={predictionForm.income} onChange={e => setPredictionForm(f => ({ ...f, income: e.target.value === '' ? 0 : Number(e.target.value) }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Monthly Expenses (RWF)</label>
                      <input type="text" inputMode="decimal" value={predictionForm.expenses} onChange={e => setPredictionForm(f => ({ ...f, expenses: e.target.value === '' ? 0 : Number(e.target.value) }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Loan Amount (RWF)</label>
                      <input type="text" inputMode="decimal" value={predictionForm.amount} onChange={e => setPredictionForm(f => ({ ...f, amount: e.target.value === '' ? 0 : Number(e.target.value) }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Credit Score</label>
                      <input type="number" value={predictionForm.credit_score} onChange={e => setPredictionForm(f => ({ ...f, credit_score: Number(e.target.value) }))} style={inputStyle} min={300} max={850} />
                    </div>
                    <div>
                      <label style={labelStyle}>Duration (months)</label>
                      <select value={predictionForm.duration} onChange={e => setPredictionForm(f => ({ ...f, duration: Number(e.target.value) }))} style={inputStyle}>
                        <option value={3}>3 months</option>
                        <option value={6}>6 months</option>
                        <option value={12}>12 months</option>
                        <option value={18}>18 months</option>
                        <option value={24}>24 months</option>
                        <option value={36}>36 months</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Interest Rate (% p.a.)</label>
                      <input type="number" step="0.1" min="0" max="50" value={predictionForm.interestRate} onChange={e => setPredictionForm(f => ({ ...f, interestRate: Number(e.target.value) }))} style={inputStyle} />
                    </div>
                    {predicting && <div style={{ fontSize: 12, color: mutedColor, textAlign: 'center' }}>AI analyzing...</div>}
                  </div>
                </SectionCard>

                <div>
                  {aiPrediction && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: 16 }}>
                      <SectionCard title="AI Result">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                          <div style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                            <CheckCircle size={20} color={aiPrediction.approved ? '#10b981' : '#ef4444'} style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Status</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: aiPrediction.approved ? '#10b981' : '#ef4444' }}>{aiPrediction.approved ? 'APPROVED' : 'DECLINED'}</div>
                          </div>
                          <div style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', border: '1px solid rgba(59,130,246,0.2)', textAlign: 'center' }}>
                            <Shield size={20} color={aiPrediction.risk_score >= 70 ? '#ef4444' : aiPrediction.risk_score >= 40 ? '#f59e0b' : '#10b981'} style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Risk Score</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: aiPrediction.risk_score >= 70 ? '#ef4444' : aiPrediction.risk_score >= 40 ? '#f59e0b' : '#10b981' }}>{aiPrediction.risk_score || 'N/A'}/100</div>
                          </div>
                          <div style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb', border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center' }}>
                            <TrendingUp size={20} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Approval Probability</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{aiPrediction.approval_probability || '--'}%</div>
                          </div>
                          <div style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
                            <AlertTriangle size={20} color="#ef4444" style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Default Probability</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{aiPrediction.default_probability || '--'}%</div>
                          </div>
                        </div>
                        {aiPrediction.insight && (
                          <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: isDark ? 'rgba(10,147,150,0.08)' : '#ecfeff', fontSize: 13, color: isDark ? '#7dd3fc' : '#0f766e' }}>
                            <Zap size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            {aiPrediction.insight}
                          </div>
                        )}
                        {predictionForm.amount > 0 && (() => {
                          const p = predictionForm.amount;
                          const r = predictionForm.interestRate || 10;
                          const n = predictionForm.duration || 12;
                          const simple = calculateSimpleInterest(p, r, n);
                          const compound = calculateCompoundEMI(p, r, n);
                          const yearly = generateYearlyBreakdown(p, r, n);
                          return (
                            <div style={{ marginTop: 16, borderTop: `1px solid ${borderColor}`, paddingTop: 16 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <Calculator size={16} color="#0A9396" />
                                <span style={{ fontWeight: 700, fontSize: 15, color: textColor }}>Repayment Calculator</span>
                              </div>
                              <div style={{ fontSize: 12, color: mutedColor, marginBottom: 10 }}>
                                Rate: <strong>{r}% p.a.</strong> &middot; Term: <strong>{n} months</strong>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ padding: 14, borderRadius: 12, background: isDark ? 'rgba(10,147,150,0.08)' : '#f0fdfa', border: '1px solid rgba(10,147,150,0.2)' }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0A9396', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simple Interest</div>
                                  <div style={{ display: 'grid', gap: 3, fontSize: 13 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: mutedColor }}>Monthly</span><span style={{ fontWeight: 700, color: textColor }}>RWF {simple.monthlyPayment.toLocaleString()}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: mutedColor }}>Total Interest</span><span style={{ fontWeight: 700, color: '#ef4444' }}>RWF {simple.totalInterest.toLocaleString()}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: mutedColor }}>Total Repayment</span><span style={{ fontWeight: 700, color: textColor }}>RWF {simple.totalAmount.toLocaleString()}</span></div>
                                  </div>
                                </div>
                                <div style={{ padding: 14, borderRadius: 12, background: isDark ? 'rgba(139,92,246,0.08)' : '#f5f3ff', border: '1px solid rgba(139,92,246,0.2)' }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Compound (EMI)</div>
                                  <div style={{ display: 'grid', gap: 3, fontSize: 13 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: mutedColor }}>Monthly</span><span style={{ fontWeight: 700, color: textColor }}>RWF {compound.emi.toLocaleString()}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: mutedColor }}>Total Interest</span><span style={{ fontWeight: 700, color: '#ef4444' }}>RWF {compound.totalInterest.toLocaleString()}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: mutedColor }}>Total Repayment</span><span style={{ fontWeight: 700, color: textColor }}>RWF {compound.totalAmount.toLocaleString()}</span></div>
                                  </div>
                                </div>
                              </div>
                              {yearly.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: mutedColor, marginBottom: 8 }}>Yearly Breakdown (EMI)</div>
                                  <div style={{ display: 'grid', gap: 2 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: '6px 10px', fontSize: 11, fontWeight: 700, color: mutedColor, borderBottom: `1px solid ${borderColor}` }}>
                                      <span>Year</span><span>Payments</span><span>Interest</span><span>Principal</span><span>Balance</span>
                                    </div>
                                    {yearly.map(row => (
                                      <div key={row.year} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: '6px 10px', fontSize: 12, color: textColor, borderBottom: `1px solid ${borderColor}` }}>
                                        <span>{row.year}</span>
                                        <span>RWF {row.totalPaid.toLocaleString()}</span>
                                        <span style={{ color: '#ef4444' }}>RWF {row.interestPaid.toLocaleString()}</span>
                                        <span style={{ color: '#10b981' }}>RWF {row.principalPaid.toLocaleString()}</span>
                                        <span>RWF {row.remainingBalance.toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        <div style={{ marginTop: 8, fontSize: 11, color: mutedColor, textAlign: 'right' }}>
                          {aiPrediction.ai_powered ? 'AI Powered' : 'Standard Analysis'}
                        </div>
                        {aiPrediction.approved && (() => {
                          const p = predictionForm.amount;
                          return (
                          <button onClick={handleApplyFromPrediction}
                            style={{
                              marginTop: 16, width: '100%', padding: '14px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
                              background: 'linear-gradient(135deg, #0A9396, #059669)',
                              color: 'white', boxShadow: '0 6px 24px rgba(10,147,150,0.35)',
                              transition: 'all 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                              <ClipboardCheck size={18} />
                              <span style={{ fontWeight: 700, fontSize: 15 }}>Apply for This Loan</span>
                            </div>
                            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8, textAlign: 'center' }}>
                              RWF {p.toLocaleString()} &middot; Choose loan type &middot; AI assessment
                            </div>
                          </button>
                          );
                        })()}
                        {!aiPrediction.approved && (
                          <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                            This application does not meet our approval criteria at this time.
                          </div>
                        )}
                      </SectionCard>

                      <SectionCard title="Credit Analysis">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
                          <div style={{ width: '100%', height: 160 }}>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                              <PieChart>
                                <Pie data={[
                                  { name: 'Default Prob', value: aiPrediction.default_probability || 25 },
                                  { name: 'Safe', value: 100 - (aiPrediction.default_probability || 25) },
                                ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={40}>
                                  <Cell fill="#ef4444" />
                                  <Cell fill={isDark ? '#1e293b' : '#e2e8f0'} />
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: isDark ? '#0f172a' : '#f8fafc' }}>
                              <span style={{ fontSize: 13, color: mutedColor }}>Income</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: textColor }}>RWF {predictionForm.income.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: isDark ? '#0f172a' : '#f8fafc' }}>
                              <span style={{ fontSize: 13, color: mutedColor }}>Debt/Income</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: textColor }}>{Math.round((predictionForm.expenses / predictionForm.income) * 100)}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: isDark ? '#0f172a' : '#f8fafc' }}>
                              <span style={{ fontSize: 13, color: mutedColor }}>Credit Score</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#0A9396' }}>{predictionForm.credit_score}</span>
                            </div>
                          </div>
                        </div>
                      </SectionCard>
                    </motion.div>
                  )}
                  {!aiPrediction && (
                    <SectionCard title="AI Loan Advisor">
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: mutedColor }}>
                        <Brain size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                        <div style={{ fontWeight: 600, marginBottom: 8, color: textColor }}>Enter your details to get started</div>
                        <div style={{ fontSize: 13 }}>AI will analyze your financial profile and provide instant loan approval predictions.</div>
                      </div>
                    </SectionCard>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'apply' && (
            <>
              <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
              <SectionCard title="Apply for a Loan">

                <div style={{ display: 'grid', gap: 16, marginTop: 8 }}>
                    <div>
                      <label style={labelStyle}>Loan Amount (RWF)</label>
                      <input
                        type="text" inputMode="decimal" placeholder="e.g. 500000"
                        value={formData.amount}
                        onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Purpose</label>
                      <select
                        value={formData.purpose}
                        onChange={e => setFormData(f => ({ ...f, purpose: e.target.value }))}
                        style={inputStyle}
                      >
                        <option value="">Select purpose...</option>
                        <option value="Business Expansion">Business Expansion</option>
                        <option value="Education">Education</option>
                        <option value="Home Renovation">Home Renovation</option>
                        <option value="Medical Emergency">Medical Emergency</option>
                        <option value="Debt Consolidation">Debt Consolidation</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Personal">Personal</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Duration (months)</label>
                      <select
                        value={formData.duration}
                        onChange={e => setFormData(f => ({ ...f, duration: e.target.value }))}
                        style={inputStyle}
                      >
                        <option value="3">3 months</option>
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                        <option value="18">18 months</option>
                        <option value="24">24 months</option>
                        <option value="36">36 months</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Interest Rate (% p.a.)</label>
                      <input
                        type="number" step="0.1" min="0" max="50"
                        value={formData.interestRate}
                        onChange={e => setFormData(f => ({ ...f, interestRate: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Monthly Income (RWF)</label>
                      <input
                        type="text" inputMode="decimal" placeholder="e.g. 300000"
                        value={formData.monthlyIncome}
                        onChange={e => setFormData(f => ({ ...f, monthlyIncome: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Existing Debt (RWF)</label>
                      <input
                        type="text" inputMode="decimal" placeholder="e.g. 50000"
                        value={formData.existingDebt}
                        onChange={e => setFormData(f => ({ ...f, existingDebt: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Employment Sector</label>
                      <select
                        value={formData.sector}
                        onChange={e => setFormData(f => ({ ...f, sector: e.target.value }))}
                        style={inputStyle}
                      >
                        <option value="Employee">Employee</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Business Owner">Business Owner</option>
                        <option value="Farmer">Farmer</option>
                        <option value="Student">Student</option>
                      </select>
                    </div>
                  </div>
              </SectionCard>

              <div>
                  {applyPrediction && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <SectionCard title="Live AI Assessment">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                        <div style={{ padding: 16, borderRadius: 14, background: applyPrediction.approved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', textAlign: 'center' }}>
                          <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Decision</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: applyPrediction.approved ? '#10b981' : '#ef4444' }}>
                            {applyPrediction.approved ? 'APPROVED' : 'DECLINED'}
                          </div>
                        </div>
                        <div style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', textAlign: 'center' }}>
                          <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Risk Score</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: applyPrediction.risk_score >= 70 ? '#ef4444' : applyPrediction.risk_score >= 40 ? '#f59e0b' : '#10b981' }}>
                            {applyPrediction.risk_score || '--'}/100
                          </div>
                        </div>
                      </div>
                      {applyPrediction.insight && (
                        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: isDark ? 'rgba(10,147,150,0.08)' : '#ecfeff', fontSize: 13, color: isDark ? '#7dd3fc' : '#0f766e' }}>
                          <Zap size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                          {applyPrediction.insight}
                        </div>
                      )}
                      {Number(formData.amount) > 0 && Number(formData.duration) > 0 && (() => {
                        const p = Number(formData.amount);
                        const r = Number(formData.interestRate) || 10;
                        const n = Number(formData.duration) || 12;
                        const simple = calculateSimpleInterest(p, r, n);
                        const compound = calculateCompoundEMI(p, r, n);
                        const yearly = generateYearlyBreakdown(p, r, n);
                        return (
                          <div style={{ marginTop: 16, borderTop: `1px solid ${borderColor}`, paddingTop: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                              <Calculator size={16} color="#0A9396" />
                              <span style={{ fontWeight: 700, fontSize: 15, color: textColor }}>Choose Your Loan Type</span>
                            </div>
                            <div style={{ fontSize: 12, color: mutedColor, marginBottom: 10 }}>
                              Rate: <strong>{r}% p.a.</strong> &middot; Term: <strong>{n} months</strong>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedLoanType('simple')}
                                style={{
                                  padding: 16, borderRadius: 14, cursor: 'pointer',
                                  background: selectedLoanType === 'simple'
                                    ? 'linear-gradient(135deg, rgba(10,147,150,0.15), rgba(78,205,196,0.15))'
                                    : isDark ? 'rgba(10,147,150,0.08)' : '#f0fdfa',
                                  border: `2px solid ${selectedLoanType === 'simple' ? '#0A9396' : 'rgba(10,147,150,0.2)'}`,
                                  textAlign: 'center', transition: 'all 0.2s',
                                }}
                              >
                                <Calculator size={24} color={selectedLoanType === 'simple' ? '#0A9396' : mutedColor} />
                                <div style={{ fontSize: 14, fontWeight: 700, color: selectedLoanType === 'simple' ? '#0A9396' : textColor, marginTop: 8 }}>Simple Interest</div>
                                <div style={{ display: 'grid', gap: 3, marginTop: 10, fontSize: 13 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                    <span style={{ color: mutedColor }}>Monthly</span>
                                    <span style={{ fontWeight: 700, color: textColor }}>RWF {simple.monthlyPayment.toLocaleString()}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderTop: `1px solid ${borderColor}` }}>
                                    <span style={{ color: mutedColor }}>Total Interest</span>
                                    <span style={{ fontWeight: 700, color: '#ef4444' }}>RWF {simple.totalInterest.toLocaleString()}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderTop: `1px solid ${borderColor}` }}>
                                    <span style={{ color: mutedColor }}>Total Repayment</span>
                                    <span style={{ fontWeight: 700, color: textColor }}>RWF {simple.totalAmount.toLocaleString()}</span>
                                  </div>
                                </div>
                                {selectedLoanType === 'simple' && (
                                  <div style={{ marginTop: 10, fontSize: 11, color: '#0A9396', fontWeight: 600 }}>
                                    Selected
                                  </div>
                                )}
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedLoanType('compound')}
                                style={{
                                  padding: 16, borderRadius: 14, cursor: 'pointer',
                                  background: selectedLoanType === 'compound'
                                    ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(167,139,250,0.15))'
                                    : isDark ? 'rgba(139,92,246,0.08)' : '#f5f3ff',
                                  border: `2px solid ${selectedLoanType === 'compound' ? '#8b5cf6' : 'rgba(139,92,246,0.2)'}`,
                                  textAlign: 'center', transition: 'all 0.2s',
                                }}
                              >
                                <TrendingUp size={24} color={selectedLoanType === 'compound' ? '#8b5cf6' : mutedColor} />
                                <div style={{ fontSize: 14, fontWeight: 700, color: selectedLoanType === 'compound' ? '#8b5cf6' : textColor, marginTop: 8 }}>Compound (EMI)</div>
                                <div style={{ display: 'grid', gap: 3, marginTop: 10, fontSize: 13 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                    <span style={{ color: mutedColor }}>Monthly</span>
                                    <span style={{ fontWeight: 700, color: textColor }}>RWF {compound.emi.toLocaleString()}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderTop: `1px solid ${borderColor}` }}>
                                    <span style={{ color: mutedColor }}>Total Interest</span>
                                    <span style={{ fontWeight: 700, color: '#ef4444' }}>RWF {compound.totalInterest.toLocaleString()}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderTop: `1px solid ${borderColor}` }}>
                                    <span style={{ color: mutedColor }}>Total Repayment</span>
                                    <span style={{ fontWeight: 700, color: textColor }}>RWF {compound.totalAmount.toLocaleString()}</span>
                                  </div>
                                </div>
                                {selectedLoanType === 'compound' && (
                                  <div style={{ marginTop: 10, fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>
                                    Selected
                                  </div>
                                )}
                              </motion.div>
                            </div>
                            {yearly.length > 0 && (
                              <div style={{ marginTop: 12 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: mutedColor, marginBottom: 8 }}>Yearly Breakdown (EMI)</div>
                                <div style={{ display: 'grid', gap: 2 }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: '6px 10px', fontSize: 11, fontWeight: 700, color: mutedColor, borderBottom: `1px solid ${borderColor}` }}>
                                    <span>Year</span><span>Payments</span><span>Interest</span><span>Principal</span><span>Balance</span>
                                  </div>
                                  {yearly.map(row => (
                                    <div key={row.year} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: '6px 10px', fontSize: 12, color: textColor, borderBottom: `1px solid ${borderColor}` }}>
                                      <span>{row.year}</span>
                                      <span>RWF {row.totalPaid.toLocaleString()}</span>
                                      <span style={{ color: '#ef4444' }}>RWF {row.interestPaid.toLocaleString()}</span>
                                      <span style={{ color: '#10b981' }}>RWF {row.principalPaid.toLocaleString()}</span>
                                      <span>RWF {row.remainingBalance.toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      {applyPrediction.approved && selectedLoanType && (() => {
                        const p = Number(formData.amount);
                        const r = Number(formData.interestRate) || 10;
                        const n = Number(formData.duration) || 12;
                        const simple = calculateSimpleInterest(p, r, n);
                        const compound = calculateCompoundEMI(p, r, n);
                        const calc = selectedLoanType === 'simple' ? simple : compound;
                        const monthlyLabel = selectedLoanType === 'simple' ? 'monthly (fixed)' : 'EMI';
                        return (
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <button
                            onClick={async () => {
                              const newLoan = {
                                id: 'demo-apply-' + Date.now(),
                                amount: p,
                                purpose: formData.purpose || 'Loan',
                                duration: n,
                                status: 'approved',
                                risk_score: applyPrediction?.risk_score || 30,
                                created_at: new Date().toISOString(),
                                monthly_payment: selectedLoanType === 'simple'
                                  ? calculateSimpleInterest(p, r, n).monthlyPayment
                                  : calculateCompoundEMI(p, r, n).emi,
                                interest_rate: r, progress: 0,
                                interest_type: selectedLoanType,
                                aiDecision: { riskScore: applyPrediction?.risk_score || 30, confidence: 'Auto-approved', explanation: applyPrediction?.insight || 'AI approved your loan.' },
                                paid_amount: 0, total_amount: selectedLoanType === 'simple'
                                  ? calculateSimpleInterest(p, r, n).totalAmount
                                  : calculateCompoundEMI(p, r, n).totalAmount,
                                paid_percentage: 0,
                                due_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                                next_deduction_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                              };
                              try {
                                await deposit(p, `Loan: ${formData.purpose}`);
                                setDemoLoans(prev => [...prev, newLoan]);
                                setLoans(prev => [...prev, newLoan]);
                                toast.success(`Loan of RWF ${p.toLocaleString()} approved and disbursed!`);
                                addNotification({
                                  title: 'Loan Approved',
                                  message: `Your ${selectedLoanType === 'simple' ? 'Simple Interest' : 'Compound EMI'} loan of RWF ${p.toLocaleString()} for ${formData.purpose || 'personal use'} has been approved and disbursed.`,
                                  type: 'success',
                                  link: '/loans',
                                });
                                await refreshBankData();
                                setApplyPrediction(null);
                                setSelectedLoanType(null);
                                setFormData({ amount: '', purpose: '', duration: '12', interestRate: '10', monthlyIncome: '', existingDebt: '', sector: 'Employee' });
                              } catch { toast.error('Failed to disburse.'); }
                            }}
                            style={{
                              width: '100%', padding: '16px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
                              background: 'linear-gradient(135deg, #0A9396, #059669)',
                              color: 'white', boxShadow: '0 6px 24px rgba(10,147,150,0.35)',
                              transition: 'all 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, opacity: 0.9 }}>
                                <ThumbsUp size={15} />
                                You receive
                              </span>
                              <span style={{ fontWeight: 800, fontSize: 20 }}>RWF {p.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                              <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>Total you repay</span>
                              <span style={{ fontWeight: 800, fontSize: 20 }}>RWF {calc.totalAmount.toLocaleString()}</span>
                            </div>
                            <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7, textAlign: 'center' }}>
                              {n} monthly payments × RWF {(selectedLoanType === 'simple' ? (calc as SimpleInterestResult).monthlyPayment : (calc as CompoundInterestResult).emi).toLocaleString()} at {r}% p.a. ({selectedLoanType === 'simple' ? 'Simple Interest' : 'Compound EMI'})
                            </div>
                          </button>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button
                              onClick={() => {
                                setFormData({ amount: '', purpose: '', duration: '12', interestRate: '10', monthlyIncome: '', existingDebt: '', sector: 'Employee' });
                                setApplyPrediction(null);
                                setSelectedLoanType(null);
                                toast.info('Loan application cancelled.');
                              }}
                              style={{
                                flex: 1, padding: '12px 24px', borderRadius: 10, cursor: 'pointer',
                                fontWeight: 600, fontSize: 13, background: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
                                color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
                              }}
                            >
                              <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                              Deny & Cancel
                            </button>
                          </div>
                        </div>
                        );
                      })()}
                      {applyPrediction.approved && !selectedLoanType && (
                        <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb', color: '#f59e0b', fontSize: 13, fontWeight: 500, textAlign: 'center' }}>
                          <ClipboardCheck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                          Select a loan type above to proceed
                        </div>
                      )}
                      {!applyPrediction.approved && (
                        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                          This application does not meet our approval criteria.
                        </div>
                      )}
                    </SectionCard>
                  </motion.div>
                )}
                {applyPredicting && (
                  <SectionCard title="Analyzing...">
                    <div style={{ textAlign: 'center', padding: 40, color: mutedColor }}>
                      <Brain size={32} style={{ margin: '0 auto 12px' }} />
                      <div>AI is evaluating your application...</div>
                    </div>
                  </SectionCard>
                )}
                {!applyPrediction && !applyPredicting && (
                  <SectionCard title="Live AI Assessment">
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: mutedColor }}>
                      <Calculator size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                      <div style={{ fontWeight: 600, marginBottom: 8, color: textColor }}>Fill in your details</div>
                      <div style={{ fontSize: 13 }}>AI will assess your application in real-time as you type.</div>
                    </div>
                  </SectionCard>
                )}
              </div>
            </div>
          </>
        )}

          {activeTab === 'history' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ color: textColor, margin: 0 }}>Loan History</h2>
                <span style={{ fontSize: 13, color: mutedColor }}>{loans.length} loan{loans.length !== 1 ? 's' : ''}</span>
              </div>
              {loadingLoans ? (
                <div style={{ textAlign: 'center', padding: 60, color: mutedColor }}>Loading loans...</div>
              ) : loans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: mutedColor }}>
                  <DollarSign size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <div style={{ fontWeight: 600, marginBottom: 8, color: textColor }}>No loans yet</div>
                  <div style={{ fontSize: 13 }}>Apply for your first loan to get started.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {loans.map((loan, idx) => {
                    const status = statusConfig[loan.status] || statusConfig.pending;
                    const remaining = loan.status === 'active' || loan.status === 'approved'
                      ? calculateRemainingDays(loan.created_at, loan.duration || 12)
                      : 0;
                    const totalMonths = loan.duration || 12;
                    const startDate = new Date(loan.created_at);
                    const endDate = new Date(startDate);
                    endDate.setMonth(endDate.getMonth() + totalMonths);
                    const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    const elapsedDays = totalDays - remaining;
                    const progressPct = loan.progress || (totalDays > 0 ? Math.min(100, Math.round((elapsedDays / totalDays) * 100)) : 0);

                    const ai = loan.aiDecision || {};
                    const riskScoreColor = (ai.riskScore ?? loan.risk_score) < 30 ? '#10b981' : (ai.riskScore ?? loan.risk_score) < 60 ? '#f59e0b' : '#ef4444';

                    return (
                      <motion.div
                        key={loan.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        style={{
                          padding: 24, borderRadius: 16, background: cardBg,
                          border: `1px solid ${borderColor}`, backdropFilter: 'blur(10px)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                              <h3 style={{ margin: 0, fontSize: 16, color: textColor }}>{loan.purpose || 'Loan'}</h3>
                              {loan.interest_type && (
                                <span style={{
                                  padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                                  background: loan.interest_type === 'simple' ? 'rgba(10,147,150,0.15)' : 'rgba(139,92,246,0.15)',
                                  color: loan.interest_type === 'simple' ? '#0A9396' : '#8b5cf6',
                                }}>
                                  {loan.interest_type === 'simple' ? 'Simple' : 'Compound'}
                                </span>
                              )}
                              <span style={{
                                padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                                background: status.bg, color: status.color,
                              }}>
                                {status.label}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                              <div>
                                <div style={{ fontSize: 12, color: mutedColor }}>Amount</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: textColor }}>RWF {Number(loan.amount).toLocaleString()}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 12, color: mutedColor }}>Duration</div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: textColor }}>{totalMonths} months</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 12, color: mutedColor }}>Risk Score</div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: riskScoreColor }}>{ai.riskScore ?? loan.risk_score ?? '--'}/100</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 12, color: mutedColor }}>Monthly Payment</div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: textColor }}>RWF {Number(loan.monthly_payment || Math.round(loan.amount / totalMonths)).toLocaleString()}</div>
                              </div>
                            </div>

                            {ai.explanation && (
                              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: isDark ? 'rgba(10,147,150,0.08)' : '#ecfeff', fontSize: 13, color: isDark ? '#7dd3fc' : '#0f766e', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <Shield size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                                <span>{ai.explanation}</span>
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', minWidth: 120 }}>
                            {(loan.status === 'active' || loan.status === 'approved') && (
                              <>
                                <div style={{ fontSize: 12, color: mutedColor }}>Remaining</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: remaining < 30 ? '#ef4444' : '#0A9396' }}>
                                  {remaining}d
                                </div>
                                <div style={{ fontSize: 11, color: mutedColor }}>of {totalDays} days</div>
                              </>
                            )}
                          </div>
                        </div>

                        {(loan.status === 'active' || loan.status === 'approved') && (
                          <div style={{ marginTop: 16, borderTop: `1px solid ${borderColor}`, paddingTop: 16 }}>
                            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
                              <div>
                                <div style={{ fontSize: 12, color: mutedColor }}>Paid</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>
                                  {loan.paid_percentage ?? progressPct}%
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: 12, color: mutedColor }}>Remaining Amount</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: textColor }}>
                                  RWF {((loan.total_amount || loan.amount) - (loan.paid_amount || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                              </div>
                              {loan.next_deduction_date && (
                                <div>
                                  <div style={{ fontSize: 12, color: mutedColor }}>Next Deduction</div>
                                  <div style={{ fontSize: 15, fontWeight: 600, color: textColor }}>{loan.next_deduction_date}</div>
                                </div>
                              )}
                              {ai.confidence && (
                                <div>
                                  <div style={{ fontSize: 12, color: mutedColor }}>AI Confidence</div>
                                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0A9396' }}>{ai.confidence}</div>
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: mutedColor, marginBottom: 6 }}>
                              <span>Repayment Progress</span>
                              <span>{loan.paid_percentage ?? progressPct}%</span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, background: isDark ? '#1e293b' : '#e2e8f0', overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }} animate={{ width: `${loan.paid_percentage ?? progressPct}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{
                                  height: '100%', borderRadius: 3,
                                  background: (loan.paid_percentage ?? progressPct) >= 100 ? '#10b981' : (loan.paid_percentage ?? progressPct) >= 50 ? '#0A9396' : '#f59e0b',
                                }}
                              />
                            </div>

                            {/* Extension UI */}
                            <div style={{ marginTop: 16 }}>
                              {extendingLoan === loan.id ? (
                                <div style={{ padding: 16, background: isDark ? 'rgba(30,41,59,0.8)' : '#f8fafc', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                                  <div style={{ fontWeight: 600, marginBottom: 12, color: textColor }}>Request Extension</div>
                                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <input
                                      type="number"
                                      value={extensionDays}
                                      onChange={e => setExtensionDays(e.target.value)}
                                      placeholder="Extra days"
                                      min="1" max="365"
                                      style={{
                                        flex: 1, minWidth: 120, padding: '10px 14px', borderRadius: 8,
                                        border: `1px solid ${borderColor}`, background: isDark ? '#0f172a' : 'white',
                                        color: textColor, outline: 'none', fontSize: 14,
                                      }}
                                    />
                                    <button
                                      onClick={() => handleExtension(loan.id)}
                                      disabled={!extensionDays || parseInt(extensionDays) < 1}
                                      style={{
                                        padding: '10px 20px', borderRadius: 8, border: 'none', cursor: (!extensionDays || parseInt(extensionDays) < 1) ? 'not-allowed' : 'pointer',
                                        fontWeight: 600, fontSize: 13,
                                        background: 'linear-gradient(135deg, #0A9396, #4ECDC4)', color: 'white',
                                        opacity: (!extensionDays || parseInt(extensionDays) < 1) ? 0.6 : 1,
                                      }}
                                    >
                                      <Calendar size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                                      Extend
                                    </button>
                                    <button
                                      onClick={() => { setExtendingLoan(null); setExtensionResult(null); }}
                                      style={{
                                        padding: '10px 16px', borderRadius: 8, border: `1px solid ${borderColor}`,
                                        background: 'transparent', cursor: 'pointer', color: mutedColor, fontSize: 13,
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                              <button
                                      onClick={() => { setExtendingLoan(loan.id); setExtensionResult(null); }}
                                  style={{
                                    padding: '8px 16px', borderRadius: 8, border: `1px solid ${borderColor}`,
                                    background: 'transparent', cursor: 'pointer', color: textColor, fontSize: 13,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                  }}
                                >
                                  <Calendar size={14} />
                                  Request Extension
                                </button>
                              )}

                              {extensionResult && extensionResult.loanId === loan.id && (
                                <div style={{
                                  marginTop: 12, padding: 12, borderRadius: 8,
                                  background: extensionResult.approved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                  color: extensionResult.approved ? '#10b981' : '#ef4444',
                                  fontWeight: 600, fontSize: 14,
                                }}>
                                  {extensionResult.approved ? 'Extension approved!' : 'Extension denied'}
                                  {extensionResult.reason && <div style={{ fontWeight: 400, marginTop: 4, color: mutedColor }}>{extensionResult.reason}</div>}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {loan.status === 'pending' && (
                          <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                            <button
                              onClick={() => handleDemoApprove(loan.id)}
                              style={{
                                padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                fontWeight: 600, fontSize: 13,
                                background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                                display: 'flex', alignItems: 'center', gap: 6,
                              }}
                            >
                              <ThumbsUp size={16} />
                              Demo: Approve & Disburse
                            </button>
                            <span style={{ fontSize: 12, color: mutedColor }}>
                              (Adds RWF {loan.amount.toLocaleString()} to balance)
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'linear-gradient(135deg, #0A9396, #059669)', color: 'white', padding: '30px', borderRadius: 16, marginBottom: 24 }}
              >
                <h2 style={{ margin: 0 }}>Everything you need to know about our loans</h2>
                <p style={{ lineHeight: 1.8, fontSize: 15, maxWidth: 600, marginTop: 8, opacity: 0.9 }}>
                  We offer flexible loan products designed to meet your financial needs.
                  Transparent terms, competitive rates, and AI-powered approvals.
                </p>
              </motion.div>

              <div style={{ marginBottom: 32 }}>
                <h2 style={{ color: textColor, marginBottom: 24 }}>How It Works</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
                  {steps.map((step, idx) => (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.08 }}
                        style={{
                          padding: '30px', borderRadius: 16, background: cardBg,
                          border: `1px solid ${borderColor}`, position: 'relative',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: -12, left: 20, width: 30, height: 30, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0A9396, #059669)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: 16,
                        }}>
                          {idx + 1}
                        </div>
                        <div style={{
                          width: 50, height: 50, borderRadius: 12,
                          background: 'linear-gradient(135deg, #0A9396, #059669)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 8,
                        }}>
                          {renderStepIcon(step.title)}
                        </div>
                        <h3 style={{ color: textColor, marginTop: 0, marginBottom: 12 }}>{step.title}</h3>
                        <p style={{ color: mutedColor, lineHeight: 1.6, marginBottom: 0, fontSize: 14 }}>{step.description}</p>
                      </motion.div>
                    ))}
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h2 style={{ color: textColor, marginBottom: 24 }}>Loan Types</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  {loanTypes.map((loan) => (
                    <motion.div
                      key={loan.type}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '25px', borderRadius: 16, background: cardBg,
                        border: `1px solid ${borderColor}`, backdropFilter: 'blur(10px)',
                      }}
                    >
                      <h4 style={{ color: '#0A9396', marginTop: 0, marginBottom: 16 }}>{loan.type}</h4>
                      <div style={{ display: 'grid', gap: 12, fontSize: 14, color: mutedColor }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Amount:</span>
                          <span style={{ fontWeight: 600, color: textColor }}>{loan.amount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Interest Rate:</span>
                          <span style={{ fontWeight: 600, color: textColor }}>{loan.rate}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Term:</span>
                          <span style={{ fontWeight: 600, color: textColor }}>{loan.term}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'linear-gradient(135deg, #0A9396, #059669)', color: 'white',
                  padding: '40px', borderRadius: 16,
                }}
              >
                <h2 style={{ marginTop: 0 }}>Why Choose AI Smart Banking for Loans?</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginTop: 20 }}>
                  {[
                    'Instant AI-powered approval decisions',
                    'Transparent pricing with no hidden fees',
                    'Fast fund disbursement',
                    'Flexible repayment schedules',
                    'Competitive interest rates',
                    'Easy online application process',
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                      <CheckCircle size={18} />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {pinAction && (
        <PinModal
          action="Confirm loan acceptance"
          onSuccess={() => { const cb = pinAction.cb; setPinAction(null); cb(); }}
          onCancel={() => setPinAction(null)}
        />
      )}
    </div>
  );
};

export default Loans;
