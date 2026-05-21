import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { settingsService } from '../services/settingsService';
import { Shield, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

interface TransactionLimits {
  daily_limit: number;
  weekly_limit: number;
  monthly_limit: number;
  single_transaction_limit: number;
}

const TransactionLimits: React.FC = () => {
  const [limits, setLimits] = useState<TransactionLimits>({
    daily_limit: 1000000,
    weekly_limit: 5000000,
    monthly_limit: 20000000,
    single_transaction_limit: 500000
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadLimits = async () => {
      setLoading(true);
      try {
        const response = await settingsService.getTransactionLimits();
        if (response.data.success) {
          setLimits(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to load transaction limits');
      } finally {
        setLoading(false);
      }
    };

    loadLimits();
  }, []);

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await settingsService.updateTransactionLimits(limits);
      if (response.data.success) {
        setSuccess('Transaction limits updated successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to update transaction limits');
    } finally {
      setSaving(false);
    }
  };

  const handleLimitChange = (field: keyof TransactionLimits, value: string) => {
    const numValue = parseInt(value) || 0;
    setLimits(prev => ({ ...prev, [field]: numValue }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AppShell
      title="Transaction Limits"
      subtitle="Set spending limits to control your transactions"
      videoSrc="/videos/banking.mp4"
    >
      <div style={{ display: 'grid', gap: 24 }}>
        {error && <div className="toast toast-error">{error}</div>}
        {success && <div className="toast toast-success">{success}</div>}

        <SectionCard 
          title="Current Limits"
          subtitle="Your active transaction limits"
          headerRight={
            <Shield size={24} style={{ color: '#0A9396' }} />
          }
        >
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: 12, border: '1px solid #e0f2fe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <DollarSign size={20} style={{ color: '#0A9396' }} />
                  <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Daily Limit</div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#0A9396' }}>
                  {formatCurrency(limits.daily_limit)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
                  Per day
                </div>
              </div>

              <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #dcfce7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <TrendingUp size={20} style={{ color: '#059669' }} />
                  <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Weekly Limit</div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>
                  {formatCurrency(limits.weekly_limit)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
                  Per week
                </div>
              </div>

              <div style={{ padding: '16px', background: '#fef3c7', borderRadius: 12, border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <TrendingUp size={20} style={{ color: '#d97706' }} />
                  <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Monthly Limit</div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706' }}>
                  {formatCurrency(limits.monthly_limit)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
                  Per month
                </div>
              </div>

              <div style={{ padding: '16px', background: '#fee2e2', borderRadius: 12, border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <AlertTriangle size={20} style={{ color: '#dc2626' }} />
                  <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Single Transaction</div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>
                  {formatCurrency(limits.single_transaction_limit)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
                  Maximum per transaction
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard 
          title="Limit Usage"
          subtitle="Real-time tracking of your spending"
          headerRight={
            <TrendingUp size={24} style={{ color: '#0A9396' }} />
          }
        >
          <div style={{ marginTop: 16, display: 'grid', gap: 20 }}>
            {[
              { label: 'Daily Limit', used: 250000, max: limits.daily_limit },
              { label: 'Weekly Limit', used: 1200000, max: limits.weekly_limit }
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '14px' }}>
                  <span style={{ fontWeight: 600, color: '#0B1F3A' }}>{item.label}</span>
                  <span style={{ color: '#64748b' }}>{formatCurrency(item.used)} / {formatCurrency(item.max)}</span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min((item.used / item.max) * 100, 100)}%`, 
                    background: (item.used / item.max) > 0.8 ? '#ef4444' : '#0A9396',
                    borderRadius: '5px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard 
          title="Update Limits"
          subtitle="Adjust your transaction limits"
          headerRight={
            <Shield size={24} style={{ color: '#0A9396' }} />
          }
        >
          <form onSubmit={handleSaveLimits} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Daily Limit (RWF)</span>
                  <input
                    type="number"
                    value={limits.daily_limit}
                    onChange={(e) => handleLimitChange('daily_limit', e.target.value)}
                    placeholder="1000000"
                    min={1000}
                    required
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px'
                    }}
                  />
                </label>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Minimum: 1,000 RWF
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Weekly Limit (RWF)</span>
                  <input
                    type="number"
                    value={limits.weekly_limit}
                    onChange={(e) => handleLimitChange('weekly_limit', e.target.value)}
                    placeholder="5000000"
                    min={5000}
                    required
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px'
                    }}
                  />
                </label>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Minimum: 5,000 RWF
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Monthly Limit (RWF)</span>
                  <input
                    type="number"
                    value={limits.monthly_limit}
                    onChange={(e) => handleLimitChange('monthly_limit', e.target.value)}
                    placeholder="20000000"
                    min={10000}
                    required
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px'
                    }}
                  />
                </label>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Minimum: 10,000 RWF
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Single Transaction Limit (RWF)</span>
                  <input
                    type="number"
                    value={limits.single_transaction_limit}
                    onChange={(e) => handleLimitChange('single_transaction_limit', e.target.value)}
                    placeholder="500000"
                    min={500}
                    required
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px'
                    }}
                  />
                </label>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Minimum: 500 RWF
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <LoadingButton
                type="submit"
                disabled={saving}
                loading={saving}
                variant="primary"
                style={{ minWidth: '150px' }}
              >
                {saving ? 'Saving...' : 'Update Limits'}
              </LoadingButton>
              <LoadingButton
                onClick={() => navigate('/limits-history')}
                variant="ghost"
                style={{ minWidth: '150px' }}
              >
                View History
              </LoadingButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard 
          title="Security Information"
          subtitle="How limits protect your account"
          headerRight={
            <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
          }
        >
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Shield size={20} style={{ color: '#0A9396' }} />
                <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Automatic Protection</div>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                Transactions exceeding your limits will be automatically blocked for your security. You'll receive instant notifications when limits are approached.
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Emergency Override</div>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                In case of emergency, you can temporarily override limits by contacting customer support with proper verification.
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <DollarSign size={20} style={{ color: '#059669' }} />
                <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Gradual Increase</div>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                Limits automatically increase based on your account activity and transaction history over time.
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
};

export default TransactionLimits;
