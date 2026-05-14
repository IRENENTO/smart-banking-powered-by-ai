import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free Plan',
      price: 'Free',
      description: 'Perfect for getting started',
      features: [
        'Basic banking features',
        'Account management',
        'Transaction history',
        'Limited AI insights',
        'Email support'
      ],
      highlighted: false
    },
    {
      name: 'Premium Plan',
      price: '9,999 RWF',
      period: '/month',
      description: 'For active users',
      features: [
        'All Free features',
        'Advanced AI analytics',
        'Investment recommendations',
        'Market insights',
        'Priority support',
        'Unlimited transfers'
      ],
      highlighted: true
    },
    {
      name: 'Business Plan',
      price: '49,999 RWF',
      period: '/month',
      description: 'For SMEs and businesses',
      features: [
        'All Premium features',
        'Multi-account management',
        'Business loan support',
        'Advanced reporting',
        'API access',
        '24/7 dedicated support',
        'Custom solutions'
      ],
      highlighted: false
    }
  ];

  return (
    <PageLayout 
      title="Pricing Plans"
      subtitle="Choose the perfect plan for your needs"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30, marginTop: 40 }}>
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            whileHover={{ y: -10 }}
            style={{
              background: plan.highlighted ? 'linear-gradient(135deg, #0A9396, #059669)' : 'white',
              padding: '40px 30px',
              borderRadius: 16,
              boxShadow: plan.highlighted ? '0 20px 40px rgba(10, 147, 150, 0.2)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
              border: plan.highlighted ? 'none' : '1px solid rgba(10, 147, 150, 0.1)',
              position: 'relative',
              transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {plan.highlighted && (
              <div style={{
                position: 'absolute',
                top: -15,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#059669',
                color: 'white',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: '12px',
                fontWeight: 600
              }}>
                Most Popular
              </div>
            )}
            <h3 style={{ margin: '0 0 8px 0', color: plan.highlighted ? 'white' : '#0B1F3A', fontSize: '24px', fontWeight: 700 }}>
              {plan.name}
            </h3>
            <p style={{ color: plan.highlighted ? 'rgba(255,255,255,0.8)' : '#64748b', margin: '8px 0 20px 0', fontSize: '14px' }}>
              {plan.description}
            </p>
            <div style={{ marginBottom: 30 }}>
              <span style={{
                fontSize: '36px',
                fontWeight: 800,
                color: plan.highlighted ? 'white' : '#0B1F3A'
              }}>
                {plan.price}
              </span>
              {plan.period && (
                <span style={{ color: plan.highlighted ? 'rgba(255,255,255,0.7)' : '#64748b', marginLeft: 8 }}>
                  {plan.period}
                </span>
              )}
            </div>
            <button style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: 8,
              border: 'none',
              background: plan.highlighted ? 'white' : '#0A9396',
              color: plan.highlighted ? '#0A9396' : 'white',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 20,
              transition: 'all 0.3s ease'
            }}>
              Get Started
            </button>
            <div style={{ display: 'grid', gap: 12 }}>
              {plan.features.map((feature) => (
                <div key={feature} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Check size={18} color={plan.highlighted ? 'white' : '#059669'} />
                  <span style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : '#475569', fontSize: '14px' }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </PageLayout>
  );
};

export default Pricing;
