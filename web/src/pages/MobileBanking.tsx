import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Smartphone, QrCode, Camera, Fingerprint, Zap, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const MobileBanking: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: QrCode,
      title: t('mobile.qrPayments'),
      description: t('mobile.qrPaymentsDesc')
    },
    {
      icon: Camera,
      title: t('mobile.mobileDeposits'),
      description: t('mobile.mobileDepositsDesc')
    },
    {
      icon: Fingerprint,
      title: t('mobile.biometric'),
      description: t('mobile.biometricDesc')
    },
    {
      icon: Zap,
      title: t('mobile.instantTransfers'),
      description: t('mobile.instantTransfersDesc')
    }
  ];

  return (
    <PageLayout
      title={t('mobile.title')}
      subtitle={t('mobile.subtitle')}
    >
      <div style={{ display: 'grid', gap: 40 }}>
        {/* Coming Soon Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #0A9396, #4ECDC4)',
            color: 'white',
            padding: '60px 40px',
            borderRadius: 24,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '-30%',
              right: '-10%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(40px)'
            }}
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              backdropFilter: 'blur(10px)'
            }}>
              <Smartphone size={40} color="white" />
            </div>
            <h2 style={{
              fontSize: '36px',
              margin: '0 0 12px',
              fontWeight: 800,
              letterSpacing: '-0.5px'
            }}>
              {t('mobile.title')}
            </h2>
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.2)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: 16
            }}>
              {t('common.comingSoon')}
            </div>
            <p style={{
              fontSize: '18px',
              lineHeight: 1.6,
              maxWidth: 600,
              margin: '0 auto',
              color: 'rgba(255,255,255,0.9)'
            }}>
              {t('mobile.subtitle')}
            </p>
          </motion.div>
        </motion.div>

        {/* Features */}
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24
          }}>
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
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
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #0A9396, #4ECDC4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20
                  }}>
                    <Icon size={26} color="white" />
                  </div>
                  <h3 style={{
                    color: '#0B1F3A',
                    margin: '0 0 12px',
                    fontSize: '18px',
                    fontWeight: 700
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    color: '#64748b',
                    lineHeight: 1.6,
                    margin: 0,
                    fontSize: '14px'
                  }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Notify Me */}
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
          <h2 style={{ margin: '0 0 8px', fontSize: '24px' }}>
            {t('mobile.notifyTitle')}
          </h2>
          <p style={{
            lineHeight: 1.6,
            marginBottom: 24,
            color: 'rgba(255,255,255,0.8)',
            maxWidth: 500,
            margin: '0 auto 24px'
          }}>
            {t('mobile.notifyDesc')}
          </p>
          <div style={{
            display: 'flex',
            gap: 12,
            maxWidth: 440,
            margin: '0 auto'
          }}>
            <input
              type="email"
              placeholder={t('lang.select')}
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
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
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

export default MobileBanking;
