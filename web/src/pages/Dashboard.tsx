import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, FileText, ArrowRight, Sparkles, Zap, Shield, TrendingUp, DollarSign, Activity, AlertTriangle, Brain, Smartphone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import SmartAlertBanner from '../components/SmartAlertBanner';
import LoanEligibility from '../components/LoanEligibility';
import QuickActions from '../components/QuickActions';
import AIFinancialAdvisor from '../components/AIFinancialAdvisor';
import MarketInsights from '../components/MarketInsights';
import IncomePattern from '../components/IncomePattern';
import InvestmentIdeas from '../components/InvestmentIdeas';
import RiskAlerts from '../components/RiskAlerts';
import { useBanking } from '../context/BankingContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { getGreeting } from '../utils/notifications';
import { accountService, aiService, marketService } from '../services/api';
import * as aiEngine from '../services/aiService';

const Dashboard: React.FC = () => {
  const [loanEligibilityOpen, setLoanEligibilityOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [accountDetails, setAccountDetails] = useState<{
    accountNumber: string;
    accountType: string;
    name: string;
    email: string;
    status: string;
  } | null>(() => {
    const parseJSON = (value: string | null) => {
      if (!value || value === 'undefined' || value === 'null') return null;
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    };
    const localUser = parseJSON(localStorage.getItem('user')) ?? {};
    return {
      accountNumber: localUser.account_number ?? localUser.accountNumber ?? 'N/A',
      accountType: localUser.account_type ?? 'Savings',
      name: localUser.name ?? 'Your account',
      email: localUser.email ?? '',
      status: 'Active'
    };
  });
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { balance, realBalance, demoBalance, transactions, insights, loading: bankingLoading } = useBanking();

  const [aiHealthScore, setAiHealthScore] = useState<number | null>(null);
  const [aiHealthRating, setAiHealthRating] = useState(t('common.good'));
  const [aiSavingsReco, setAiSavingsReco] = useState<string | null>(null);
  const [aiRiskScore, setAiRiskScore] = useState<number | null>(null);
  const [aiRecommendationText, setAiRecommendationText] = useState('Enable AI for personalized insights.');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiEngineOnline, setAiEngineOnline] = useState(false);
  const [fraudSummary, setFraudSummary] = useState({ count: 0, critical: 0, message: 'No fraud alerts' });
  const [bestSector, setBestSector] = useState({ name: 'Technology', growth: '+22%', risk: 'medium' });
  const [marketGrowth, setMarketGrowth] = useState({ gdp: 3.2, inflation: 2.5, sentiment: 'positive' });
  const [spendingInsight, setSpendingInsight] = useState({ totalSpent: 0, category: 'All', insight: 'Track your spending for AI insights.' });
  const [fraudAlertScore, setFraudAlertScore] = useState(0);
  const { info: toastInfo } = useToast();
  const { addNotification } = useNotifications();
  const welcomeShown = React.useRef(false);

  const handleQuickAction = async (action: string) => {
    setLoading(action);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(null);

    switch (action) {
      case 'analytics':
        navigate('/spending-analysis');
        break;
      case 'send-money':
        navigate('/payments');
        break;
      case 'save-money':
        navigate('/savings');
        break;
      case 'invest':
        toastInfo(t('dash.investComing'));
        break;
      case 'request-loan':
        navigate('/apply-loan');
        break;
      case 'pay-bills':
        navigate('/payments');
        break;
      case 'mobile-money':
        navigate('/payments');
        break;
      case 'qr-pay':
        toastInfo(t('dash.qrComing'));
        break;
      case 'save-goal':
        navigate('/savings');
        break;
      default:
        break;
    }
  };

  const displayBalance = balance ?? 0;
  const recentTx = transactions.slice(0, 4);
  const recentInsights = insights.slice(0, 3);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const localUser = (accountDetails as any) || {};
    const initialAccountNumber = localUser.accountNumber || 'N/A';
    const initialAccountType = localUser.accountType || 'Savings';
    const initialName = localUser.name || 'Your account';
    const initialEmail = localUser.email || '';
    const loadAccountDetails = async () => {
      try {
        const response = await accountService.getAccount();
        const account = response.data?.account;
        if (account) {
          setAccountDetails({
            accountNumber: account.user?.account_number ?? initialAccountNumber,
            accountType: account.account_type ?? initialAccountType,
            name: account.user?.name ?? initialName,
            email: account.user?.email ?? initialEmail,
            status: account.account_type ? 'Active' : 'Active'
          });
          if (!welcomeShown.current) {
            welcomeShown.current = true;
            addNotification({
              title: `${getGreeting()}, ${account.user?.name || 'there'}!`,
              message: 'Welcome back to your AI Smart Banking dashboard.',
              type: 'info',
              link: '/dashboard',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load account details:', error);
      }
    };

    loadAccountDetails();

    const loadAIData = async () => {
      setAiLoading(true);
      try {
        const modelStatus = await aiEngine.getModelStatus().catch(() => null);
        setAiEngineOnline(modelStatus?.status !== 'offline' && modelStatus?.success);

        const [savingsPred, recomData] = await Promise.all([
          aiEngine.predictSavings({
            income: 300000,
            expenses: 150000,
            savings: 50000,
            age: 30,
            employment_type: 'employed',
          }).catch(() => null),
          aiEngine.getRecommendations({
            income: 300000,
            expenses: 150000,
            risk_tolerance: 'moderate',
          }).catch(() => null),
        ]);

        if (savingsPred) {
          setAiHealthScore(savingsPred.financial_health_score || null);
          setAiHealthRating(savingsPred.financial_health_rating || t('common.good'));
          if (savingsPred.recommendations?.length > 0) {
            setAiSavingsReco(savingsPred.recommendations[0]);
          }
        }

        if (recomData) {
          if (recomData.priority_actions?.length > 0) {
            setAiRecommendationText(recomData.priority_actions[0]);
          }
          if (recomData.savings_recommendations?.length > 0) {
            setAiSavingsReco(prev => prev || recomData.savings_recommendations[0]);
          }
          setAiRiskScore(recomData.financial_health_summary?.score ?? null);

          if (recomData.sector_recommendations?.length > 0) {
            const best = recomData.sector_recommendations.reduce((a: any, b: any) => (a.growth_rate || 0) > (b.growth_rate || 0) ? a : b);
            setBestSector({ name: best.sector_name || 'Technology', growth: best.expected_return || '+22%', risk: best.risk_level || 'medium' });
          }

          setFraudAlertScore(recomData.financial_health_summary?.score ? Math.round((100 - recomData.financial_health_summary.score) * 0.7) : 20);
        }

        try {
          const fraudRes = await marketService.getFraudAlerts();
          const fraudData = fraudRes?.data?.data || fraudRes?.data;
          if (fraudData?.alerts) {
            setFraudSummary({ count: fraudData.total || fraudData.alerts.length, critical: fraudData.critical_count || 0, message: fraudData.alerts.length > 0 ? `${fraudData.alerts.length} alert${fraudData.alerts.length > 1 ? 's' : ''} detected` : t('dash.noInsights') });
          }
        } catch {
          setFraudSummary({ count: 9, critical: 1, message: '9 alerts detected' });
        }

        setMarketGrowth({ gdp: 3.2 + Math.random() * 0.5, inflation: 2.0 + Math.random(), sentiment: Math.random() > 0.3 ? 'positive' : 'neutral' });

        const totalSpent = transactions.reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
        setSpendingInsight({ totalSpent, category: transactions.length > 0 ? t('common.excellent') : 'None', insight: transactions.length > 20 ? 'Healthy spending patterns detected.' : t('dash.noTx') });
      } catch (err) {
        console.error('Failed to load AI data:', err);
      } finally {
        setAiLoading(false);
      }
    };
    loadAIData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0B1F3A' : '#f8fafc' }}>
      <Navbar authenticated={!!localStorage.getItem('token')} />
      <SmartAlertBanner />
      <div style={{ position: 'relative', width: '100%' }}>
        <img src={`${(process.env.REACT_APP_API_URL || 'http://localhost:4000/api').replace('/api', '')}/uploads/banner.png`} alt="AI Banking banner" style={{ width: '100%', height: '220px', display: 'block', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).src = '/banner.png'; }} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            padding: '24px 32px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <motion.h1
              style={{ fontSize: 'clamp(22px, 3vw, 32px)', margin: 0, color: 'white', fontWeight: 800 }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t('dash.welcomeTitle')}
            </motion.h1>
            <motion.p
              style={{ color: 'rgba(255,255,255,0.9)', margin: '8px 0 0', fontSize: '15px', lineHeight: 1.5 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {t('dash.welcomeSub')}
            </motion.p>
          </div>
          <motion.div
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/transactions">
              <LoadingButton variant="primary" size="md">
                <BarChart3 size={16} />
                {t('nav.transactions')}
              </LoadingButton>
            </Link>
            <Link to="/payments">
              <LoadingButton variant="secondary" size="md">
                <Sparkles size={16} />
                {t('nav.payments')}
              </LoadingButton>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          padding: 32,
          minHeight: 'calc(100vh - 48px)',
          background: isDark ? 'linear-gradient(135deg, #0B1F3A 0%, #0B1F3A 100%)' : 'linear-gradient(135deg, #eef7fb 0%, #e0f2fe 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(10,147,150,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            pointerEvents: 'none'
          }}
        />



        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
            gap: 20,
            marginBottom: 32,
            position: 'relative',
            zIndex: 1
          }}
        >
          <SectionCard title={t('card.accountBalance')}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              style={{ marginTop: 20 }}
            >
              <div
                style={{
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0A9396, #059669)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {bankingLoading ? '...' : `RWF ${displayBalance.toLocaleString()}`}
              </div>
              <div style={{ marginTop: 4, color: '#475569', fontSize: '14px' }}>
                {t('card.availableFunds')}: {bankingLoading ? '...' : `RWF ${displayBalance.toLocaleString()}`}
              </div>
              <Link to="/spending-analysis">
                <LoadingButton
                  variant="ghost"
                  size="sm"
                  style={{ marginTop: 20 }}
                >
                  <BarChart3 size={16} />
                  {t('card.analyzeSpending')}
                  <ArrowRight size={14} />
                </LoadingButton>
              </Link>
              
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <LoadingButton
                  loading={loading === 'send-money'}
                  onClick={() => handleQuickAction('send-money')}
                  variant="primary"
                  size="sm"
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  {t('common.sendMoney')}
                </LoadingButton>
                <LoadingButton
                  loading={loading === 'save-money'}
                  onClick={() => handleQuickAction('save-money')}
                  variant="secondary"
                  size="sm"
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  {t('common.saveMoney')}
                </LoadingButton>
                <LoadingButton
                  loading={loading === 'invest'}
                  onClick={() => handleQuickAction('invest')}
                  variant="primary"
                  size="sm"
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  {t('common.invest')}
                </LoadingButton>
                <LoadingButton
                  loading={loading === 'request-loan'}
                  onClick={() => handleQuickAction('request-loan')}
                  variant="secondary"
                  size="sm"
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  {t('common.requestLoan')}
                </LoadingButton>
              </div>
            </motion.div>
          </SectionCard>

          <SectionCard title={t('dash.summary')} subtitle={accountDetails ? `${accountDetails.accountType} • ${accountDetails.status}` : 'Loading account details...'}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.75 }}
              style={{ marginTop: 20 }}
            >
              <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0A9396', fontWeight: 700 }}>
                {accountDetails?.name ?? t('nav.user')}
              </div>
              <div style={{ marginTop: 12, fontSize: '20px', fontWeight: 700, color: '#0B112D' }}>
                {bankingLoading ? '...' : `RWF ${displayBalance.toLocaleString()}`}
              </div>
              <div style={{ marginTop: 14, color: '#64748b', fontSize: '14px' }}>
                {t('dash.accNumber')}: {accountDetails?.accountNumber ?? 'N/A'}
              </div>
              <div style={{ marginTop: 8, color: '#64748b', fontSize: '14px' }}>
                {accountDetails?.email ?? t('auth.emailNotAvail')}
              </div>
              <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <Link to="/transactions">
                  <LoadingButton variant="ghost" size="sm" style={{ padding: '10px 14px' }}>
                    {t('dash.viewTransactions')}
                  </LoadingButton>
                </Link>
                <Link to="/payments">
                  <LoadingButton variant="secondary" size="sm" style={{ padding: '10px 14px' }}>
                    {t('dash.managePayments')}
                  </LoadingButton>
                </Link>
              </div>
            </motion.div>
          </SectionCard>

          <SectionCard
            title={t('card.financialHealth')}
            headerRight={
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontWeight: 700, color: '#0A9396', fontSize: '18px' }}
              >
                {aiLoading ? '...' : (aiHealthScore ?? (displayBalance > 0 ? 60 : 0))}/100
              </motion.div>
            }
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ marginTop: 20 }}
            >
              <div style={{ height: 12, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${aiHealthScore ?? (displayBalance > 0 ? 60 : 0)}%` }}
                  transition={{ duration: 1.5, delay: 0.9 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #0A9396, #059669)', borderRadius: 999 }}
                />
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                <span>{t('common.poor')}</span>
                <span>{t('common.good')}</span>
                <span>{t('common.excellent')}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: '#0A9396', fontWeight: 600 }}>
                {aiHealthRating}
              </div>
            </motion.div>
          </SectionCard>

          <SectionCard
            title={t('card.loanEligibility')}
            subtitle={aiRiskScore !== null ? `AI Risk Score: ${aiRiskScore}/100` : 'Enable AI for risk assessment'}
            headerRight={
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ fontWeight: 700, color: aiRiskScore !== null && aiRiskScore < 50 ? '#10b981' : '#0A9396', fontSize: '18px' }}
              >
                {aiLoading ? '...' : aiRiskScore !== null ? (aiRiskScore < 50 ? t('dash.lowRisk') : aiRiskScore < 75 ? t('dash.mediumRisk') : t('dash.highRisk')) : 'N/A'}
              </motion.div>
            }
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{ marginTop: 20 }}
            >
              <LoadingButton
                loading={loading === 'loan'}
                onClick={() => setLoanEligibilityOpen(true)}
                variant="ghost"
                size="sm"
              >
                <FileText size={16} />
                {t('card.checkEligibility')}
                <ArrowRight size={14} />
              </LoadingButton>
            </motion.div>
          </SectionCard>

          <SectionCard title={t('card.aiInsight')} subtitle={aiEngineOnline ? 'AI Engine is active' : 'Using estimated predictions'}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
              style={{ marginTop: 20 }}
            >
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0A9396', display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap size={20} />
                </motion.div>
                {aiLoading ? 'Loading...' : (aiRecommendationText || (recentInsights.length > 0 ? recentInsights[0].message : t('dash.noInsights')))}
              </div>
            </motion.div>
          </SectionCard>

          <SectionCard title={t('card.savingsProgress')}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              style={{ marginTop: 20 }}
            >
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginBottom: 16 }}>
                {aiLoading ? '...' : (aiHealthScore ? `${aiHealthScore}%` : 'N/A')}
              </div>
              <div style={{ height: 12, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${aiHealthScore || 0}%` }}
                  transition={{ duration: 1.5, delay: 1.3 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: 999 }}
                />
              </div>
              <div style={{ marginTop: 12, fontSize: '14px', color: '#475569' }}>
                {aiSavingsReco || 'Create a savings goal to get started.'}
              </div>
            </motion.div>
          </SectionCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            gap: 18,
            marginBottom: 28,
            position: 'relative',
            zIndex: 1
          }}
        >
          <SectionCard title={t('dash.fraudAlert')} subtitle={fraudSummary.message}>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: fraudSummary.count > 0 ? '#ef4444' : '#10b981' }}>{fraudSummary.count}</div>
                  <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>{t('dash.alerts')}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: fraudSummary.critical > 0 ? '#ef4444' : '#10b981' }}>{fraudSummary.critical}</div>
                  <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>{t('dash.critical')}</div>
                </div>
              </div>
              <AlertTriangle size={24} color={fraudSummary.count > 0 ? '#ef4444' : '#10b981'} style={{ margin: '0 auto' }} />
            </div>
          </SectionCard>

          <SectionCard title={t('dash.bestInvest')} subtitle={t('dash.aiRecommended')}>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <TrendingUp size={24} color="#0A9396" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: isDark ? '#e2e8f0' : '#1e293b' }}>{bestSector.name}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginTop: 4 }}>{bestSector.growth}</div>
              <div style={{
                marginTop: 8, padding: '2px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, display: 'inline-block',
                background: bestSector.risk === 'low' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: bestSector.risk === 'low' ? '#10b981' : '#f59e0b',
              }}>{bestSector.risk === 'low' ? t('dash.lowRisk') : t('dash.mediumRisk')}</div>
            </div>
          </SectionCard>

          <SectionCard title={t('dash.marketGrowth')} subtitle={t('dash.aiIndicators')}>
            <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>{t('dash.gdpGrowth')}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>+{marketGrowth.gdp.toFixed(1)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>{t('dash.inflation')}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{marketGrowth.inflation.toFixed(1)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>{t('dash.sentiment')}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: marketGrowth.sentiment === 'positive' ? '#10b981' : '#f59e0b', textTransform: 'capitalize' }}>{marketGrowth.sentiment}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={t('dash.spendingIntel')} subtitle={aiEngineOnline ? 'AI analyzed' : 'Basic summary'}>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <DollarSign size={24} color="#0A9396" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#e2e8f0' : '#1e293b' }}>RWF {spendingInsight.totalSpent.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginTop: 4 }}>{t('dash.totalVol')}</div>
              <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc', fontSize: 12, color: isDark ? '#cbd5e1' : '#475569' }}>
                {spendingInsight.insight}
              </div>
            </div>
          </SectionCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.45 }}
          style={{ marginBottom: 32, position: 'relative', zIndex: 1 }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <AIFinancialAdvisor />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.45 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
            gap: 'clamp(12px, 3vw, 20px)',
            marginBottom: 32,
            position: 'relative',
            zIndex: 1
          }}
        >
          <MarketInsights />
          <IncomePattern />
          <InvestmentIdeas />
          <RiskAlerts />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.45 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
            gap: 24,
            position: 'relative',
            zIndex: 1
          }}
        >
          <SectionCard
            title={t('card.recentTransactions')}
            headerRight={
              <Link to="/transactions">
                <LoadingButton variant="primary" size="sm">
                  {t('card.viewAll')}
                  <ArrowRight size={14} />
                </LoadingButton>
              </Link>
            }
          >
            <motion.div
              style={{ marginTop: 24, display: 'grid', gap: 16 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {recentTx.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
                  {t('dash.noTx')}
                </div>
              ) : (
                recentTx.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 8 }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: 16,
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                        {tx.description}
                      </div>
                      <div style={{ color: '#64748b', marginTop: 6, fontSize: '12px' }}>
                        {tx.type} | {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: '#0A9396' }}>
                        RWF {Number(tx.amount).toLocaleString()}
                      </div>
                      <div style={{ color: '#475569', marginTop: 6, fontSize: '12px' }}>{tx.status}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </SectionCard>

          <SectionCard
            title={t('card.aiHighlights')}
            style={{ background: 'linear-gradient(135deg, #0A9396, #059669)', color: 'white' }}
            bodyStyle={{ color: 'white' }}
          >
            <motion.div
              style={{ marginTop: 24, display: 'grid', gap: 18 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7 }}
            >
              {recentInsights.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#e0f2fe' }}>
                  {t('dash.noInsights')}
                </div>
              ) : (
                recentInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      padding: 18,
                      borderRadius: 18,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: index * 0.5 }}
                      >
                        <Sparkles size={16} />
                      </motion.div>
                      {insight.type}
                    </div>
                    <p style={{ marginTop: 10, color: '#e0f2fe', fontSize: '12px', lineHeight: 1.6 }}>{insight.message}</p>
                  </motion.div>
                ))
              )}
            </motion.div>

            <Link to="/ai-insights" style={{ textDecoration: 'none' }}>
              <div style={{
                marginTop: 20,
                padding: '14px 16px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.18)',
                textAlign: 'center',
                color: '#e0f2fe',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.32)'
              }}>
                {t('dash.viewAllInsights')}
              </div>
            </Link>
          </SectionCard>
        </motion.div>
      </motion.div>

      <>
        <LoanEligibility isOpen={loanEligibilityOpen} onClose={() => setLoanEligibilityOpen(false)} />
        <QuickActions onAction={handleQuickAction} anchor="bottom-left" />
      </>

      <Footer />
    </div>
  );
};

export default Dashboard;
