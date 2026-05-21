import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lightbulb, Layers } from 'lucide-react';
import SectionCard from './SectionCard';
import { useTheme } from '../context/ThemeContext';

interface SectorAllocation {
  sector: string;
  allocation: number;
  rationale: string;
}

interface InvestmentRecommendationProps {
  recommendations: string[];
  sectorAllocations: SectorAllocation[];
  priorityActions: string[];
  marketOutlook?: string;
  loading?: boolean;
}

const InvestmentRecommendation: React.FC<InvestmentRecommendationProps> = ({
  recommendations, sectorAllocations, priorityActions, marketOutlook, loading
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <SectionCard title="AI Investment Recommendations">
        <div className="shimmer" style={{ height: 200, borderRadius: 12, background: isDark ? '#1e293b' : '#e2e8f0' }} />
      </SectionCard>
    );
  }

  const COLORS = ['#0A9396', '#4ECDC4', '#F4A261', '#E76F51', '#2EC4B6', '#8B5CF6'];

  return (
    <SectionCard title="Investment Recommendations" headerRight={
      <span style={{
        padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
        background: marketOutlook === 'positive' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
        color: marketOutlook === 'positive' ? '#10b981' : '#f59e0b',
      }}>
        {marketOutlook === 'positive' ? 'Bullish' : 'Neutral'} Outlook
      </span>
    }>
      <div style={{ display: 'grid', gap: 20 }}>
        {recommendations.length > 0 && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lightbulb size={16} color="#0A9396" /> Top Recommendations
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    borderRadius: 12, background: isDark ? '#0f172a' : '#f8fafc',
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(135deg, ${COLORS[idx % COLORS.length]}, ${COLORS[(idx + 1) % COLORS.length]})`,
                    color: 'white', fontSize: 12, fontWeight: 700
                  }}>{idx + 1}</div>
                  <span style={{ fontSize: 13, color: isDark ? '#cbd5e1' : '#475569', flex: 1 }}>{rec}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {sectorAllocations.length > 0 && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={16} color="#0A9396" /> Recommended Portfolio Allocation
            </div>
            <div style={{ height: 24, borderRadius: 12, overflow: 'hidden', display: 'flex', marginBottom: 12 }}>
              {sectorAllocations.map((s, idx) => (
                <motion.div
                  key={s.sector}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.allocation}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.15 }}
                  style={{ width: `${s.allocation}%`, background: COLORS[idx % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', minWidth: s.allocation > 15 ? undefined : 0 }}
                  title={`${s.sector}: ${s.allocation}%`}
                >
                  {s.allocation > 15 ? `${s.allocation}%` : ''}
                </motion.div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {sectorAllocations.map((s, idx) => (
                <div key={s.sector} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: COLORS[idx % COLORS.length] }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b', width: 100 }}>{s.sector}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: isDark ? '#1e293b' : '#e2e8f0', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.allocation}%` }} transition={{ duration: 0.6, delay: idx * 0.1 }}
                      style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${COLORS[idx % COLORS.length]}, ${COLORS[(idx + 1) % COLORS.length]})` }}
                    />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', width: 40, textAlign: 'right' }}>{s.allocation}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {priorityActions.length > 0 && (
          <div style={{ padding: 16, borderRadius: 14, background: isDark ? 'rgba(10,147,150,0.08)' : '#ecfeff', border: '1px solid rgba(10,147,150,0.2)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#7dd3fc' : '#0A9396', marginBottom: 10 }}>Priority Actions</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {priorityActions.map((action, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: isDark ? '#cbd5e1' : '#475569' }}>
                  <span style={{ color: '#0A9396', fontWeight: 700 }}>{idx + 1}.</span>
                  {action}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default InvestmentRecommendation;
