import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import SectionCard from './SectionCard';
import { useTheme } from '../context/ThemeContext';

interface SectorData {
  id: string;
  name: string;
  risk: string;
  growth: number;
  trend: string;
}

interface MarketHeatmapProps {
  sectors: SectorData[];
  loading?: boolean;
}

const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ sectors, loading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <SectionCard title="Market Performance Heatmap">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="shimmer" style={{ height: 100, borderRadius: 12, background: isDark ? '#1e293b' : '#e2e8f0' }} />
          ))}
        </div>
      </SectionCard>
    );
  }

  const getGrowthColor = (growth: number) => {
    if (growth >= 15) return { bg: isDark ? '#064e3b' : '#d1fae5', text: isDark ? '#6ee7b7' : '#065f46', intensity: 0.9 };
    if (growth >= 10) return { bg: isDark ? '#065f46' : '#a7f3d0', text: isDark ? '#34d399' : '#047857', intensity: 0.7 };
    if (growth >= 5) return { bg: isDark ? '#1e3a5f' : '#dbeafe', text: isDark ? '#60a5fa' : '#1e40af', intensity: 0.5 };
    return { bg: isDark ? '#3b1c1c' : '#fee2e2', text: isDark ? '#fca5a5' : '#991b1b', intensity: 0.3 };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} />;
      case 'down': return <TrendingDown size={16} />;
      default: return <Minus size={16} />;
    }
  };

  return (
    <SectionCard title="Market Performance Heatmap" subtitle="Color-coded sector growth intensity">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {sectors.map((sector, idx) => {
          const colors = getGrowthColor(sector.growth);
          return (
            <motion.div
              key={sector.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ scale: 1.05, y: -4 }}
              style={{
                padding: 16, borderRadius: 14, cursor: 'default',
                background: colors.bg,
                border: `1px solid ${colors.text}30`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 8 }}>{sector.name}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: colors.text, marginBottom: 8 }}>
                +{sector.growth}%
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, color: colors.text, fontSize: 12, fontWeight: 600 }}>
                {getTrendIcon(sector.trend)}
                <span style={{ textTransform: 'capitalize' }}>{sector.trend}</span>
              </div>
              <div style={{
                marginTop: 8, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                background: `${colors.text}20`, color: colors.text, display: 'inline-block', textTransform: 'uppercase',
              }}>
                {sector.risk} Risk
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionCard>
  );
};

export default MarketHeatmap;
