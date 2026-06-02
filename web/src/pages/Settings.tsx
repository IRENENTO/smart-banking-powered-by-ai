import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, KeyRound, CheckCircle, Loader, X } from 'lucide-react';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { profileService, securityService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinStep, setPinStep] = useState<'otp' | 'new-pin' | 'done'>('otp');
  const [otpCode, setOtpCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  const modalCardBg = isDark ? 'rgba(15,23,42,0.98)' : 'white';
  const modalTextColor = isDark ? '#e2e8f0' : '#1e293b';
  const modalMutedColor = isDark ? '#94a3b8' : '#64748b';
  const modalBorderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  const modalInputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 14, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
    background: isDark ? '#0f172a' : 'white', color: modalTextColor, fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  };

  const resetPinModal = () => {
    setShowPinModal(false);
    setPinStep('otp');
    setOtpCode('');
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    setPinMessage('');
    setPinLoading(false);
  };

  const handleSendPinOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinLoading(true); setPinError(''); setPinMessage('');
    try {
      const res = await securityService.forgotPinSendOTP();
      if (res.data.emailSent === false && res.data.otp) {
        setPinMessage(`Email delivery failed. Your OTP is: ${res.data.otp}`);
      } else {
        setPinMessage('OTP sent to your email');
      }
      setPinStep('new-pin');
    } catch (err: any) {
      setPinError(err.response?.data?.msg || 'Failed to send OTP');
    } finally { setPinLoading(false); }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) { setPinError('Enter the OTP code'); return; }
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) { setPinError('PIN must be exactly 4 digits'); return; }
    if (newPin !== confirmPin) { setPinError('PINs do not match'); return; }
    setPinLoading(true); setPinError(''); setPinMessage('');
    try {
      await securityService.forgotPinReset(otpCode, newPin);
      setPinMessage('Transaction PIN reset successfully!');
      setPinStep('done');
    } catch (err: any) {
      setPinError(err.response?.data?.msg || 'Failed to reset PIN');
    } finally { setPinLoading(false); }
  };

  useEffect(() => {
    const loadProfile = async () => {
      setBusy('loading');
      try {
        const response = await profileService.getProfile();
        setUser(response.data.user);
        setProfile(response.data.profile);
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Unable to load settings');
      } finally {
        setBusy(null);
      }
    };

    loadProfile();
  }, []);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;

    setBusy('delete');
    setError('');

    try {
      await profileService.deleteProfile();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to delete account');
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell
      title="Settings"
      subtitle="Manage your account preferences, security and profile access."
      videoSrc="/videos/banking.mp4"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <SectionCard 
          title="Profile & Identity" 
          subtitle="Manage your personal information and verification"
          headerRight={
            <span className={`chip ${profile?.national_id ? 'chip-green' : 'chip-yellow'}`}>
              {profile?.national_id ? 'Verified' : 'Incomplete'}
            </span>
          }
        >
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#64748b', marginBottom: 16 }}>Update your personal details and identification documents.</div>
            <LoadingButton
              onClick={() => navigate('/profile')}
              disabled={busy !== null}
              variant="primary"
              size="sm"
              style={{ width: '100%' }}
            >
              Manage Profile
            </LoadingButton>
          </div>
        </SectionCard>

        <SectionCard 
          title="Security Settings" 
          subtitle="Keep your account secure"
          headerRight={
            <span className="insight-pill low">Protected</span>
          }
        >
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#64748b', marginBottom: 16 }}>Manage password, two-factor authentication, and security preferences.</div>
            <LoadingButton
              onClick={() => navigate('/security')}
              disabled={busy !== null}
              variant="primary"
              size="sm"
              style={{ width: '100%', marginBottom: 8 }}
            >
              Security Settings
            </LoadingButton>
            <LoadingButton
              onClick={() => { setShowPinModal(true); setPinStep('otp'); setPinError(''); setPinMessage(''); }}
              disabled={busy !== null}
              variant="secondary"
              size="sm"
              style={{ width: '100%' }}
            >
              Reset Transaction PIN
            </LoadingButton>
          </div>
        </SectionCard>

        <SectionCard 
          title="Notifications" 
          subtitle="Stay informed"
          headerRight={
            <span className="insight-pill low">Active</span>
          }
        >
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#64748b', marginBottom: 16 }}>Configure email and SMS alerts for transactions and account updates.</div>
            <LoadingButton
              onClick={() => navigate('/notifications')}
              disabled={busy !== null}
              variant="primary"
              size="sm"
              style={{ width: '100%' }}
            >
              Manage Notifications
            </LoadingButton>
          </div>
        </SectionCard>

        <SectionCard 
          title="Privacy & Data" 
          subtitle="Control your data"
          headerRight={
            <span className="insight-pill low">Private</span>
          }
        >
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#64748b', marginBottom: 16 }}>Manage data sharing preferences and privacy settings.</div>
            <LoadingButton
              onClick={() => navigate('/privacy')}
              disabled={busy !== null}
              variant="primary"
              size="sm"
              style={{ width: '100%' }}
            >
              Privacy Settings
            </LoadingButton>
          </div>
        </SectionCard>

        <SectionCard 
          title="Transaction Limits" 
          subtitle="Set your spending limits"
          headerRight={
            <span className="insight-pill low">Configured</span>
          }
        >
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#64748b', marginBottom: 16 }}>Set daily, weekly, and monthly transaction limits for security.</div>
            <LoadingButton
              onClick={() => navigate('/limits')}
              disabled={busy !== null}
              variant="primary"
              size="sm"
              style={{ width: '100%' }}
            >
              Manage Limits
            </LoadingButton>
          </div>
        </SectionCard>

        <SectionCard 
          title="Currency & Language" 
          subtitle="Personalize your experience"
          headerRight={
            <span className="insight-pill low">Set</span>
          }
        >
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#64748b', marginBottom: 16 }}>Choose your preferred currency and language settings.</div>
            <LoadingButton
              onClick={() => navigate('/preferences')}
              disabled={busy !== null}
              variant="primary"
              size="sm"
              style={{ width: '100%' }}
            >
              Preferences
            </LoadingButton>
          </div>
        </SectionCard>

        <SectionCard 
          title="Cards & Payment Methods" 
          subtitle="Manage payment options"
          headerRight={
            <span className="insight-pill low">Active</span>
          }
        >
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#64748b', marginBottom: 16 }}>Add or remove cards and manage payment methods.</div>
            <LoadingButton
              onClick={() => navigate('/cards')}
              disabled={busy !== null}
              variant="primary"
              size="sm"
              style={{ width: '100%' }}
            >
              Manage Cards
            </LoadingButton>
          </div>
        </SectionCard>

        <SectionCard 
          title="Statements & Reports" 
          subtitle="Track your finances"
          headerRight={
            <span className="insight-pill low">Available</span>
          }
        >
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#64748b', marginBottom: 16 }}>Download monthly statements and financial reports.</div>
            <LoadingButton
              onClick={() => navigate('/statements')}
              disabled={busy !== null}
              variant="primary"
              size="sm"
              style={{ width: '100%' }}
            >
              View Statements
            </LoadingButton>
          </div>
        </SectionCard>

        <SectionCard 
          title="Account Management" 
          subtitle="Account options"
          headerRight={
            <span className="insight-pill low">Settings</span>
          }
        >
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#64748b', marginBottom: 16 }}>Close account or manage account preferences.</div>
            <LoadingButton
              onClick={handleDeleteAccount}
              disabled={busy !== null}
              variant="ghost"
              size="sm"
              style={{ width: '100%' }}
            >
              Account Options
            </LoadingButton>
          </div>
        </SectionCard>
      </div>

      {showPinModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{
            background: modalCardBg, borderRadius: 24, padding: '32px 28px',
            maxWidth: 400, width: '100%', border: `1px solid ${modalBorderColor}`,
            boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)',
            position: 'relative',
          }}>
            <button onClick={resetPinModal} style={{
              position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
              color: modalMutedColor, cursor: 'pointer', padding: 4,
            }}><X size={20} /></button>

            {pinStep === 'done' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                }}>
                  <CheckCircle size={32} color="#10b981" />
                </div>
                <h3 style={{ color: modalTextColor, margin: '0 0 8px' }}>PIN Reset Successful</h3>
                <p style={{ color: modalMutedColor, margin: '0 0 24px', fontSize: 14 }}>
                  Your transaction PIN has been reset.
                </p>
                <button onClick={resetPinModal} style={{
                  width: '100%', padding: 14, borderRadius: 14,
                  background: 'linear-gradient(135deg, #0A9396, #059669)', border: 'none',
                  color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer',
                }}>Done</button>
              </div>
            ) : pinStep === 'otp' ? (
              <form onSubmit={handleSendPinOTP}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'linear-gradient(135deg, #0A9396, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                  }}>
                    <Shield size={28} color="white" />
                  </div>
                  <h3 style={{ color: modalTextColor, margin: '0 0 4px' }}>Reset Transaction PIN</h3>
                  <p style={{ color: modalMutedColor, margin: 0, fontSize: 14 }}>
                    An OTP will be sent to your registered email
                  </p>
                </div>
                {pinError && <div style={{ padding: 12, borderRadius: 10, background: isDark ? '#3b1c1c' : '#fef2f2', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{pinError}</div>}
                {pinMessage && <div style={{ padding: 12, borderRadius: 10, background: isDark ? '#064e3b' : '#d1fae5', color: '#10b981', fontSize: 13, marginBottom: 16 }}>{pinMessage}</div>}
                <button type="submit" disabled={pinLoading} style={{
                  width: '100%', padding: 14, borderRadius: 14,
                  background: pinLoading ? '#94a3b8' : 'linear-gradient(135deg, #0A9396, #059669)',
                  border: 'none', color: 'white', fontSize: 16, fontWeight: 600,
                  cursor: pinLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {pinLoading ? <><Loader size={18} className="animate-spin" /> Sending...</> : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPin}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'linear-gradient(135deg, #0A9396, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                  }}>
                    <KeyRound size={28} color="white" />
                  </div>
                  <h3 style={{ color: modalTextColor, margin: '0 0 4px' }}>Enter OTP & New PIN</h3>
                  <p style={{ color: modalMutedColor, margin: 0, fontSize: 14 }}>
                    Enter the OTP from your email and your new 4-digit PIN
                  </p>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: modalMutedColor, fontSize: 13, marginBottom: 6, display: 'block' }}>OTP Code</label>
                  <input type="text" placeholder="Enter 6-digit code" value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ ...modalInputStyle, textAlign: 'center', fontSize: 24, letterSpacing: 8 }} maxLength={6} required />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: modalMutedColor, fontSize: 13, marginBottom: 6, display: 'block' }}>New PIN</label>
                  <input type="password" placeholder="4-digit PIN" value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    style={modalInputStyle} maxLength={4} required />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: modalMutedColor, fontSize: 13, marginBottom: 6, display: 'block' }}>Confirm PIN</label>
                  <input type="password" placeholder="Repeat PIN" value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    style={modalInputStyle} maxLength={4} required />
                </div>
                {pinError && <div style={{ padding: 12, borderRadius: 10, background: isDark ? '#3b1c1c' : '#fef2f2', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{pinError}</div>}
                {pinMessage && <div style={{ padding: 12, borderRadius: 10, background: isDark ? '#064e3b' : '#d1fae5', color: '#10b981', fontSize: 13, marginBottom: 16 }}>{pinMessage}</div>}
                <button type="submit" disabled={pinLoading} style={{
                  width: '100%', padding: 14, borderRadius: 14,
                  background: pinLoading ? '#94a3b8' : 'linear-gradient(135deg, #0A9396, #059669)',
                  border: 'none', color: 'white', fontSize: 16, fontWeight: 600,
                  cursor: pinLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {pinLoading ? <><Loader size={18} className="animate-spin" /> Resetting...</> : 'Reset PIN'}
                </button>
                <button type="button" onClick={() => { setPinStep('otp'); setPinError(''); setPinMessage(''); }}
                  style={{ marginTop: 12, background: 'none', border: 'none', color: modalMutedColor, fontSize: 13, cursor: 'pointer', width: '100%', textDecoration: 'underline' }}>
                  Resend OTP
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {error ? <div className="toast toast-error" style={{ marginTop: 16 }}>{error}</div> : null}

          </AppShell>
  );
};

export default Settings;

