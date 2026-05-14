import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { settingsService } from '../services/settingsService';
import { Shield, Lock, Key, Eye, Bell } from 'lucide-react';

interface SecuritySettings {
  two_factor_enabled: boolean;
  sms_alerts: boolean;
  email_alerts: boolean;
  login_notifications: boolean;
  session_timeout: number;
}

const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    sms_alerts: true,
    email_alerts: true,
    login_notifications: true,
    session_timeout: 30
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const response = await settingsService.getSecuritySettings();
        if (response.data.success) {
          setSettings(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to load security settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await settingsService.updateSecuritySettings(settings);
      if (response.data.success) {
        setSuccess('Security settings updated successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to update security settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (field: keyof SecuritySettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AppShell
      title="Security Settings"
      subtitle="Manage your account security and authentication preferences"
      videoSrc="/videos/banking.mp4"
    >
      <div style={{ display: 'grid', gap: 24 }}>
        {error && <div className="toast toast-error">{error}</div>}
        {success && <div className="toast toast-success">{success}</div>}

        <SectionCard 
          title="Two-Factor Authentication"
          subtitle="Add an extra layer of security to your account"
          headerRight={
            <Shield size={24} style={{ color: '#0A9396' }} />
          }
        >
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Two-Factor Authentication</div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Require 2FA code when logging in</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block' }}>
                <input
                  type="checkbox"
                  checked={settings.two_factor_enabled}
                  onChange={(e) => handleSettingChange('two_factor_enabled', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <div style={{
                  width: 50,
                  height: 26,
                  background: settings.two_factor_enabled ? '#0A9396' : '#cbd5e1',
                  borderRadius: 13,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 3,
                    left: settings.two_factor_enabled ? 27 : 3,
                    width: 20,
                    height: 20,
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.3s'
                  }} />
                </div>
              </label>
            </div>
          </div>
        </SectionCard>

        <SectionCard 
          title="Alerts & Notifications"
          subtitle="Configure how you receive security notifications"
          headerRight={
            <Bell size={24} style={{ color: '#0A9396' }} />
          }
        >
          <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>SMS Alerts</div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Receive security alerts via SMS</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.sms_alerts}
                    onChange={(e) => handleSettingChange('sms_alerts', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.sms_alerts ? '#0A9396' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.sms_alerts ? 27 : 3,
                      width: 20,
                      height: 20,
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'left 0.3s'
                    }} />
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Email Alerts</div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Receive security alerts via email</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.email_alerts}
                    onChange={(e) => handleSettingChange('email_alerts', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.email_alerts ? '#0A9396' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.email_alerts ? 27 : 3,
                      width: 20,
                      height: 20,
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'left 0.3s'
                    }} />
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Login Notifications</div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Get notified when someone logs into your account</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.login_notifications}
                    onChange={(e) => handleSettingChange('login_notifications', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.login_notifications ? '#0A9396' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.login_notifications ? 27 : 3,
                      width: 20,
                      height: 20,
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'left 0.3s'
                    }} />
                  </div>
                </label>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Session Timeout (minutes)</span>
                  <select
                    value={settings.session_timeout}
                    onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px'
                    }}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={240}>4 hours</option>
                  </select>
                </label>
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
                {saving ? 'Saving...' : 'Save Changes'}
              </LoadingButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard 
          title="Password Management"
          subtitle="Keep your account secure with strong passwords"
          headerRight={
            <Lock size={24} style={{ color: '#0A9396' }} />
          }
        >
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <LoadingButton
              onClick={() => navigate('/change-password')}
              variant="secondary"
              style={{ width: '100%' }}
            >
              Change Password
            </LoadingButton>
            <LoadingButton
              onClick={() => navigate('/forgot-password')}
              variant="ghost"
              style={{ width: '100%' }}
            >
              Forgot Password
            </LoadingButton>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
};

export default SecuritySettings;
