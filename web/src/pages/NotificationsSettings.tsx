import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { settingsService } from '../services/settingsService';
import { Bell, Mail, Smartphone, MessageSquare, Calendar } from 'lucide-react';

interface NotificationSettings {
  email_transactions: boolean;
  sms_transactions: boolean;
  email_promotions: boolean;
  sms_promotions: boolean;
  push_notifications: boolean;
  weekly_summary: boolean;
}

const NotificationsSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_transactions: true,
    sms_transactions: false,
    email_promotions: false,
    sms_promotions: false,
    push_notifications: true,
    weekly_summary: true
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
        const response = await settingsService.getNotificationSettings();
        if (response.data.success) {
          setSettings(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to load notification settings');
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
      const response = await settingsService.updateNotificationSettings(settings);
      if (response.data.success) {
        setSuccess('Notification preferences updated successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to update notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (field: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AppShell
      title="Notification Settings"
      subtitle="Configure how you receive account and transaction notifications"
      videoSrc="/videos/banking.mp4"
    >
      <div style={{ display: 'grid', gap: 24 }}>
        {error && <div className="toast toast-error">{error}</div>}
        {success && <div className="toast toast-success">{success}</div>}

        <SectionCard 
          title="Transaction Notifications"
          subtitle="Get notified about your account activity"
          headerRight={
            <Bell size={24} style={{ color: '#0A9396' }} />
          }
        >
          <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Mail size={20} style={{ color: '#0A9396' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Email Notifications</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Receive transaction alerts via email</div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.email_transactions}
                    onChange={(e) => handleSettingChange('email_transactions', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.email_transactions ? '#0A9396' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.email_transactions ? 27 : 3,
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Smartphone size={20} style={{ color: '#0A9396' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>SMS Notifications</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Receive transaction alerts via SMS</div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.sms_transactions}
                    onChange={(e) => handleSettingChange('sms_transactions', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.sms_transactions ? '#0A9396' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.sms_transactions ? 27 : 3,
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

            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <MessageSquare size={20} style={{ color: '#f59e0b' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Push Notifications</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Receive real-time app notifications</div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.push_notifications}
                    onChange={(e) => handleSettingChange('push_notifications', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.push_notifications ? '#0A9396' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.push_notifications ? 27 : 3,
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Calendar size={20} style={{ color: '#0A9396' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Weekly Summary</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Get weekly account activity summary</div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.weekly_summary}
                    onChange={(e) => handleSettingChange('weekly_summary', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.weekly_summary ? '#0A9396' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.weekly_summary ? 27 : 3,
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
          title="Notification Preview"
          subtitle="How alerts will appear on your device"
          headerRight={
            <Smartphone size={24} style={{ color: '#0A9396' }} />
          }
        >
          <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
            <div style={{ padding: '16px', background: 'linear-gradient(135deg, #0B1F3A 0%, #1e293b 100%)', borderRadius: 16, color: 'white', maxWidth: '300px', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '10px', opacity: 0.6 }}>
                <span>SMART BANKING</span>
                <span>Just now</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: 4 }}>Transaction Alert</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>RWF 50,000 deposited to your account ACC882931 from MTN MoMo.</div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
              Sample notification for transaction alerts
            </div>
          </div>
        </SectionCard>

        <SectionCard 
          title="Marketing Communications"
          subtitle="Control promotional messages and offers"
          headerRight={
            <MessageSquare size={24} style={{ color: '#f59e0b' }} />
          }
        >
          <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#fef3c7', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Mail size={20} style={{ color: '#f59e0b' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Email Promotions</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Receive special offers via email</div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.email_promotions}
                    onChange={(e) => handleSettingChange('email_promotions', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.email_promotions ? '#f59e0b' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.email_promotions ? 27 : 3,
                      width: 20,
                      height: 20,
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'left 0.3s'
                    }} />
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#fef3c7', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Smartphone size={20} style={{ color: '#f59e0b' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>SMS Promotions</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Receive special offers via SMS</div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.sms_promotions}
                    onChange={(e) => handleSettingChange('sms_promotions', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.sms_promotions ? '#f59e0b' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.sms_promotions ? 27 : 3,
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
      </div>
    </AppShell>
  );
};

export default NotificationsSettings;
