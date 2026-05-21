import React, { useState } from 'react';
import { securityService } from '../services/api';
import { Shield, X } from 'lucide-react';

interface PinModalProps {
  action: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PinModal: React.FC<PinModalProps> = ({ action, onSuccess, onCancel }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDigit = (digit: string) => {
    if (loading) return;
    setError('');
    const emptyIdx = pin.findIndex(d => d === '');
    if (emptyIdx === -1) return;
    const newPin = [...pin];
    newPin[emptyIdx] = digit;
    setPin(newPin);
    if (emptyIdx === 3) {
      verifyPin(newPin.join(''));
    }
  };

  const handleBackspace = () => {
    if (loading) return;
    const filledIdx = pin.map((d, i) => d !== '' ? i : -1).filter(i => i !== -1).pop();
    if (filledIdx === undefined) return;
    const newPin = [...pin];
    newPin[filledIdx] = '';
    setPin(newPin);
  };

  const verifyPin = async (fullPin: string) => {
    setLoading(true);
    try {
      await securityService.verifyPin(fullPin);
      setPin(['', '', '', '']);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Incorrect PIN. Try again.');
      setPin(['', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#0f172a', borderRadius: 24, padding: '32px 28px',
        width: 320, textAlign: 'center', border: '1px solid #1e293b',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>
        <button onClick={onCancel} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0A9396, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Shield size={24} color="white" />
        </div>

        <h3 style={{ color: 'white', margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Enter PIN</h3>
        <p style={{ color: '#94a3b8', margin: '0 0 20px', fontSize: 13 }}>{action}</p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
          {pin.map((d, i) => (
            <div key={i} style={{
              width: 48, height: 56, borderRadius: 14,
              border: `2px solid ${d ? '#0A9396' : '#1e293b'}`,
              background: d ? 'rgba(10,147,150,0.1)' : '#0B1527',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: 'white',
              transition: 'all 0.15s',
            }}>
              {d ? '•' : ''}
            </div>
          ))}
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 12px' }}>{error}</p>}
        {loading && <p style={{ color: '#0A9396', fontSize: 12, margin: '0 0 12px' }}>Verifying...</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 240, margin: '0 auto' }}>
          {['1','2','3','4','5','6','7','8','9'].map(d => (
            <button key={d} onClick={() => handleDigit(d)}
              style={{
                height: 50, borderRadius: 14, border: '1px solid #1e293b',
                background: '#0B1527', color: 'white', fontSize: 20, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
              onMouseLeave={e => e.currentTarget.style.background = '#0B1527'}
            >{d}</button>
          ))}
          <div />
          <button onClick={() => handleDigit('0')}
            style={{
              height: 50, borderRadius: 14, border: '1px solid #1e293b',
              background: '#0B1527', color: 'white', fontSize: 20, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
            onMouseLeave={e => e.currentTarget.style.background = '#0B1527'}
          >0</button>
          <button onClick={handleBackspace}
            style={{
              height: 50, borderRadius: 14, border: '1px solid #1e293b',
              background: '#0B1527', color: '#94a3b8', fontSize: 14,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
            onMouseLeave={e => e.currentTarget.style.background = '#0B1527'}
          >⌫</button>
        </div>

        <button onClick={onCancel} style={{
          marginTop: 16, background: 'none', border: 'none',
          color: '#64748b', fontSize: 12, cursor: 'pointer', textDecoration: 'underline',
        }}>Cancel</button>
      </div>
    </div>
  );
};

export default PinModal;
