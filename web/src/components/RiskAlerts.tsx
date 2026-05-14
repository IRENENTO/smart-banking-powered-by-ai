import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Shield, AlertCircle } from 'lucide-react';

const RiskAlerts: React.FC = () => {
  const riskAlerts = [
    { 
      message: 'Expenses increased by 18%', 
      severity: 'high',
      icon: TrendingDown,
      color: '#ef4444'
    },
    { 
      message: 'Savings decreasing', 
      severity: 'medium',
      icon: AlertTriangle,
      color: '#f59e0b'
    },
    {
      message: 'Emergency buffer target not met',
      severity: 'low',
      icon: Shield,
      color: '#10b981'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#ef444415';
      case 'medium':
        return '#f59e0b15';
      case 'low':
        return '#10b98115';
      default:
        return '#6b728015';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
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
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12
        }}>
          <AlertCircle size={20} style={{ color: 'white' }} />
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
          Risk Alerts
        </h3>
      </div>

      <div style={{ marginBottom: 20 }}>
        {riskAlerts.map((alert, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            padding: 14,
            borderRadius: 10,
            background: getSeverityBg(alert.severity),
            border: `1px solid ${getSeverityColor(alert.severity)}20`,
            marginBottom: index < riskAlerts.length - 1 ? 12 : 0
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: getSeverityBg(alert.severity),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <alert.icon size={16} style={{ color: getSeverityColor(alert.severity) }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                {alert.message}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: 16,
        background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
        borderRadius: 12,
        border: '1px solid #ef444420'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Shield size={16} style={{ color: '#ef4444', marginRight: 8 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#991b1b' }}>
              Risk Level:
            </span>
          </div>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#ef4444',
            padding: '4px 12px',
            borderRadius: 6,
            background: '#ef444415',
            border: '1px solid #ef444430'
          }}>
            Medium
          </span>
        </div>
      </div>

      <div style={{
        marginTop: 16,
        padding: 12,
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        borderRadius: 10,
        border: '1px solid #0ea5e920'
      }}>
        <div style={{ fontSize: 12, color: '#0c4a6e', textAlign: 'center' }}>
          <span style={{ fontWeight: 600 }}>🛡️ AI Advice:</span> Reduce discretionary spending by 10% and build a 3-month emergency reserve.
        </div>
      </div>

      <Link to="/ai-insights" style={{ textDecoration: 'none' }}>
        <div style={{
          marginTop: 18,
          padding: '14px 16px',
          borderRadius: 12,
          background: '#ef4444',
          color: 'white',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          View detailed risk actions
        </div>
      </Link>
    </motion.div>
  );
};

export default RiskAlerts;
