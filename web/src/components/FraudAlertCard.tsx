import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, AlertCircle, Clock, MapPin, User, DollarSign } from 'lucide-react';
import SectionCard from './SectionCard';
import { useTheme } from '../context/ThemeContext';

interface FraudAlert {
  id: string;
  type: string;
  severity: string;
  status: string;
  amount: number;
  description: string;
  timestamp: string;
  user_email: string;
  region: string;
}

interface FraudAlertCardProps {
  alerts: FraudAlert[];
  total?: number;
  criticalCount?: number;
  loading?: boolean;
}

const FraudAlertCard: React.FC<FraudAlertCardProps> = ({ alerts, total, criticalCount, loading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <SectionCard title="Fraud Monitoring">
        <div className="shimmer" style={{ height: 200, borderRadius: 12, background: isDark ? '#1e293b' : '#e2e8f0' }} />
      </SectionCard>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const getSeverityBg = (severity: string) => {
    const c = getSeverityColor(severity);
    return isDark ? `${c}15` : `${c}10`;
  };

  const formatType = (type: string) => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <SectionCard title="Fraud Monitoring" headerRight={
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {criticalCount && criticalCount > 0 ? (
          <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#ef444420', color: '#ef4444' }}>
            {criticalCount} Critical
          </span>
        ) : null}
        <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: isDark ? '#1e293b' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b' }}>
          Total: {total || alerts.length}
        </span>
      </div>
    }>
      {alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: isDark ? '#64748b' : '#94a3b8' }}>
          <Shield size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <div style={{ fontWeight: 600 }}>No fraud alerts detected</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>All transactions appear normal</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {alerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              style={{
                padding: 14, borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 12,
                background: getSeverityBg(alert.severity),
                border: `1px solid ${getSeverityColor(alert.severity)}20`,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${getSeverityColor(alert.severity)}20`, flexShrink: 0,
              }}>
                {alert.severity === 'critical' || alert.severity === 'high'
                  ? <AlertCircle size={18} color={getSeverityColor(alert.severity)} />
                  : <AlertTriangle size={18} color={getSeverityColor(alert.severity)} />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    {formatType(alert.type)}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    background: getSeverityColor(alert.severity), color: 'white',
                  }}>
                    {alert.severity}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 6 }}>{alert.description}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: isDark ? '#64748b' : '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <DollarSign size={12} /> {alert.amount.toLocaleString()} RWF
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} /> {alert.region}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {new Date(alert.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

export default FraudAlertCard;
