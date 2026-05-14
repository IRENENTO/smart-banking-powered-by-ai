import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, Zap } from 'lucide-react';

const Insurance: React.FC = () => {
  return (
    <PageLayout 
      title="Insurance"
      subtitle="Protecting your financial future"
    >
      <div style={{ display: 'grid', gap: 40 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #0A9396, #059669)',
            color: 'white',
            padding: '40px',
            borderRadius: 12,
            textAlign: 'center'
          }}
        >
          <h2 style={{ marginTop: 0 }}>Coming Soon: AI-Powered Insurance</h2>
          <p style={{ lineHeight: 1.8, fontSize: '16px' }}>
            We're working on revolutionary insurance products that use AI to provide fair, personalized pricing and instant claims.
          </p>
        </motion.div>

        {/* Future Features */}
        <div>
          <h2 style={{ color: '#0B1F3A', marginBottom: 24 }}>What We're Building</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              {
                icon: Shield,
                title: 'Life Insurance',
                description: 'Affordable life insurance with AI-based risk assessment. Protect your loved ones with competitive premiums.'
              },
              {
                icon: AlertCircle,
                title: 'Health Insurance',
                description: 'Comprehensive health coverage with AI predictive care. Get insurance premiums based on your actual health profile.'
              },
              {
                icon: Zap,
                title: 'Asset Protection',
                description: 'Protect your valuables and assets with intelligent insurance. AI adjusts coverage based on your lifestyle.'
              }
            ].map((feature, idx) => {
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

        {/* Risk-Based Pricing */}
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
          <h2 style={{ color: '#0B1F3A', marginTop: 0 }}>AI Risk-Based Pricing</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8, marginBottom: 24 }}>
            Traditional insurance uses generic risk models. AI Smart Banking's upcoming insurance will use advanced AI to assess your individual risk profile 
            and provide fair pricing. Low-risk customers get better rates, while high-risk customers pay appropriately for their coverage.
          </p>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc, #f0f9ff)',
            padding: '30px',
            borderRadius: 8,
            border: '1px solid rgba(10, 147, 150, 0.1)'
          }}>
            <h4 style={{ color: '#0A9396', marginTop: 0 }}>How It Works:</h4>
            <ol style={{ color: '#64748b', lineHeight: 1.8, marginBottom: 0 }}>
              <li>Provide basic health and lifestyle information</li>
              <li>AI analyzes your risk profile using advanced algorithms</li>
              <li>Get a personalized insurance quote</li>
              <li>Receive continuous discounts for healthy behaviors</li>
              <li>Instant claims processing when needed</li>
            </ol>
          </div>
        </motion.div>

        {/* Notify Me */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, #0A9396, #059669)',
            color: 'white',
            padding: '40px',
            borderRadius: 12,
            textAlign: 'center'
          }}
        >
          <h2 style={{ marginTop: 0 }}>Stay Updated</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 24 }}>
            Insurance products are coming soon. Subscribe to our newsletter to be notified when we launch.
          </p>
          <div style={{ display: 'flex', gap: 12, maxWidth: 400, margin: '0 auto' }}>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 6,
                border: 'none',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              style={{
                padding: '12px 24px',
                borderRadius: 6,
                border: 'none',
                background: 'white',
                color: '#0A9396',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Notify Me
            </button>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Insurance;
