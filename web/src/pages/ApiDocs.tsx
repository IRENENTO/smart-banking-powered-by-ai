import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Code, Database, Activity } from 'lucide-react';

const ApiDocs: React.FC = () => {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/transactions',
      description: 'Retrieve all transactions for the authenticated user',
      response: `{
  "transactions": [
    {
      "id": "txn_001",
      "amount": 50000,
      "type": "transfer",
      "description": "Payment to John",
      "date": "2024-04-27",
      "status": "completed"
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/loans',
      description: 'Submit a new loan application',
      response: `{
  "loanId": "loan_12345",
  "amount": 500000,
  "status": "pending_ai_review",
  "aiDecision": {
    "score": 78,
    "recommendation": "approved",
    "confidence": 0.92
  }
}`
    },
    {
      method: 'GET',
      path: '/api/insights',
      description: 'Get AI-generated financial insights for the user',
      response: `{
  "insights": [
    {
      "category": "spending",
      "message": "Your transport costs are 32% of income",
      "recommendation": "Consider carpooling to save 15%"
    },
    {
      "category": "savings",
      "message": "You're saving 8% of income",
      "recommendation": "Increase to 20% for financial security"
    }
  ]
}`
    }
  ];

  return (
    <PageLayout 
      title="API Documentation"
      subtitle="Build with AI Smart Banking"
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
          <h2 style={{ marginTop: 0 }}>Getting Started</h2>
          <p style={{ lineHeight: 1.8 }}>
            Our REST API allows you to integrate AI Smart Banking's banking features into your applications. 
            All endpoints require authentication using OAuth 2.0. Request an API key from our developer portal.
          </p>
        </motion.div>

        {/* API Endpoints */}
        <div>
          <h2 style={{ color: '#0B1F3A', marginBottom: 24 }}>Available Endpoints</h2>
          <div style={{ display: 'grid', gap: 24 }}>
            {endpoints.map((endpoint, idx) => (
              <motion.div
                key={endpoint.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(10, 147, 150, 0.1)'
                }}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #0A9396, #059669)',
                  color: 'white',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '4px 12px',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: '12px'
                    }}>
                      {endpoint.method}
                    </span>
                    <code style={{ fontFamily: 'monospace', fontSize: '14px' }}>{endpoint.path}</code>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <p style={{ color: '#64748b', marginBottom: 16 }}>{endpoint.description}</p>
                  <h4 style={{ color: '#0B1F3A', marginTop: 0, marginBottom: 8 }}>Example Response:</h4>
                  <pre style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: 8,
                    overflow: 'auto',
                    color: '#0B1F3A',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    border: '1px solid #e2e8f0'
                  }}>
                    {endpoint.response}
                  </pre>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Authentication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'white',
            padding: '30px',
            borderRadius: 12,
            border: '1px solid rgba(10, 147, 150, 0.1)'
          }}
        >
          <h2 style={{ color: '#0B1F3A', marginTop: 0 }}>Authentication</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8 }}>
            All API requests must include an Authorization header with a valid OAuth 2.0 token. 
            Tokens are valid for 24 hours. Use the refresh endpoint to obtain a new token.
          </p>
          <pre style={{
            background: '#f8fafc',
            padding: '16px',
            borderRadius: 8,
            color: '#0B1F3A',
            fontSize: '13px',
            overflow: 'auto',
            border: '1px solid #e2e8f0'
          }}>
            {`Authorization: Bearer YOUR_ACCESS_TOKEN`}
          </pre>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ApiDocs;
