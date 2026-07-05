import React, { useEffect, useState } from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Lock, Shield, AlertTriangle, Eye, ChevronRight, CheckCircle, Smartphone } from 'lucide-react';
import ThreeBody from '../components/ThreeBody';
import { useNavigate } from 'react-router-dom';
import { settingsService } from '../services/settingsService';
import { useToast } from '../context/ToastContext';

interface SecuritySettings {
  two_factor_enabled: boolean;
  sms_alerts: boolean;
  email_alerts: boolean;
  login_notifications: boolean;
  session_timeout: number;
}

const Security: React.FC = () => {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    sms_alerts: true,
    email_alerts: true,
    login_notifications: true,
    session_timeout: 30
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchSettings();
    }
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsService.getSecuritySettings();
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load security settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggle2FA = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setUpdating(true);
    try {
      const newStatus = !settings.two_factor_enabled;
      const response = await settingsService.updateSecuritySettings({
        ...settings,
        two_factor_enabled: newStatus
      });
      
      if (response.data.success) {
        setSettings(prev => ({ ...prev, two_factor_enabled: newStatus }));
        toastSuccess(`Two-Factor Authentication ${newStatus ? 'enabled' : 'disabled'}`);
      }
    } catch (err: any) {
      toastError(err.response?.data?.msg || 'Failed to update security settings');
    } finally {
      setUpdating(false);
    }
  };

  const securityFeatures = [
    {
      icon: Lock,
      title: 'Data Encryption',
      status: 'AES-256 Active',
      description: 'Your financial data is protected using military-grade encryption standards.',
      action: null
    },
    {
      icon: Shield,
      title: 'Secure Login',
      status: settings.two_factor_enabled ? '2FA Enabled' : '2FA Disabled',
      description: 'Add an extra layer of security with multi-factor authentication.',
      action: {
        label: settings.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA',
        onClick: toggle2FA,
        loading: updating
      }
    },
    {
      icon: AlertTriangle,
      title: 'Fraud Monitoring',
      status: 'Always On',
      description: 'AI-powered monitoring detects and prevents suspicious account activities.',
      action: isLoggedIn ? {
        label: 'View Alerts',
        onClick: () => navigate('/dashboard')
      } : null
    },
    {
      icon: Eye,
      title: 'Privacy Controls',
      status: 'Secured',
      description: 'Manage your data sharing preferences and account visibility.',
      action: isLoggedIn ? {
        label: 'Manage Privacy',
        onClick: () => navigate('/settings')
      } : null
    }
  ];

  return (
    <PageLayout 
      title="Security & Privacy"
      subtitle="Advanced protection for your financial peace of mind"
    >
      <div style={{ display: 'grid', gap: 40 }}>
        {/* Security Overview Card if Logged In */}
        {isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #0B1F3A 0%, #1e293b 100%)',
              padding: '30px',
              borderRadius: 20,
              color: 'white',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 30,
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(10, 147, 150, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(10, 147, 150, 0.4)'
              }}>
                <Smartphone size={32} color="#0A9396" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px' }}>Security Status</h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <CheckCircle size={16} color="#10b981" />
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>Account is protected</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ textAlign: 'center', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: 4 }}>Transaction PIN</div>
                <div style={{ fontWeight: 700, color: user.pin_set ? '#10b981' : '#f59e0b' }}>
                  {user.pin_set ? 'Active' : (
                    <button 
                      onClick={() => navigate('/set-security')}
                      style={{ background: 'none', border: 'none', color: '#0A9396', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                    >
                      Set Now
                    </button>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: 4 }}>2FA Status</div>
                <div style={{ fontWeight: 700, color: settings.two_factor_enabled ? '#10b981' : '#f59e0b' }}>
                  {settings.two_factor_enabled ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Security Cards */}
        <div>
          <h2 style={{ color: '#0B1F3A', marginBottom: 30, fontSize: '24px' }}>Security Control Center</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {securityFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: '#f0fdfa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={24} color="#0A9396" />
                      </div>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 700, 
                        padding: '4px 10px', 
                        borderRadius: 20,
                        background: feature.status.includes('Active') || feature.status.includes('Enabled') || feature.status.includes('Secured') || feature.status.includes('On') ? '#dcfce7' : '#fee2e2',
                        color: feature.status.includes('Active') || feature.status.includes('Enabled') || feature.status.includes('Secured') || feature.status.includes('On') ? '#166534' : '#991b1b'
                      }}>
                        {feature.status}
                      </span>
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#0B1F3A', fontSize: '18px' }}>{feature.title}</h3>
                    <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '14px', margin: '0 0 20px 0' }}>{feature.description}</p>
                  </div>
                  
                  {feature.action && (
                    <button
                      onClick={feature.action.onClick}
                      disabled={feature.action.loading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 10,
                        background: feature.action.label.includes('Disable') ? '#f1f5f9' : '#0A9396',
                        color: feature.action.label.includes('Disable') ? '#475569' : 'white',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s'
                      }}
                    >
                      {feature.action.loading ? <><ThreeBody size={16} /> Updating...</> : feature.action.label}
                      {!feature.action.loading && <ChevronRight size={16} />}
                    </button>
                  )}
                  
                  {!feature.action && !isLoggedIn && (
                    <button
                      onClick={() => navigate('/login')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 10,
                        background: '#f8fafc',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Login to Manage
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Compliance & Standards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'linear-gradient(135deg, #0A9396 0%, #059669 100%)',
              color: 'white',
              padding: '40px',
              borderRadius: 20,
              boxShadow: '0 10px 30px rgba(10, 147, 150, 0.2)'
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: '22px' }}>Compliance & Standards</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
              {[
                'Rwanda Financial Regulator Compliant',
                'ISO 27001 Certified Systems',
                'PCI DSS Level 1 Payment Security',
                'GDPR Data Protection Standards',
                'Regular Security Audits'
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '15px' }}>
                  <CheckCircle size={18} color="rgba(255,255,255,0.6)" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: 'white',
              padding: '40px',
              borderRadius: 20,
              border: '1px solid #e2e8f0'
            }}
          >
            <h2 style={{ color: '#0B1F3A', marginTop: 0, fontSize: '22px' }}>Your Privacy Rights</h2>
            <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: '15px', marginBottom: 24 }}>
              You have full control over your personal data. We use it only to provide you with the best banking experience.
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              <button 
                onClick={() => navigate('/settings')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0A9396',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Request Data Access <ChevronRight size={16} />
              </button>
              <button 
                onClick={() => navigate('/settings')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0A9396',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Delete Account Data <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Security;
