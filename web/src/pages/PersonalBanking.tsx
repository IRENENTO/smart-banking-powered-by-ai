import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Wallet, Send, TrendingUp, Zap, PieChart } from 'lucide-react';

const PersonalBanking: React.FC = () => {
  const services = [
    {
      icon: Wallet,
      title: 'Accounts',
      description: 'Open multiple accounts tailored to your needs. Savings accounts, current accounts, and specialized accounts for specific goals.'
    },
    {
      icon: Send,
      title: 'Transfers',
      description: 'Send money to anyone instantly with competitive rates. Domestic and international transfers with real-time tracking.'
    },
    {
      icon: TrendingUp,
      title: 'Savings',
      description: 'Grow your money with competitive interest rates. Set savings goals and let AI help you reach them faster.'
    },
    {
      icon: Zap,
      title: 'AI Insights',
      description: 'Get personalized financial recommendations. AI analyzes your spending to suggest ways to save more and earn better returns.'
    }
  ];

  return (
    <PageLayout 
      title="Personal Banking"
      subtitle="Banking services designed for individuals"
    >
      <div style={{ display: 'grid', gap: 40 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #0A9396, #059669)',
            color: 'white',
            padding: '30px',
            borderRadius: 12
          }}
        >
          <h2 style={{ marginTop: 0 }}>Banking Simplified</h2>
          <p style={{ lineHeight: 1.8, fontSize: '16px' }}>
            AI Smart Banking makes personal banking effortless. Whether you need to send money, save for a goal, or get a quick loan, 
            our platform provides intelligent solutions tailored to your financial needs.
          </p>
        </motion.div>

        {/* Services */}
        <div>
          <h2 style={{ color: '#0B1F3A', marginBottom: 24 }}>Our Services</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: 12,
                    boxShadow: '0 4px 15px rgba(10, 147, 150, 0.1)',
                    border: '1px solid rgba(10, 147, 150, 0.1)'
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
                  <h3 style={{ color: '#0B1F3A', marginTop: 0, marginBottom: 12 }}>{service.title}</h3>
                  <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>{service.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
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
          <h2 style={{ color: '#0B1F3A', marginTop: 0 }}>Why Choose Personal Banking with AI Smart Banking?</h2>
          <ul style={{ lineHeight: 2.2, color: '#64748b' }}>
            <li>✓ 24/7 access to your accounts</li>
            <li>✓ Low fees and competitive interest rates</li>
            <li>✓ Instant loan approvals with AI assessment</li>
            <li>✓ Personalized savings recommendations</li>
            <li>✓ Multi-currency support</li>
            <li>✓ Mobile and web access</li>
            <li>✓ Bank-grade security and encryption</li>
            <li>✓ Dedicated customer support</li>
          </ul>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default PersonalBanking;
