import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, Zap, Eye } from 'lucide-react';

const CreditCards: React.FC = () => {
  const features = [
    {
      icon: CreditCard,
      title: 'Digital Cards',
      description: 'Instant virtual cards for online shopping. Get a card number in seconds for secure online transactions.'
    },
    {
      icon: TrendingUp,
      title: 'Spending Tracking',
      description: 'AI tracks all your spending by category. Get insights on where your money goes and where you can save.'
    },
    {
      icon: Eye,
      title: 'Credit Scoring',
      description: 'Build your credit score with every transaction. Better credit = lower loan rates in the future.'
    },
    {
      icon: Zap,
      title: 'Rewards Program',
      description: 'Earn rewards on every purchase. Redeem for discounts, cashback, or donations to causes you care about.'
    }
  ];

  return (
    <PageLayout 
      title="Credit Cards"
      subtitle="Smart spending, better rewards"
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
          <h2 style={{ marginTop: 0 }}>The Future of Credit Cards</h2>
          <p style={{ lineHeight: 1.8, fontSize: '16px' }}>
            AI Smart Banking credit cards are designed for the digital age. Get instant virtual cards, smart spending tracking, and rewards 
            that actually matter to you.
          </p>
        </motion.div>

        {/* Card Features */}
        <div>
          <h2 style={{ color: '#0B1F3A', marginBottom: 24 }}>Card Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
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
                  <h3 style={{ color: '#0B1F3A', marginTop: 0, marginBottom: 12 }}>{feature.title}</h3>
                  <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Card Types */}
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
          <h2 style={{ color: '#0B1F3A', marginTop: 0 }}>Card Types</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              {
                name: 'Standard Card',
                cashback: '1% cashback',
                fee: 'No annual fee',
                limit: 'Up to 10M RWF'
              },
              {
                name: 'Premium Card',
                cashback: '2% cashback',
                fee: '50,000 RWF annually',
                limit: 'Up to 50M RWF'
              },
              {
                name: 'Business Card',
                cashback: '3% cashback',
                fee: '100,000 RWF annually',
                limit: 'Up to 200M RWF'
              }
            ].map((card) => (
              <div key={card.name} style={{
                background: 'linear-gradient(135deg, #f8fafc, #f0f9ff)',
                padding: '25px',
                borderRadius: 8,
                border: '1px solid rgba(10, 147, 150, 0.1)'
              }}>
                <h4 style={{ color: '#0A9396', marginTop: 0, marginBottom: 16 }}>{card.name}</h4>
                <div style={{ display: 'grid', gap: 10, fontSize: '14px', color: '#64748b' }}>
                  <div>💰 <strong>{card.cashback}</strong></div>
                  <div>📋 <strong>{card.fee}</strong></div>
                  <div>💳 <strong>Limit: {card.limit}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Credit Scoring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, #0A9396, #059669)',
            color: 'white',
            padding: '40px',
            borderRadius: 12
          }}
        >
          <h2 style={{ marginTop: 0 }}>Build Your Credit Score</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 24 }}>
            Every transaction with your AI Smart Banking credit card helps build your credit score. A higher score means:
          </p>
          <ul style={{ lineHeight: 2.2 }}>
            <li>✓ Lower interest rates on future loans</li>
            <li>✓ Higher credit limits</li>
            <li>✓ Better access to financial products</li>
            <li>✓ Special offers and promotions</li>
            <li>✓ Faster loan approvals</li>
          </ul>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default CreditCards;
