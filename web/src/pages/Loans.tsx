import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { FileCheck, CheckCircle, Eye, BarChart3 } from 'lucide-react';

const Loans: React.FC = () => {
  const steps = [
    {
      icon: FileCheck,
      title: 'Application',
      description: 'Fill out a simple loan application with your basic financial information.'
    },
    {
      icon: CheckCircle,
      title: 'AI Approval',
      description: 'Our AI analyzes your profile and provides instant approval decisions.'
    },
    {
      icon: Eye,
      title: 'Loan Tracking',
      description: 'Monitor your loan status and repayment schedule in real-time.'
    },
    {
      icon: BarChart3,
      title: 'Risk Evaluation',
      description: 'Understand your risk profile with detailed AI-generated insights.'
    }
  ];

  return (
    <PageLayout 
      title="Loans"
      subtitle="Smart borrowing with AI"
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
          <h2 style={{ marginTop: 0 }}>Quick & Fair Loans</h2>
          <p style={{ lineHeight: 1.8, fontSize: '16px' }}>
            Apply for loans in minutes. Our AI evaluates your application fairly and transparently, giving you instant decisions 
            and competitive rates based on your actual financial situation.
          </p>
        </motion.div>

        {/* Loan Process */}
        <div>
          <h2 style={{ color: '#0B1F3A', marginBottom: 24 }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: 12,
                    boxShadow: '0 4px 15px rgba(10, 147, 150, 0.1)',
                    border: '1px solid rgba(10, 147, 150, 0.1)',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    left: 20,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0A9396, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '16px'
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #0A9396, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    marginTop: 8
                  }}>
                    <Icon size={24} color="white" />
                  </div>
                  <h3 style={{ color: '#0B1F3A', marginTop: 0, marginBottom: 12 }}>{step.title}</h3>
                  <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Loan Types */}
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
          <h2 style={{ color: '#0B1F3A', marginTop: 0 }}>Loan Types</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                type: 'Personal Loans',
                amount: '10,000 - 5,000,000 RWF',
                rate: 'From 8.5% p.a.',
                term: '3 - 36 months'
              },
              {
                type: 'Business Loans',
                amount: '100,000 - 100,000,000 RWF',
                rate: 'Competitive rates',
                term: 'Flexible terms'
              },
              {
                type: 'Emergency Loans',
                amount: '5,000 - 1,000,000 RWF',
                rate: 'Premium rates',
                term: '1 - 12 months'
              }
            ].map((loan) => (
              <div key={loan.type} style={{
                background: 'linear-gradient(135deg, #f8fafc, #f0f9ff)',
                padding: '25px',
                borderRadius: 8,
                border: '1px solid rgba(10, 147, 150, 0.1)'
              }}>
                <h4 style={{ color: '#0A9396', marginTop: 0, marginBottom: 16 }}>{loan.type}</h4>
                <div style={{ display: 'grid', gap: 12, fontSize: '14px', color: '#64748b' }}>
                  <div><strong>Amount:</strong> {loan.amount}</div>
                  <div><strong>Interest Rate:</strong> {loan.rate}</div>
                  <div><strong>Term:</strong> {loan.term}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key Benefits */}
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
          <h2 style={{ marginTop: 0 }}>Why Choose AI Smart Banking for Loans?</h2>
          <ul style={{ lineHeight: 2.2 }}>
            <li>✓ Instant AI-powered approval decisions</li>
            <li>✓ Transparent pricing with no hidden fees</li>
            <li>✓ Fast fund disbursement</li>
            <li>✓ Flexible repayment schedules</li>
            <li>✓ Competitive interest rates</li>
            <li>✓ Easy online application process</li>
          </ul>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Loans;
