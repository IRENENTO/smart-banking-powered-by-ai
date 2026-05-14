import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

const IncomePattern: React.FC = () => {
  const incomeData = [
    { label: 'Daily Average Income', value: '8,500 RWF', icon: DollarSign, color: '#10b981' },
    { label: 'Best Day', value: 'Friday', icon: Calendar, color: '#3b82f6' },
    { label: 'Trend', value: 'Increasing ↑', icon: TrendingUp, color: '#059669' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
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
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12
        }}>
          <DollarSign size={20} style={{ color: 'white' }} />
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
          Income Pattern
        </h3>
      </div>

      <div>
        {incomeData.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 0',
            borderBottom: index < incomeData.length - 1 ? '1px solid #f1f5f9' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${item.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14
              }}>
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 2 }}>
                  {item.label}
                </div>
              </div>
            </div>
            <div style={{
              fontSize: 15,
              fontWeight: 600,
              color: item.color === '#059669' ? '#059669' : '#1e293b'
            }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 20,
        padding: 12,
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        borderRadius: 10,
        border: '1px solid #22c55e20'
      }}>
        <div style={{ fontSize: 12, color: '#166534', textAlign: 'center' }}>
          <span style={{ fontWeight: 600 }}>💡 AI Insight:</span> Your income pattern shows strong weekend performance. Consider dedicating 20% of Friday gains to savings.
        </div>
      </div>

      <Link to="/ai-insights" style={{ textDecoration: 'none' }}>
        <div style={{
          marginTop: 18,
          padding: '14px 16px',
          borderRadius: 12,
          background: '#059669',
          color: 'white',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          Explore AI recommendations
        </div>
      </Link>
    </motion.div>
  );
};

export default IncomePattern;
