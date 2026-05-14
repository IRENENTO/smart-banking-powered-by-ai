import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, FileText, ArrowRight, Sparkles, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import SmartAlertBanner from '../components/SmartAlertBanner';
import SpendingAnalytics from '../components/SpendingAnalytics';
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
import { accountService } from '../services/api';

const Dashboard: React.FC = () => {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [loanEligibilityOpen, setLoanEligibilityOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [accountDetails, setAccountDetails] = useState<{
    accountNumber: string;
    accountType: string;
    name: string;
    email: string;
    status: string;
  } | null>(null);
  const { t } = useLanguage();
  const { balance, transactions, insights, loading: bankingLoading } = useBanking();
  const { info: toastInfo } = useToast();

  const handleQuickAction = async (action: string) => {
    setLoading(action);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(null);

    switch (action) {
      case 'analytics':
        setAnalyticsOpen(true);
        break;
      case 'send-money':
        window.location.href = '/payments';
        break;
      case 'save-money':
        window.location.href = '/savings';
        break;
      case 'invest':
        toastInfo('Investment feature coming soon!');
        break;
      case 'request-loan':
        window.location.href = '/apply-loan';
        break;
      case 'pay-bills':
        window.location.href = '/payments';
        break;
      case 'mobile-money':
        window.location.href = '/payments';
        break;
      case 'qr-pay':
        toastInfo('QR Payment feature coming soon!');
        break;
      case 'save-goal':
        window.location.href = '/savings';
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
    const parseJSON = (value: string | null) => {
      if (!value || value === 'undefined' || value === 'null') return null;
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    };

    const localUser = parseJSON(localStorage.getItem('user')) ?? {};
    const initialAccountNumber = localUser.account_number ?? localUser.accountNumber ?? 'N/A';
    const initialAccountType = localUser.account_type ?? 'Savings';
    const initialName = localUser.name ?? 'Your account';
    const initialEmail = localUser.email ?? '';

    setAccountDetails({
      accountNumber: initialAccountNumber,
      accountType: initialAccountType,
      name: initialName,
      email: initialEmail,
      status: 'Active'
    });

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
        }
      } catch (error) {
        console.error('Failed to load account details:', error);
      }
    };

    loadAccountDetails();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#071B2F' : '#eef7fb' }}>
      <Navbar authenticated={!!localStorage.getItem('token')} />
      <SmartAlertBanner />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          padding: 32,
          minHeight: 'calc(100vh - 48px)',
          background: isDark ? 'linear-gradient(135deg, #071B2F 0%, #0B1F3A 100%)' : 'linear-gradient(135deg, #eef7fb 0%, #e0f2fe 100%)',
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 32,
            position: 'relative',
            zIndex: 1
          }}
        >
          <div>
            <motion.h1
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                margin: 0,
                background: 'linear-gradient(135deg, #0A9396, #0B1F3A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
              }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              AI Smart Banking
            </motion.h1>
            <motion.p
              style={{ color: isDark ? '#cbd5e1' : '#475569', marginTop: 12, fontSize: '16px', lineHeight: 1.6 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              A full digital banking experience with AI-powered insights, payments, savings, and smarter loans.
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
                Transactions
              </LoadingButton>
            </Link>
            <Link to="/payments">
              <LoadingButton variant="secondary" size="md">
                <Sparkles size={16} />
                Payments
              </LoadingButton>
            </Link>
          </motion.div>
        </motion.div>

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
              <div style={{ marginTop: 12, color: '#475569', fontSize: '14px' }}>
                Available funds: {bankingLoading ? '...' : `RWF ${displayBalance.toLocaleString()}`}
              </div>
              <LoadingButton
                loading={loading === 'analytics'}
                onClick={() => handleQuickAction('analytics')}
                variant="ghost"
                size="sm"
                style={{ marginTop: 20 }}
              >
                <BarChart3 size={16} />
                {t('card.analyzeSpending')}
                <ArrowRight size={14} />
              </LoadingButton>
              
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <LoadingButton
                  loading={loading === 'send-money'}
                  onClick={() => handleQuickAction('send-money')}
                  variant="primary"
                  size="sm"
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  Send Money
                </LoadingButton>
                <LoadingButton
                  loading={loading === 'save-money'}
                  onClick={() => handleQuickAction('save-money')}
                  variant="secondary"
                  size="sm"
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  Save Money
                </LoadingButton>
                <LoadingButton
                  loading={loading === 'invest'}
                  onClick={() => handleQuickAction('invest')}
                  variant="primary"
                  size="sm"
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  Invest
                </LoadingButton>
                <LoadingButton
                  loading={loading === 'request-loan'}
                  onClick={() => handleQuickAction('request-loan')}
                  variant="secondary"
                  size="sm"
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  Request Loan
                </LoadingButton>
              </div>
            </motion.div>
          </SectionCard>

          <SectionCard title="Account Summary" subtitle={accountDetails ? `${accountDetails.accountType} • ${accountDetails.status}` : 'Loading account details...'}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.75 }}
              style={{ marginTop: 20 }}
            >
              <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0A9396', fontWeight: 700 }}>
                {accountDetails?.name ?? 'Your Account'}
              </div>
              <div style={{ marginTop: 12, fontSize: '20px', fontWeight: 700, color: '#0B112D' }}>
                {bankingLoading ? '...' : `RWF ${displayBalance.toLocaleString()}`}
              </div>
              <div style={{ marginTop: 14, color: '#64748b', fontSize: '14px' }}>
                Account number: {accountDetails?.accountNumber ?? 'N/A'}
              </div>
              <div style={{ marginTop: 8, color: '#64748b', fontSize: '14px' }}>
                {accountDetails?.email ?? 'No email available'}
              </div>
              <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <Link to="/transactions">
                  <LoadingButton variant="ghost" size="sm" style={{ padding: '10px 14px' }}>
                    View Transactions
                  </LoadingButton>
                </Link>
                <Link to="/payments">
                  <LoadingButton variant="secondary" size="sm" style={{ padding: '10px 14px' }}>
                    Manage Payments
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
                {bankingLoading ? '--' : (displayBalance > 0 ? '75' : '0')}/100
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
                  animate={{ width: `${displayBalance > 0 ? 75 : 0}%` }}
                  transition={{ duration: 1.5, delay: 0.9 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #0A9396, #059669)', borderRadius: 999 }}
                />
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                <span>Poor</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </motion.div>
          </SectionCard>

          <SectionCard
            title={t('card.loanEligibility')}
            subtitle={displayBalance > 0 ? 'Start building transaction history to improve eligibility' : 'Complete your profile and start transacting'}
            headerRight={
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ fontWeight: 700, color: '#0A9396', fontSize: '18px' }}
              >
                {displayBalance > 0 ? 'Building' : 'N/A'}
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

          <SectionCard title={t('card.aiInsight')} subtitle="The system learns your spending and gives actionable suggestions.">
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
                {bankingLoading ? 'Loading...' : (recentInsights.length > 0 ? recentInsights[0].message : 'Start making transactions to receive AI-powered insights.')}
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
                {bankingLoading ? '--' : '0%'}
              </div>
              <div style={{ height: 12, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 1.5, delay: 1.3 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: 999 }}
                />
              </div>
              <div style={{ marginTop: 12, fontSize: '14px', color: '#475569' }}>Create a savings goal to get started.</div>
            </motion.div>
          </SectionCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35 }}
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
                  No transactions yet. Make your first deposit or transfer to get started.
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
                        RWF {tx.amount.toLocaleString()}
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
                  No AI insights yet. Start transacting to receive personalized insights.
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
                View all AI insights
              </div>
            </Link>
          </SectionCard>
        </motion.div>
      </motion.div>

      <>
        <SpendingAnalytics isOpen={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
        <LoanEligibility isOpen={loanEligibilityOpen} onClose={() => setLoanEligibilityOpen(false)} />
        <QuickActions onAction={handleQuickAction} anchor="bottom-left" />
      </>
    </div>
  );
};

export default Dashboard;
