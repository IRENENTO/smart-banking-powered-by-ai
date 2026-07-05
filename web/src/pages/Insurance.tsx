import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, Zap, Heart, Activity, Smartphone, Bell } from 'lucide-react';
import ThreeBody from '../components/ThreeBody';
import { useLanguage } from '../context/LanguageContext';

const Insurance: React.FC = () => {
  const { t } = useLanguage();
  const [riskForm, setRiskForm] = useState({
    age: '',
    smoking: 'no',
    existingConditions: 'none',
    bmi: 'normal'
  });
  const [premiumEstimate, setPremiumEstimate] = useState<{ monthly: number; annual: number } | null>(null);
  const [calculating, setCalculating] = useState(false);

  const calculatePremium = () => {
    setCalculating(true);
    const age = parseInt(riskForm.age) || 30;
    const baseRate = 25000;
    const ageFactor = age > 50 ? 1.8 : age > 35 ? 1.3 : 1.0;
    const smokingFactor = riskForm.smoking === 'yes' ? 1.6 : 1.0;
    const conditionFactor = riskForm.existingConditions === 'chronic' ? 1.5 : riskForm.existingConditions === 'minor' ? 1.2 : 1.0;
    const bmiFactor = riskForm.bmi === 'overweight' ? 1.25 : riskForm.bmi === 'obese' ? 1.5 : 1.0;
    const monthly = Math.round(baseRate * ageFactor * smokingFactor * conditionFactor * bmiFactor);
    setTimeout(() => {
      setPremiumEstimate({ monthly, annual: monthly * 12 });
      setCalculating(false);
    }, 800);
  };

  const products = [
    {
      icon: Heart,
      title: 'Life Insurance',
      description: 'Affordable life insurance with AI-based risk assessment. Protect your loved ones with competitive premiums.',
      features: ['Cover up to RWF 50,000,000', 'AI-based risk pricing', 'Instant approval', 'Flexible premium terms']
    },
    {
      icon: Activity,
      title: 'Health Insurance',
      description: 'Comprehensive health coverage with AI predictive care. Premiums based on your actual health profile.',
      features: ['Outpatient & inpatient cover', 'AI health monitoring', 'No waiting period', 'Nationwide coverage']
    },
    {
      icon: Smartphone,
      title: 'Asset Protection',
      description: 'Protect your valuables and assets with intelligent insurance. AI adjusts coverage based on your lifestyle.',
      features: ['Phone & electronics cover', 'Home contents insurance', 'Vehicle insurance', 'Instant claim processing']
    }
  ];

  return (
    <PageLayout
      title={t('insurance.heroTitle')}
      subtitle={t('insurance.heroDesc')}
    >
      <div style={{ display: 'grid', gap: 40 }}>
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #0A9396, #059669)',
            color: 'white',
            padding: '40px',
            borderRadius: 16,
            textAlign: 'center'
          }}
        >
          <Shield size={48} style={{ marginBottom: 16, opacity: 0.9 }} />
          <h2 style={{ margin: '0 0 12px', fontSize: '28px' }}>{t('insurance.heroTitle')}</h2>
          <p style={{ lineHeight: 1.8, fontSize: '16px', maxWidth: 700, margin: '0 auto', opacity: 0.9 }}>
            {t('insurance.heroDesc')}
          </p>
        </motion.div>

        {/* Products */}
        <div>
          <h2 style={{ color: '#0B1F3A', marginBottom: 24 }}>Insurance Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {products.map((product, idx) => {
              const Icon = product.icon;
              return (
                <motion.div
                  key={product.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(10, 147, 150, 0.08)',
                    border: '1px solid rgba(10, 147, 150, 0.1)'
                  }}
                >
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #0A9396, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <Icon size={24} color="white" />
                  </div>
                  <h3 style={{ color: '#0B1F3A', marginTop: 0, marginBottom: 12 }}>{product.title}</h3>
                  <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>{product.description}</p>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {product.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: '#475569' }}>
                        <span style={{ color: '#10b981' }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* AI Risk Assessment & Premium Calculator */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'white',
              padding: '32px',
              borderRadius: 16,
              border: '1px solid rgba(10, 147, 150, 0.1)'
            }}
          >
            <h3 style={{ color: '#0B1F3A', marginTop: 0, marginBottom: 8 }}>{t('insurance.riskBased')}</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 24, fontSize: '14px' }}>
              {t('insurance.riskBasedDesc')}
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #f0f9ff)',
              padding: '24px',
              borderRadius: 12,
              border: '1px solid rgba(10, 147, 150, 0.1)'
            }}>
              <h4 style={{ color: '#0A9396', marginTop: 0, marginBottom: 16 }}>{t('insurance.howItWorks')}</h4>
              <ol style={{ color: '#64748b', lineHeight: 2.2, marginBottom: 0, paddingLeft: 20 }}>
                <li>{t('insurance.step1')}</li>
                <li>{t('insurance.step2')}</li>
                <li>{t('insurance.step3')}</li>
                <li>{t('insurance.step4')}</li>
              </ol>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: 'white',
              padding: '32px',
              borderRadius: 16,
              border: '1px solid rgba(10, 147, 150, 0.1)'
            }}
          >
            <h3 style={{ color: '#0B1F3A', marginTop: 0, marginBottom: 8 }}>Premium Calculator</h3>
            <p style={{ color: '#64748b', marginBottom: 20, fontSize: '14px' }}>
              Get an instant estimate based on your profile
            </p>
            <div style={{ display: 'grid', gap: 14 }}>
              <label style={{ display: 'grid', gap: 4, fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                Age
                <input
                  type="number"
                  value={riskForm.age}
                  onChange={(e) => setRiskForm({ ...riskForm, age: e.target.value })}
                  placeholder="e.g. 30"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </label>
              <label style={{ display: 'grid', gap: 4, fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                Smoking
                <select
                  value={riskForm.smoking}
                  onChange={(e) => setRiskForm({ ...riskForm, smoking: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="no">Non-smoker</option>
                  <option value="yes">Smoker</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 4, fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                Medical History
                <select
                  value={riskForm.existingConditions}
                  onChange={(e) => setRiskForm({ ...riskForm, existingConditions: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="none">No conditions</option>
                  <option value="minor">Minor conditions</option>
                  <option value="chronic">Chronic conditions</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 4, fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                BMI Category
                <select
                  value={riskForm.bmi}
                  onChange={(e) => setRiskForm({ ...riskForm, bmi: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="normal">Normal</option>
                  <option value="overweight">Overweight</option>
                  <option value="obese">Obese</option>
                </select>
              </label>
              <button
                onClick={calculatePremium}
                disabled={calculating}
                style={{
                  padding: '14px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #0A9396, #059669)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: 8,
                  opacity: calculating ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {calculating ? <><ThreeBody size={16} color="#fff" /> Calculating...</> : 'Calculate Premium'}
              </button>
            </div>

            {premiumEstimate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  marginTop: 20,
                  padding: '20px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  border: '1px solid #bbf7d0'
                }}
              >
                <div style={{ fontSize: '13px', color: '#059669', fontWeight: 600, marginBottom: 12 }}>
                  Estimated Premium
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#16a34a' }}>Monthly</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A' }}>
                      RWF {premiumEstimate.monthly.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#16a34a' }}>Annual</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A' }}>
                      RWF {premiumEstimate.annual.toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Stay Updated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, #0B1F3A, #0A9396)',
            color: 'white',
            padding: '40px',
            borderRadius: 16,
            textAlign: 'center'
          }}
        >
          <Bell size={32} style={{ marginBottom: 16, opacity: 0.8 }} />
          <h2 style={{ margin: '0 0 8px', fontSize: '24px' }}>{t('mobile.notifyTitle')}</h2>
          <p style={{ lineHeight: 1.6, marginBottom: 24, opacity: 0.8, maxWidth: 500, margin: '0 auto 24px' }}>
            {t('insurance.stayUpdated')}
          </p>
          <div style={{ display: 'flex', gap: 12, maxWidth: 440, margin: '0 auto' }}>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: 10,
                border: 'none',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              style={{
                padding: '14px 28px',
                borderRadius: 10,
                border: 'none',
                background: 'white',
                color: '#0A9396',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e0f2fe'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
            >
              {t('common.notifyMe')}
            </button>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Insurance;
