import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import SectionCard from './SectionCard';
import { useTheme } from '../context/ThemeContext';

interface SectorRisk {
  name: string;
  risk_level: string;
  risk_score: number;
  volatility: string;
  factors: string[];
  recommendation: string;
}

interface RiskAnalyticsCardProps {
  sectors: SectorRisk[];
  overallMarketRisk?: string;
  aiInsight?: string;
  loading?: boolean;
}

const RiskAnalyticsCard: React.FC<RiskAnalyticsCardProps> = ({ sectors, overallMarketRisk, aiInsight, loading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <SectionCard title="Risk Analytics">
        <div className="shimmer" style={{ height: 250, borderRadius: 12, background: isDark ? '#1e293b' : '#e2e8f0' }} />
      </SectionCard>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getRiskBg = (level: string) => {
    const colors = {
      low: isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4',
      medium: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb',
      high: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
    };
    return (colors as any)[level] || (isDark ? '#0f172a' : '#f8fafc');
  };

  return (
    <SectionCard title="Risk Analytics" headerRight={
      <span style={{
        padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
        background: getRiskBg(overallMarketRisk || 'moderate'),
        color: getRiskColor(overallMarketRisk === 'moderate' ? 'medium' : (overallMarketRisk || 'low')),
        border: `1px solid ${getRiskColor(overallMarketRisk === 'moderate' ? 'medium' : (overallMarketRisk || 'low'))}30`,
      }}>
        Market: {overallMarketRisk || 'Moderate'}
      </span>
    }>
      <div style={{ display: 'grid', gap: 12 }}>
        {sectors.map((sector, idx) => (
          <motion.div
            key={sector.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            style={{
              padding: 16, borderRadius: 14,
              background: getRiskBg(sector.risk_level),
              border: `1px solid ${getRiskColor(sector.risk_level)}20`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={18} color={getRiskColor(sector.risk_level)} />
                <span style={{ fontWeight: 700, fontSize: 14, color: isDark ? '#e2e8f0' : '#1e293b' }}>{sector.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  background: `${getRiskColor(sector.risk_level)}20`,
                  color: getRiskColor(sector.risk_level),
                  textTransform: 'uppercase',
                }}>
                  {sector.risk_level} Risk
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: getRiskColor(sector.risk_level) }}>
                  {sector.risk_score}
                </span>
              </div>
            </div>
            <div style={{ width: '100%', height: 6, borderRadius: 3, background: isDark ? '#1e293b' : '#e2e8f0', overflow: 'hidden', marginBottom: 8 }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${sector.risk_score}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }}
                style={{
                  height: '100%', borderRadius: 3,
                  background: `linear-gradient(90deg, ${getRiskColor(sector.risk_level)}, ${getRiskColor(sector.risk_level)}dd)`,
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <AlertTriangle size={12} color={getRiskColor(sector.risk_level)} />
              <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>{sector.volatility} Volatility</span>
            </div>
            <div style={{ fontSize: 12, color: isDark ? '#cbd5e1' : '#475569' }}>{sector.recommendation}</div>
          </motion.div>
        ))}
      </div>
      {aiInsight && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{
            marginTop: 16, padding: 14, borderRadius: 12,
            background: isDark ? 'rgba(10,147,150,0.08)' : '#ecfeff',
            border: '1px solid rgba(10,147,150,0.2)', display: 'flex', alignItems: 'flex-start', gap: 10
          }}
        >
          <Info size={16} color="#0A9396" style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: isDark ? '#7dd3fc' : '#0f766e' }}>{aiInsight}</span>
        </motion.div>
      )}
    </SectionCard>
  );
};

export default RiskAnalyticsCard;
