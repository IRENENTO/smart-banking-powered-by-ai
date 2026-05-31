import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { profileService, uploadService } from '../services/api';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:4000';

const parseJSON = (value: string | null) => {
    if (!value || value === 'undefined' || value === 'null') return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const Profile: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [completionLevel, setCompletionLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await profileService.getProfile();
        const { user, profile } = response.data || {};

        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setAccountNumber(user.account_number || '');
          
          let pic = user.profile_picture || '';
          if (pic && !pic.startsWith('http')) pic = `${API_BASE}${pic}`;
          setProfilePicture(pic);
          
          setProfileCompleted(user.profile_completed || false);
          
          let level = 0;
          if (user.email_verified) level += 33;
          if (user.profile_completed) level += 33;
          if (user.pin_set) level += 34;
          setCompletionLevel(level);
        }

        if (profile) {
          setDateOfBirth(profile.date_of_birth || '');
          setAddress(profile.address || '');
          setNationalId(profile.national_id || '');
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError(err.response?.data?.msg || 'Unable to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const response = await uploadService.uploadProfilePicture(file);
      if (response.data.success) {
        const fullUrl = `${API_BASE}${response.data.imageUrl}`;
        setProfilePicture(fullUrl);
        setMessage('Picture uploaded successfully. Remember to save changes.');
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      // Send relative path to backend
      const relativePic = profilePicture.replace(API_BASE, '');
      const response = await profileService.updateProfile({ name, email, dateOfBirth, address, nationalId, profilePicture: relativePic });
      const returned = response.data || {};
      setMessage('Profile updated successfully');
      setProfileCompleted(returned.user?.profile_completed ?? profileCompleted);

      const current = parseJSON(localStorage.getItem('user')) || {};
      localStorage.setItem('user', JSON.stringify({ ...current, ...(returned.user || {}) }));
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm('Delete your account and all profile data? This cannot be undone.');
    if (!confirmed) return;

    setSaving(true);
    setError('');

    try {
      await profileService.deleteProfile();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Unable to delete account');
    } finally {
      setSaving(false);
    }
  };

  const token = localStorage.getItem('token');
  
  if (!token) {
    return (
      <AppShell
        title="Profile"
        subtitle="Please login to view and manage your profile"
        videoSrc="/videos/banking.mp4"
      >
        <div style={{ display: 'grid', gap: 24, justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <SectionCard
            title="Login Required"
            subtitle="You need to be logged in to view your profile"
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ marginBottom: '20px', color: '#64748b' }}>
                Please login to access your profile and manage your personal information.
              </p>
              <LoadingButton
                onClick={() => navigate('/login')}
                variant="primary"
                size="md"
                style={{ minWidth: 120 }}
              >
                Login
              </LoadingButton>
            </div>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Profile"
      subtitle="Manage your profile, update identification details, and keep your account information current."
      videoSrc="/videos/banking.mp4"
    >
      <div style={{ display: 'grid', gap: 24 }}>
        <SectionCard
          title="Personal Details"
          subtitle="Your profile is key to loan and investment access"
          headerRight={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A9396' }}>{completionLevel}% Complete</div>
              <div style={{ width: 100, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${completionLevel}%`, height: '100%', background: completionLevel === 100 ? '#10b981' : '#0A9396' }} />
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #0A9396'
            }}>
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 32 }}>👤</span>
              )}
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#0B1F3A' }}>{name || 'User'}</h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Level: {completionLevel === 100 ? 'Verified Client' : 'Pending Verification'}</p>
            </div>
          </div>
          <div style={{ 
            background: 'rgba(10, 147, 150, 0.1)', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            border: '1px solid rgba(10, 147, 150, 0.2)'
          }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
              <strong>Current Information:</strong> Edit any field below to update your profile
            </div>
            {accountNumber && (
              <div style={{ fontSize: '14px', color: '#0B1F3A', marginBottom: '8px', padding: '8px 12px', background: 'rgba(10, 147, 150, 0.15)', borderRadius: 6, border: '1px dashed rgba(10, 147, 150, 0.3)' }}>
                <strong>Account ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: '#0A9396' }}>{accountNumber}</span>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Use this ID to receive transfers from other users</div>
              </div>
            )}
            {name && (
              <div style={{ fontSize: '12px', color: '#0B1F3A' }}>
                <strong>Name:</strong> {name}
              </div>
            )}
            {email && (
              <div style={{ fontSize: '12px', color: '#0B1F3A' }}>
                <strong>Email:</strong> {email}
              </div>
            )}
          </div>
          <form onSubmit={saveProfile} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8, background: '#f8fafc' }}
                  placeholder="Enter your full name"
                />
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8, background: '#f8fafc' }}
                  placeholder="Enter your email address"
                />
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Date of Birth</span>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }}
                  required
                />
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Address</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }}
                  placeholder="Enter your current address"
                  required
                />
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>National ID</span>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }}
                  placeholder="Enter your national ID"
                  required
                />
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Profile Picture</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ 
                      padding: 8, 
                      border: '1px solid #cbd5e1', 
                      borderRadius: 8, 
                      fontSize: '14px',
                      width: '100%'
                    }}
                  />
                  {uploading && <div style={{ fontSize: '12px', color: '#0A9396' }}>Uploading...</div>}
                </div>
              </label>
              </div>
            {error && <div className="toast toast-error">{error}</div>}
            {message && <div className="toast toast-success">{message}</div>}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <LoadingButton
                type="submit"
                disabled={saving}
                loading={saving}
                variant="primary"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </LoadingButton>
              <LoadingButton
                onClick={deleteAccount}
                disabled={saving}
                variant="ghost"
              >
                Delete Account
              </LoadingButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard 
          title="Need Help?"
          subtitle="Complete your profile to unlock loans and better AI recommendations"
          headerRight={
            <span className="insight-pill low">Notice</span>
          }
        >
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(10, 147, 150, 0.15)',
                color: '#0A9396',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                ✓
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Confirmed email</div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Keep your contact details up to date.</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                ◎
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Verified identity</div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Profile completion improves loan approval chances.</div>
              </div>
            </div>
          </div>
        </SectionCard>

        {error && (
          <div className="toast toast-error">
            {error}
          </div>
        )}

        {message && (
          <div className="toast toast-success">
            {message}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Profile;

