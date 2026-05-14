import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { profileService } from '../services/api';

const Settings: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
              style={{ width: '100%' }}
            >
              Security Settings
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

      {error ? <div className="toast toast-error" style={{ marginTop: 16 }}>{error}</div> : null}

          </AppShell>
  );
};

export default Settings;

