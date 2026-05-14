import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, AlertTriangle, Target } from 'lucide-react';

const InvestmentIdeas: React.FC = () => {
  const investments = [
    { 
      name: 'Poultry Farming', 
      return: 'High Return', 
      risk: 'Medium',
      details: 'Target 15%+ annual yield with low capital entry.',
      icon: TrendingUp, 
      color: '#10b981',
      bgColor: '#10b98115'
    },
    { 
      name: 'Mobile Money Agent', 
      return: 'Stable Income', 
      risk: 'Low',
      details: 'Regular commission from mobile transactions.',
      icon: DollarSign, 
      color: '#3b82f6',
      bgColor: '#3b82f615'
    },
    { 
      name: 'Small Retail', 
      return: 'High Risk', 
      risk: 'High',
      details: 'Higher reward with diversified product mix.',
      icon: AlertTriangle, 
      color: '#f59e0b',
      bgColor: '#f59e0b15'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return '#10b981';
      case 'Medium':
        return '#f59e0b';
      case 'High':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        background: 'white',
        borderRadius: 16,
        padding: 'clamp(16px, 4vw, 24px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12
        }}>
          <Target size={20} style={{ color: 'white' }} />
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
          Investment Opportunities
        </h3>
      </div>

      <div>
        {investments.map((investment, index) => (
          <div key={index} style={{
            padding: 16,
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            marginBottom: index < investments.length - 1 ? 12 : 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: investment.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <investment.icon size={20} style={{ color: investment.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                  {investment.name}
                </div>
                <div style={{ fontSize: 13, color: investment.color, fontWeight: 500 }}>
                  {investment.return}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>{investment.details}</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#64748b', marginRight: 8 }}>
                    Risk Level:
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: getRiskColor(investment.risk),
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: `${getRiskColor(investment.risk)}15`
                  }}>
                    {investment.risk}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 20,
        padding: 12,
        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
        borderRadius: 10,
        border: '1px solid #f59e0b20'
      }}>
        <div style={{ fontSize: 12, color: '#92400e', textAlign: 'center' }}>
          <span style={{ fontWeight: 600 }}>🎯 AI Tip:</span> Diversify across different risk levels for optimal returns.
        </div>
      </div>

      <Link to="/investments" style={{ textDecoration: 'none' }}>
        <div style={{
          marginTop: 18,
          padding: '14px 16px',
          borderRadius: 12,
          background: '#7c3aed',
          color: 'white',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          Explore investment plans
        </div>
      </Link>
    </motion.div>
  );
};

export default InvestmentIdeas;
