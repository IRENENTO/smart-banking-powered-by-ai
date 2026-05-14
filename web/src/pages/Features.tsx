import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Brain, AlertCircle, CreditCard } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Loan Approval',
      description: 'Our intelligent system analyzes your financial profile to approve loans instantly. Get instant feedback on your eligibility without long waiting periods.'
    },
    {
      icon: Zap,
      title: 'Smart Savings',
      description: 'Automatic savings tracking helps you reach your financial goals. AI recommends optimal savings amounts based on your income and spending patterns.'
    },
    {
      icon: TrendingUp,
      title: 'Market Insights',
      description: 'Stay updated with Rwanda economic trends and market analysis. Get real-time insights to make informed financial decisions.'
    },
    {
      icon: CreditCard,
      title: 'Investment Advice',
      description: 'Receive personalized investment suggestions based on your risk profile. Explore opportunities in stocks, bonds, and alternative investments.'
    },
    {
      icon: AlertCircle,
      title: 'Risk Alerts',
      description: 'Proactive alerts warn you of potential financial risks. Monitor your credit score, debt levels, and spending anomalies in real-time.'
    },
    {
      icon: Zap,
      title: 'Instant Transfers',
      description: 'Fast and secure money transfers to anyone. Send money in seconds with competitive exchange rates and minimal fees.'
    }
  ];

  return (
    <PageLayout 
      title="Our Features"
      subtitle="Powerful tools for smarter banking"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              style={{
                background: 'white',
                padding: '30px',
                borderRadius: 12,
                boxShadow: '0 4px 15px rgba(10, 147, 150, 0.1)',
                border: '1px solid rgba(10, 147, 150, 0.1)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0A9396, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <Icon size={24} color="white" />
              </div>
              <h3 style={{ color: '#0B1F3A', marginTop: 0, marginBottom: 12 }}>{feature.title}</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>{feature.description}</p>
            </motion.div>
          );
        })}
      </div>
    </PageLayout>
  );
};

export default Features;
