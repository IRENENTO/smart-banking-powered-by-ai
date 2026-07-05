import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Shield, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import ThreeBody from '../components/ThreeBody';
import { authService, otpService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

type Step = 'email' | 'otp' | 'reset' | 'done';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const bgColor = isDark ? '#0B1F3A' : '#f8fafc';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? 'rgba(15,23,42,0.8)' : 'white';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 14, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
    background: isDark ? '#0f172a' : 'white', color: textColor, fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Enter your email address'); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      await otpService.sendOTP(email);
      setMessage('OTP sent to your email');
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to send OTP. Check your email.');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) { setError('Enter the OTP code'); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      await otpService.verifyOTP(email, otp);
      setMessage('Email verified');
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Invalid OTP code');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      await authService.resetPassword(email, otp, password);
      setMessage('Password reset successful!');
      setStep('done');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: bgColor, padding: 20,
  };

  const cardStyle: React.CSSProperties = {
    background: cardBg, borderRadius: 24, padding: '40px 32px',
    maxWidth: 420, width: '100%', border: `1px solid ${borderColor}`,
    boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.06)',
  };

  if (step === 'done') {
    return (
      <div style={containerStyle}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={cardStyle as any}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={32} color="#10b981" />
            </div>
            <h2 style={{ color: textColor, margin: '0 0 8px' }}>Password Reset!</h2>
            <p style={{ color: mutedColor, margin: '0 0 24px' }}>Your password has been reset successfully.</p>
            <button onClick={() => navigate('/login')}
              style={{
                width: '100%', padding: 14, borderRadius: 14,
                background: 'linear-gradient(135deg, #0A9396, #059669)', border: 'none',
                color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer',
              }}
            >Sign In</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle as any}>
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, color: mutedColor, textDecoration: 'none', fontSize: 13, marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #0A9396, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            {step === 'email' ? <Mail size={28} color="white" /> :
             step === 'otp' ? <Shield size={28} color="white" /> :
             <KeyRound size={28} color="white" />}
          </div>
          <h2 style={{ color: textColor, margin: '0 0 4px' }}>
            {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Verify OTP' : 'New Password'}
          </h2>
          <p style={{ color: mutedColor, margin: 0, fontSize: 14 }}>
            {step === 'email' ? 'Enter your email to receive a reset code' :
             step === 'otp' ? `Enter the code sent to ${email}` :
             'Create your new password'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendOTP}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: mutedColor, fontSize: 13, marginBottom: 6, display: 'block' }}>Email Address</label>
              <input type="email" placeholder="your@email.com" value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle} required />
            </div>
            {error && <div style={{ padding: 12, borderRadius: 10, background: isDark ? '#3b1c1c' : '#fef2f2', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            {message && <div style={{ padding: 12, borderRadius: 10, background: isDark ? '#064e3b' : '#d1fae5', color: '#10b981', fontSize: 13, marginBottom: 16 }}>{message}</div>}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: 14, borderRadius: 14,
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0A9396, #059669)',
                border: 'none', color: 'white', fontSize: 16, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >{loading ? <><ThreeBody size={18} color="#fff" /> Sending...</> : 'Send Reset Code'}</button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: mutedColor, fontSize: 13, marginBottom: 6, display: 'block' }}>OTP Code</label>
              <input type="text" placeholder="Enter 6-digit code" value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ ...inputStyle, textAlign: 'center', fontSize: 24, letterSpacing: 8 }} maxLength={6} required />
            </div>
            {error && <div style={{ padding: 12, borderRadius: 10, background: isDark ? '#3b1c1c' : '#fef2f2', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            {message && <div style={{ padding: 12, borderRadius: 10, background: isDark ? '#064e3b' : '#d1fae5', color: '#10b981', fontSize: 13, marginBottom: 16 }}>{message}</div>}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: 14, borderRadius: 14,
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0A9396, #059669)',
                border: 'none', color: 'white', fontSize: 16, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >{loading ? <><ThreeBody size={18} color="#fff" /> Verifying...</> : 'Verify Code'}</button>
            <button type="button" onClick={() => { setStep('email'); setError(''); setMessage(''); }}
              style={{ marginTop: 12, background: 'none', border: 'none', color: mutedColor, fontSize: 13, cursor: 'pointer', width: '100%', textDecoration: 'underline' }}>
              Change email
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: mutedColor, fontSize: 13, marginBottom: 6, display: 'block' }}>New Password</label>
              <input type="password" placeholder="Min 6 characters" value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle} required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: mutedColor, fontSize: 13, marginBottom: 6, display: 'block' }}>Confirm Password</label>
              <input type="password" placeholder="Repeat new password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={inputStyle} required />
            </div>
            {error && <div style={{ padding: 12, borderRadius: 10, background: isDark ? '#3b1c1c' : '#fef2f2', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            {message && <div style={{ padding: 12, borderRadius: 10, background: isDark ? '#064e3b' : '#d1fae5', color: '#10b981', fontSize: 13, marginBottom: 16 }}>{message}</div>}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: 14, borderRadius: 14,
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0A9396, #059669)',
                border: 'none', color: 'white', fontSize: 16, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >{loading ? <><ThreeBody size={18} color="#fff" /> Resetting...</> : 'Reset Password'}</button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
