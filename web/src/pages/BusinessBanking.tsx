import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Briefcase, BarChart3, TrendingUp, PieChart } from 'lucide-react';

const BusinessBanking: React.FC = () => {
  const features = [
    {
      icon: Briefcase,
      title: 'Business Accounts',
      description: 'Dedicated accounts designed for your business. Manage payroll, invoices, and business expenses efficiently.'
    },
    {
      icon: BarChart3,
      title: 'Revenue Tracking',
      description: 'Real-time tracking of business revenue and expenses. Automated reporting and financial analytics for better decisions.'
    },
    {
      icon: TrendingUp,
      title: 'SME Loan Support',
      description: 'Access growth capital quickly with our AI-powered SME loans. Flexible terms tailored to your business needs.'
    },
    {
      icon: PieChart,
      title: 'Business Analytics',
      description: 'Advanced analytics dashboard showing cash flow, profitability, and business performance metrics.'
    }
  ];

  return (
    <PageLayout 
      title="Business Banking"
      subtitle="Financial solutions for SMEs and enterprises"
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
          <h2 style={{ marginTop: 0 }}>Grow Your Business</h2>
          <p style={{ lineHeight: 1.8, fontSize: '16px' }}>
            AI Smart Banking provides comprehensive business banking solutions. From managing cash flow to accessing growth capital, 
            we help your business thrive with intelligent financial tools.
          </p>
        </motion.div>

        {/* Features */}
        <div>
          <h2 style={{ color: '#0B1F3A', marginBottom: 24 }}>Business Solutions</h2>
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

        {/* Business Loans */}
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
          <h2 style={{ color: '#0B1F3A', marginTop: 0 }}>Business Loans</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8, marginBottom: 24 }}>
            Access capital to grow your business with our AI-powered loan assessment. Get approved in hours, not weeks.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            {[
              { name: 'Working Capital', amount: 'Up to 50M RWF', term: '12-36 months' },
              { name: 'Equipment Loan', amount: 'Up to 100M RWF', term: '24-60 months' },
              { name: 'Expansion Loan', amount: 'Customized', term: 'Flexible' }
            ].map((loan) => (
              <div key={loan.name} style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: 8,
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ color: '#0A9396', marginTop: 0 }}>{loan.name}</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                  <strong>Amount:</strong> {loan.amount}<br />
                  <strong>Term:</strong> {loan.term}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default BusinessBanking;
