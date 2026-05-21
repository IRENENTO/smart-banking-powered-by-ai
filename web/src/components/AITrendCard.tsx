import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, BarChart3, DollarSign, Percent } from 'lucide-react';
import SectionCard from './SectionCard';
import { useTheme } from '../context/ThemeContext';

interface EconomicIndicators {
  inflation_rate: number;
  gdp_growth: number;
  market_sentiment: string;
}

interface AITrendCardProps {
  indicators: EconomicIndicators;
  aiPowered?: boolean;
  loading?: boolean;
}

const AITrendCard: React.FC<AITrendCardProps> = ({ indicators, aiPowered, loading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <SectionCard title="AI Market Trends">
        <div className="shimmer" style={{ height: 160, borderRadius: 12, background: isDark ? '#1e293b' : '#e2e8f0' }} />
      </SectionCard>
    );
  }

  const sentColor = indicators?.market_sentiment === 'positive' ? '#10b981' : indicators?.market_sentiment === 'neutral' ? '#f59e0b' : '#ef4444';

  return (
    <SectionCard title="Market Trends & Indicators" headerRight={
      aiPowered ? (
        <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: 'linear-gradient(135deg, #0A9396, #4ECDC4)', color: 'white' }}>
          AI POWERED
        </span>
      ) : null
    }>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginTop: 8 }}>
        <motion.div whileHover={{ y: -4 }} style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
          <Percent size={20} color="#10b981" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4 }}>Inflation</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: isDark ? '#a7f3d0' : '#059669' }}>{indicators?.inflation_rate ?? '--'}%</div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', border: '1px solid rgba(59,130,246,0.2)', textAlign: 'center' }}>
          <TrendingUp size={20} color="#3b82f6" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4 }}>GDP Growth</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: isDark ? '#93c5fd' : '#2563eb' }}>+{indicators?.gdp_growth ?? '--'}%</div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb', border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center' }}>
          <Activity size={20} color={sentColor} style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4 }}>Sentiment</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: sentColor, textTransform: 'capitalize' }}>{indicators?.market_sentiment ?? '--'}</div>
        </motion.div>
      </div>
    </SectionCard>
  );
};

export default AITrendCard;
