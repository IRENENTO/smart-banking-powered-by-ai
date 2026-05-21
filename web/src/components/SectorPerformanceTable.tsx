import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import SectionCard from './SectionCard';
import { useTheme } from '../context/ThemeContext';

interface SectorRow {
  id: string;
  name: string;
  risk: string;
  growth: number;
  trend: string;
}

interface SectorPerformanceTableProps {
  sectors: SectorRow[];
  loading?: boolean;
}

const SectorPerformanceTable: React.FC<SectorPerformanceTableProps> = ({ sectors, loading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <SectionCard title="Sector Performance">
        <div className="shimmer" style={{ height: 240, borderRadius: 12, background: isDark ? '#1e293b' : '#e2e8f0' }} />
      </SectionCard>
    );
  }

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      low: { bg: isDark ? '#064e3b' : '#d1fae5', text: isDark ? '#6ee7b7' : '#065f46' },
      medium: { bg: isDark ? '#451a03' : '#fef3c7', text: isDark ? '#fbbf24' : '#92400e' },
      high: { bg: isDark ? '#3b1c1c' : '#fee2e2', text: isDark ? '#fca5a5' : '#991b1b' },
    };
    const c = colors[risk] || colors.low;
    return { background: c.bg, color: c.text };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} color="#10b981" />;
      case 'down': return <TrendingDown size={14} color="#ef4444" />;
      default: return <Minus size={14} color="#94a3b8" />;
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 15) return '#10b981';
    if (growth >= 10) return '#3b82f6';
    if (growth >= 5) return '#f59e0b';
    return '#ef4444';
  };

  const getRecommendation = (sector: SectorRow) => {
    if (sector.risk === 'low' && sector.growth >= 12) return 'Strong Buy';
    if (sector.risk === 'low') return 'Buy';
    if (sector.risk === 'medium' && sector.growth >= 8) return 'Hold';
    if (sector.risk === 'medium') return 'Watch';
    return 'Avoid';
  };

  const getRecColor = (rec: string) => {
    switch (rec) {
      case 'Strong Buy': return '#10b981';
      case 'Buy': return '#3b82f6';
      case 'Hold': return '#f59e0b';
      case 'Watch': return '#f97316';
      case 'Avoid': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <SectionCard title="Sector Performance Table" subtitle="Risk, growth, trend, and recommendation">
      <div style={{ overflowX: 'auto', marginTop: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Sector</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Risk</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Growth</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Trend</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {sectors.map((sector, idx) => {
              const rec = getRecommendation(sector);
              const recColor = getRecColor(rec);
              return (
                <motion.tr
                  key={sector.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
                    transition: 'background 0.2s',
                  }}
                  whileHover={{ background: isDark ? '#0f172a' : '#f8fafc' }}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b' }}>{sector.name}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                      ...getRiskBadge(sector.risk),
                    }}>
                      {sector.risk}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: getGrowthColor(sector.growth) }}>
                    +{sector.growth}%
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>{getTrendIcon(sector.trend)}</div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: `${recColor}15`, color: recColor,
                    }}>
                      {rec}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};

export default SectorPerformanceTable;
