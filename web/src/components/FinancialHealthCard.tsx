import React from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, TrendingDown, DollarSign, PieChart, Target } from 'lucide-react';
import SectionCard from './SectionCard';
import { useTheme } from '../context/ThemeContext';

interface FinancialHealthCardProps {
  score: number;
  rating: string;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  recommendations: string[];
  loading?: boolean;
}

const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({
  score, rating, totalIncome, totalExpenses, savingsRate, recommendations, loading
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <SectionCard title="Financial Health">
        <div className="shimmer" style={{ height: 200, borderRadius: 12, background: isDark ? '#1e293b' : '#e2e8f0' }} />
      </SectionCard>
    );
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#f59e0b';
    if (s >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return isDark ? '#064e3b' : '#d1fae5';
    if (s >= 60) return isDark ? '#451a03' : '#fef3c7';
    if (s >= 40) return isDark ? '#431407' : '#ffedd5';
    return isDark ? '#3b1c1c' : '#fee2e2';
  };

  const getRatingLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const scoreColor = getScoreColor(score);
  const scoreBg = getScoreBg(score);

  return (
    <SectionCard title="Financial Health Assessment">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
        <div style={{ textAlign: 'center', padding: 20, borderRadius: 16, background: scoreBg }}>
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 12px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none" stroke={scoreColor} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 45}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - score / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              fontSize: 24, fontWeight: 800, color: scoreColor,
            }}>
              {score}
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: scoreColor }}>{rating || getRatingLabel(score)}</div>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, background: isDark ? '#0f172a' : '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <DollarSign size={14} color="#0A9396" />
              <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>Monthly Income</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e293b' }}>
              {totalIncome.toLocaleString()} RWF
            </span>
          </div>
          <div style={{ padding: 12, borderRadius: 12, background: isDark ? '#0f172a' : '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <PieChart size={14} color="#f59e0b" />
              <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>Monthly Expenses</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e293b' }}>
              {totalExpenses.toLocaleString()} RWF
            </span>
          </div>
          <div style={{ padding: 12, borderRadius: 12, background: isDark ? '#0f172a' : '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Target size={14} color="#10b981" />
              <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>Savings Rate</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{savingsRate}%</span>
          </div>
        </div>
      </div>
      {recommendations.length > 0 && (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: isDark ? 'rgba(10,147,150,0.08)' : '#ecfeff', border: '1px solid rgba(10,147,150,0.2)' }}>
          {recommendations.map((rec, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: idx < recommendations.length - 1 ? 8 : 0, fontSize: 13, color: isDark ? '#cbd5e1' : '#475569' }}>
              <Heart size={14} color="#0A9396" style={{ marginTop: 2, flexShrink: 0 }} />
              {rec}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

export default FinancialHealthCard;
