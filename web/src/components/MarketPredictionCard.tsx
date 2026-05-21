import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Zap, Shield, AlertTriangle } from 'lucide-react';
import SectionCard from './SectionCard';
import { useTheme } from '../context/ThemeContext';

interface MarketPredictionCardProps {
  sector: string;
  region?: string;
  riskLevel: string;
  expectedReturn: string;
  trend: string;
  growthProbability: number;
  recommendation: string;
  insight?: string;
  loading?: boolean;
}

const MarketPredictionCard: React.FC<MarketPredictionCardProps> = ({
  sector, region, riskLevel, expectedReturn, trend, growthProbability, recommendation, insight, loading
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <SectionCard title="AI Market Prediction">
        <div className="shimmer" style={{ height: 180, borderRadius: 12, background: isDark ? '#1e293b' : '#e2e8f0' }} />
      </SectionCard>
    );
  }

  const trendIcon = trend === 'up' ? <TrendingUp size={20} /> : trend === 'down' ? <TrendingDown size={20} /> : <Minus size={20} />;
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#f59e0b';
  const riskColor = riskLevel === 'low' ? '#10b981' : riskLevel === 'medium' ? '#f59e0b' : '#ef4444';
  const recColor = growthProbability >= 70 ? '#10b981' : growthProbability >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <SectionCard title={`${sector} Sector`} subtitle={region ? `Region: ${region}` : 'Rwanda Market'}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
        <div style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4 }}>Risk Level</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} color={riskColor} />
            <span style={{ fontWeight: 700, fontSize: 16, color: riskColor, textTransform: 'uppercase' }}>{riskLevel}</span>
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4 }}>Expected Return</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={18} color={trendColor} />
            <span style={{ fontWeight: 700, fontSize: 16, color: trendColor }}>{expectedReturn}</span>
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4 }}>Market Trend</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {trendIcon}
            <span style={{ fontWeight: 700, fontSize: 16, color: trendColor, textTransform: 'uppercase' }}>{trend === 'up' ? 'UP' : trend === 'down' ? 'DOWN' : 'STABLE'}</span>
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4 }}>Growth Probability</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color={recColor} />
            <span style={{ fontWeight: 700, fontSize: 16, color: recColor }}>{growthProbability}%</span>
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: 16, padding: 16, borderRadius: 14,
          background: isDark ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))' : 'linear-gradient(135deg, #d1fae5, #ecfdf5)',
          border: '1px solid rgba(16,185,129,0.3)'
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: '#059669', marginBottom: 4 }}>AI Recommendation</div>
        <div style={{ fontSize: 13, color: isDark ? '#a7f3d0' : '#065f46' }}>{recommendation}</div>
      </motion.div>
      {insight && (
        <div style={{ marginTop: 12, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', fontStyle: 'italic' }}>
          {insight}
        </div>
      )}
    </SectionCard>
  );
};

export default MarketPredictionCard;
