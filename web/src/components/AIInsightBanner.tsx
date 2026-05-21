import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AIInsightBannerProps {
  insights: string[];
  autoRotateInterval?: number;
}

const AIInsightBanner: React.FC<AIInsightBannerProps> = ({ insights, autoRotateInterval = 6000 }) => {
  const [current, setCurrent] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (insights.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % insights.length);
    }, autoRotateInterval);
    return () => clearInterval(timer);
  }, [insights.length, autoRotateInterval]);

  if (insights.length === 0) {
    return (
      <div style={{
        padding: '18px 24px', borderRadius: 16,
        background: isDark ? 'linear-gradient(135deg, rgba(10,147,150,0.15), rgba(78,205,196,0.05))' : 'linear-gradient(135deg, #ecfeff, #f0fdfa)',
        border: '1px solid rgba(10,147,150,0.2)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Sparkles size={20} color="#0A9396" />
        <span style={{ fontSize: 14, color: isDark ? '#7dd3fc' : '#0f766e' }}>
          AI insights will appear here once market data is analyzed.
        </span>
      </div>
    );
  }

  return (
    <div style={{
      padding: '18px 24px', borderRadius: 16,
      background: isDark ? 'linear-gradient(135deg, rgba(10,147,150,0.15), rgba(78,205,196,0.05))' : 'linear-gradient(135deg, #ecfeff, #f0fdfa)',
      border: '1px solid rgba(10,147,150,0.2)',
      display: 'flex', alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden',
    }}>
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ flexShrink: 0 }}
      >
        <Sparkles size={20} color="#0A9396" />
      </motion.div>
      <div style={{ flex: 1, minHeight: 24, position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 500 }}
          >
            <span style={{ flex: 1 }}>{insights[current]}</span>
          </motion.div>
        </AnimatePresence>
      </div>
      {insights.length > 1 && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => setCurrent(prev => (prev - 1 + insights.length) % insights.length)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrent(prev => (prev + 1) % insights.length)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 4, position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)' }}>
        {insights.map((_, idx) => (
          <div key={idx} style={{
            width: 6, height: 6, borderRadius: 3,
            background: idx === current ? '#0A9396' : isDark ? '#475569' : '#cbd5e1',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </div>
  );
};

export default AIInsightBanner;
