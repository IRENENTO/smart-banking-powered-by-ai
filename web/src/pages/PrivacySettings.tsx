import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { settingsService } from '../services/settingsService';
import { Shield, Eye, Lock, Database, Globe } from 'lucide-react';

interface PrivacySettings {
  data_sharing: boolean;
  analytics_consent: boolean;
  marketing_consent: boolean;
  public_profile: boolean;
  location_tracking: boolean;
}

const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    data_sharing: false,
    analytics_consent: true,
    marketing_consent: false,
    public_profile: false,
    location_tracking: false
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
        const response = await settingsService.getPrivacySettings();
        if (response.data.success) {
          setSettings(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to load privacy settings');
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
      const response = await settingsService.updatePrivacySettings(settings);
      if (response.data.success) {
        setSuccess('Privacy settings updated successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (field: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AppShell
      title="Privacy Settings"
      subtitle="Control your data and privacy preferences"
      videoSrc="/videos/banking.mp4"
    >
      <div style={{ display: 'grid', gap: 24 }}>
        {error && <div className="toast toast-error">{error}</div>}
        {success && <div className="toast toast-success">{success}</div>}

        <SectionCard 
          title="Data Privacy"
          subtitle="Manage how your personal data is used and shared"
          headerRight={
            <Shield size={24} style={{ color: '#0A9396' }} />
          }
        >
          <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Database size={20} style={{ color: '#0A9396' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Data Sharing</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Share anonymous usage data to improve services</div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.data_sharing}
                    onChange={(e) => handleSettingChange('data_sharing', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.data_sharing ? '#0A9396' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.data_sharing ? 27 : 3,
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
                  <Eye size={20} style={{ color: '#0A9396' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Analytics Consent</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Help improve our services with usage analytics</div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.analytics_consent}
                    onChange={(e) => handleSettingChange('analytics_consent', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.analytics_consent ? '#0A9396' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.analytics_consent ? 27 : 3,
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
                  <Globe size={20} style={{ color: '#f59e0b' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Public Profile</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Make your profile visible to other users</div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.public_profile}
                    onChange={(e) => handleSettingChange('public_profile', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.public_profile ? '#f59e0b' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.public_profile ? 27 : 3,
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
                  <Globe size={20} style={{ color: '#f59e0b' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Location Tracking</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Allow location-based services</div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.location_tracking}
                    onChange={(e) => handleSettingChange('location_tracking', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.location_tracking ? '#f59e0b' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.location_tracking ? 27 : 3,
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
          title="Regulatory Compliance"
          subtitle="How we protect your data in Rwanda"
          headerRight={
            <Shield size={24} style={{ color: '#059669' }} />
          }
        >
          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            {[
              { label: 'Data Protection Law', desc: 'Fully compliant with Rwanda Law N° 058/2021 relating to the protection of personal data and privacy.' },
              { label: 'Data Locality', desc: 'All sensitive financial data is stored securely within designated regional infrastructure.' },
              { label: 'AI Transparency', desc: 'Our AI insights are generated using anonymized data sets to ensure individual privacy.' }
            ].map((item, i) => (
              <div key={i} style={{ padding: '12px', borderLeft: '3px solid #059669', background: '#f0fdf4', borderRadius: '0 8px 8px 0' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#065f46', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: '13px', color: '#047857' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard 
          title="Marketing Preferences"
          subtitle="Control promotional communications"
          headerRight={
            <Globe size={24} style={{ color: '#f59e0b' }} />
          }
        >
          <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#fef3c7', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Globe size={20} style={{ color: '#f59e0b' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Marketing Consent</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Receive promotional offers and updates</div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={settings.marketing_consent}
                    onChange={(e) => handleSettingChange('marketing_consent', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: settings.marketing_consent ? '#f59e0b' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: settings.marketing_consent ? 27 : 3,
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
          title="Data Management"
          subtitle="Download or delete your personal data"
          headerRight={
            <Lock size={24} style={{ color: '#64748b' }} />
          }
        >
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <LoadingButton
              onClick={() => navigate('/download-data')}
              variant="secondary"
              style={{ width: '100%' }}
            >
              Download My Data
            </LoadingButton>
            <LoadingButton
              onClick={() => navigate('/delete-data')}
              variant="ghost"
              style={{ width: '100%' }}
            >
              Request Data Deletion
            </LoadingButton>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
};

export default PrivacySettings;
