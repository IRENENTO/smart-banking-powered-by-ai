import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Minus, Lightbulb } from 'lucide-react';

const MarketInsights: React.FC = () => {
  const marketData = [
    { sector: 'Agriculture', status: 'growing', icon: TrendingUp, color: '#10b981', note: 'Strong demand for crops and livestock.' },
    { sector: 'Retail', status: 'warning', icon: AlertTriangle, color: '#f59e0b', note: 'High competition from new market entrants.' },
    { sector: 'Transport', status: 'stable', icon: Minus, color: '#6b7280', note: 'Passenger volume remains steady month over month.' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'growing':
        return <TrendingUp size={16} style={{ color: '#10b981' }} />;
      case 'warning':
        return <AlertTriangle size={16} style={{ color: '#f59e0b' }} />;
      case 'stable':
        return <Minus size={16} style={{ color: '#6b7280' }} />;
      default:
        return <Minus size={16} style={{ color: '#6b7280' }} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'growing':
        return 'Growing ↑';
      case 'warning':
        return 'High Competition ⚠';
      case 'stable':
        return 'Stable →';
      default:
        return 'Stable →';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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
          background: 'linear-gradient(135deg, #0A9396, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12
        }}>
          <TrendingUp size={20} style={{ color: 'white' }} />
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
          Rwanda Market Insights
        </h3>
      </div>

      <div style={{ marginBottom: 20 }}>
        {marketData.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: index < marketData.length - 1 ? '1px solid #f1f5f9' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${item.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                {getStatusIcon(item.status)}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#475569' }}>
                {item.sector}
              </span>
            </div>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              {getStatusText(item.status)}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        borderRadius: 12,
        padding: 16,
        border: '1px solid #0ea5e920'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Lightbulb size={16} style={{ color: '#0ea5e9', marginTop: 2, marginRight: 8 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 4 }}>
              AI Recommendation
            </div>
            <div style={{ fontSize: 12, color: '#0e7490', lineHeight: 1.4 }}>
              Invest in poultry farming or support efficient food supply chains for stable returns.
            </div>
          </div>
        </div>
      </div>

      <Link to="/market-insights" style={{ textDecoration: 'none' }}>
        <div style={{
          marginTop: 18,
          padding: '14px 16px',
          borderRadius: 12,
          background: '#0A9396',
          color: 'white',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          View full market report
        </div>
      </Link>
    </motion.div>
  );
};

export default MarketInsights;
