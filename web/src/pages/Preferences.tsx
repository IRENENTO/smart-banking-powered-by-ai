import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { settingsService } from '../services/settingsService';
import { Globe, Calendar, Palette, Clock } from 'lucide-react';

interface UserPreferences {
  currency: string;
  language: string;
  timezone: string;
  date_format: string;
  theme: string;
}

const Preferences: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: 'RWF',
    language: 'en',
    timezone: 'Africa/Kigali',
    date_format: 'DD/MM/YYYY',
    theme: 'light'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      try {
        const response = await settingsService.getUserPreferences();
        if (response.data.success) {
          setPreferences(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await settingsService.updateUserPreferences(preferences);
      if (response.data.success) {
        setSuccess('Preferences updated successfully');
        // Apply theme change immediately
        if (preferences.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (field: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const currencies = [
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'rw', name: 'Kinyarwanda' },
    { code: 'sw', name: 'Swahili' }
  ];

  const timezones = [
    { value: 'Africa/Kigali', name: 'Kigali (GMT+2)' },
    { value: 'Africa/Nairobi', name: 'Nairobi (GMT+3)' },
    { value: 'Africa/Johannesburg', name: 'Johannesburg (GMT+2)' },
    { value: 'Europe/London', name: 'London (GMT+0)' },
    { value: 'Europe/Paris', name: 'Paris (GMT+1)' },
    { value: 'America/New_York', name: 'New York (GMT-5)' }
  ];

  const dateFormats = [
    { value: 'DD/MM/YYYY', name: '31/12/2024' },
    { value: 'MM/DD/YYYY', name: '12/31/2024' },
    { value: 'YYYY-MM-DD', name: '2024-12-31' },
    { value: 'DD-MM-YYYY', name: '31-12-2024' }
  ];

  const themes = [
    { value: 'light', name: 'Light Mode', icon: '☀️' },
    { value: 'dark', name: 'Dark Mode', icon: '🌙' },
    { value: 'auto', name: 'Auto Mode', icon: '🌓' }
  ];

  return (
    <AppShell
      title="Preferences"
      subtitle="Customize your banking experience"
      videoSrc="/videos/banking.mp4"
    >
      <div style={{ display: 'grid', gap: 24 }}>
        {error && <div className="toast toast-error">{error}</div>}
        {success && <div className="toast toast-success">{success}</div>}

        <SectionCard 
          title="Regional Settings"
          subtitle="Configure your regional preferences"
          headerRight={
            <Globe size={24} style={{ color: '#0A9396' }} />
          }
        >
          <form onSubmit={handleSavePreferences} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Currency</span>
                  <select
                    value={preferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px'
                    }}
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                </label>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  This affects all displayed amounts
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Language</span>
                  <select
                    value={preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px'
                    }}
                  >
                    {languages.map(language => (
                      <option key={language.code} value={language.code}>
                        {language.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Changes interface language
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Timezone</span>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px'
                    }}
                  >
                    {timezones.map(timezone => (
                      <option key={timezone.value} value={timezone.value}>
                        {timezone.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Affects transaction timestamps
                </div>
              </div>
            </div>
          </form>
        </SectionCard>

        <SectionCard 
          title="Display Settings"
          subtitle="Customize how information is displayed"
          headerRight={
            <Palette size={24} style={{ color: '#0A9396' }} />
          }
        >
          <form onSubmit={handleSavePreferences} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Date Format</span>
                  <select
                    value={preferences.date_format}
                    onChange={(e) => handlePreferenceChange('date_format', e.target.value)}
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px'
                    }}
                  >
                    {dateFormats.map(format => (
                      <option key={format.value} value={format.value}>
                        {format.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Changes how dates appear
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Theme</span>
                  <select
                    value={preferences.theme}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px'
                    }}
                  >
                    {themes.map(theme => (
                      <option key={theme.value} value={theme.value}>
                        {theme.icon} {theme.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Changes app appearance
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
                {saving ? 'Saving...' : 'Save Preferences'}
              </LoadingButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard 
          title="Quick Actions"
          subtitle="Common preference shortcuts"
          headerRight={
            <Clock size={24} style={{ color: '#64748b' }} />
          }
        >
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <LoadingButton
              onClick={() => navigate('/language')}
              variant="secondary"
              style={{ width: '100%' }}
            >
              🌐 Change Language
            </LoadingButton>
            <LoadingButton
              onClick={() => navigate('/accessibility')}
              variant="secondary"
              style={{ width: '100%' }}
            >
              ♿ Accessibility Settings
            </LoadingButton>
            <LoadingButton
              onClick={() => navigate('/export-preferences')}
              variant="ghost"
              style={{ width: '100%' }}
            >
              📤 Export Preferences
            </LoadingButton>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
};

export default Preferences;
