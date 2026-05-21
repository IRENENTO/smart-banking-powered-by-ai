import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { settingsService } from '../services/settingsService';
import { Globe, Calendar, Palette, Clock, Accessibility, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface UserPreferences {
  currency: string;
  language: string;
  timezone: string;
  date_format: string;
  theme: string;
  large_text: boolean;
  high_contrast: boolean;
}

const Preferences: React.FC = () => {
  const { setLanguage: setAppLanguage } = useLanguage();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: 'RWF',
    language: 'en',
    timezone: 'Africa/Kigali',
    date_format: 'DD/MM/YYYY',
    theme: 'light',
    large_text: false,
    high_contrast: false
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
          // Merge with defaults in case new fields (accessibility) are missing from DB
          setPreferences(prev => ({ ...prev, ...response.data.data }));
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
        
        // Apply Language change immediately
        if (preferences.language === 'rw' || preferences.language === 'en' || preferences.language === 'fr') {
          setAppLanguage(preferences.language as 'rw' | 'en' | 'fr');
        }

        // Apply theme change immediately
        if (preferences.theme !== 'auto') {
            const root = window.document.documentElement;
            if (preferences.theme !== currentTheme) {
                toggleTheme();
            }
        }

        // Apply Accessibility changes
        const body = document.body;
        if (preferences.large_text) {
          body.style.fontSize = '1.2rem';
        } else {
          body.style.fontSize = '';
        }

        if (preferences.high_contrast) {
          body.classList.add('high-contrast');
        } else {
          body.classList.remove('high-contrast');
        }

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (field: keyof UserPreferences, value: any) => {
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
    { code: 'rw', name: 'Kinyarwanda' }
  ];

  const themes = [
    { value: 'light', name: 'Light Mode', icon: '☀️' },
    { value: 'dark', name: 'Dark Mode', icon: '🌙' }
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

        <form onSubmit={handleSavePreferences} style={{ display: 'grid', gap: 24 }}>
          <SectionCard 
            title="Regional Settings"
            subtitle="Configure your regional preferences"
            headerRight={
              <Globe size={24} style={{ color: '#0A9396' }} />
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginTop: 16 }}>
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
                    <option value="Africa/Kigali">Kigali (GMT+2)</option>
                    <option value="Africa/Nairobi">Nairobi (GMT+3)</option>
                    <option value="Europe/London">London (GMT+0)</option>
                  </select>
                </label>
              </div>
            </div>
          </SectionCard>

          <SectionCard 
            title="Display & Appearance"
            subtitle="Customize the look and feel"
            headerRight={
              <Palette size={24} style={{ color: '#0A9396' }} />
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginTop: 16 }}>
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
              </div>

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
                    <option value="DD/MM/YYYY">31/12/2024</option>
                    <option value="MM/DD/YYYY">12/31/2024</option>
                    <option value="YYYY-MM-DD">2024-12-31</option>
                  </select>
                </label>
              </div>
            </div>
          </SectionCard>

          <SectionCard 
            title="Accessibility"
            subtitle="Make the app easier to use"
            headerRight={
              <Accessibility size={24} style={{ color: '#0A9396' }} />
            }
          >
            <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>Large Text</div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Increase font size for better readability</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={preferences.large_text}
                    onChange={(e) => handlePreferenceChange('large_text', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: preferences.large_text ? '#0A9396' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: preferences.large_text ? 27 : 3,
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
                  <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>High Contrast</div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Increase contrast for better visibility</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={preferences.high_contrast}
                    onChange={(e) => handlePreferenceChange('high_contrast', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 50,
                    height: 26,
                    background: preferences.high_contrast ? '#0A9396' : '#cbd5e1',
                    borderRadius: 13,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: preferences.high_contrast ? 27 : 3,
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

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <LoadingButton
              type="submit"
              disabled={saving}
              loading={saving}
              variant="primary"
              style={{ minWidth: '200px', padding: '16px' }}
            >
              {saving ? 'Saving...' : 'Save All Preferences'}
            </LoadingButton>
          </div>
        </form>

        <SectionCard 
          title="Interface Preview"
          subtitle="How your choices affect the application"
          headerRight={
            <Palette size={24} style={{ color: '#0A9396' }} />
          }
        >
          <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
            <div style={{ 
              padding: '30px', 
              background: preferences.theme === 'dark' ? '#0B1F3A' : '#f8fafc', 
              border: preferences.high_contrast ? '3px solid black' : '1px solid #e2e8f0', 
              borderRadius: 16, 
              textAlign: 'center',
              fontSize: preferences.large_text ? '1.2em' : '1em'
            }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: 8, fontWeight: 700 }}>LIVE PREVIEW</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: preferences.theme === 'dark' ? 'white' : '#0B1F3A' }}>
                {new Intl.NumberFormat(preferences.language === 'fr' ? 'fr-RW' : preferences.language === 'rw' ? 'rw-RW' : 'en-RW', {
                  style: 'currency',
                  currency: preferences.currency,
                  minimumFractionDigits: 0
                }).format(1250000)}
              </div>
              <div style={{ fontSize: '16px', color: '#64748b', marginTop: 8, fontWeight: 500 }}>
                {new Date().toLocaleDateString(preferences.language, { dateStyle: 'full' })}
              </div>
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 8 }}>
                <span style={{ padding: '4px 12px', background: '#0A9396', color: 'white', borderRadius: 20, fontSize: '12px', fontWeight: 700 }}>SMART BANKING</span>
                <span style={{ padding: '4px 12px', background: '#059669', color: 'white', borderRadius: 20, fontSize: '12px', fontWeight: 700 }}>PREMIUM</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
};

export default Preferences;
