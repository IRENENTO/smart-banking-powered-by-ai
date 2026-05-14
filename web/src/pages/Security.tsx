import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Lock, Shield, AlertTriangle, Eye } from 'lucide-react';

const Security: React.FC = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All your financial data is encrypted using AES-256, the same standard used by banks worldwide. Your data is protected both in transit and at rest.'
    },
    {
      icon: Shield,
      title: 'Secure Login System',
      description: 'Multi-factor authentication and biometric security ensure only you can access your account. We use industry-leading authentication protocols.'
    },
    {
      icon: AlertTriangle,
      title: 'AI Fraud Detection',
      description: 'Our AI continuously monitors for suspicious activities and unusual patterns. Any potential fraud is immediately flagged and investigated.'
    },
    {
      icon: Eye,
      title: 'User Privacy Protection',
      description: 'Your personal information is never shared with third parties. We comply with all data protection regulations and respect your privacy.'
    }
  ];

  return (
    <PageLayout 
      title="Security & Privacy"
      subtitle="Your trust is our priority"
    >
      <div style={{ display: 'grid', gap: 40 }}>
        {/* Security Measures */}
        <div>
          <h2 style={{ color: '#0B1F3A', marginBottom: 30 }}>How We Protect You</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {securityFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: 12,
                    boxShadow: '0 4px 15px rgba(10, 147, 150, 0.1)',
                    borderLeft: '4px solid #0A9396'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #0A9396, #059669)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={20} color="white" />
                    </div>
                    <h3 style={{ margin: 0, color: '#0B1F3A' }}>{feature.title}</h3>
                  </div>
                  <p style={{ color: '#64748b', lineHeight: 1.6, margin: 0 }}>{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Compliance & Standards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, #0A9396 0%, #059669 100%)',
            color: 'white',
            padding: '40px',
            borderRadius: 12
          }}
        >
          <h2 style={{ marginTop: 0 }}>Compliance & Standards</h2>
          <ul style={{ lineHeight: 2, fontSize: '16px' }}>
            <li>✓ Fully compliant with Rwanda Financial Regulator requirements</li>
            <li>✓ ISO 27001 Information Security Certification</li>
            <li>✓ PCI DSS Level 1 compliance for payment processing</li>
            <li>✓ GDPR compliant data handling practices</li>
            <li>✓ Regular third-party security audits</li>
            <li>✓ 24/7 security monitoring and incident response</li>
          </ul>
        </motion.div>

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'white',
            padding: '40px',
            borderRadius: 12,
            border: '1px solid rgba(10, 147, 150, 0.1)'
          }}
        >
          <h2 style={{ color: '#0B1F3A', marginTop: 0 }}>Your Privacy Rights</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            You have the right to access, modify, or delete your personal data at any time. We never sell your information to third parties, 
            and you can control what data we collect. For any privacy concerns, contact our Data Protection Officer at privacy@asmartlend.com.
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Security;
