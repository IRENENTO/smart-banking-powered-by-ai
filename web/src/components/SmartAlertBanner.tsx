import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, X, Sparkles } from 'lucide-react';
import { aiService } from '../services/api';

interface AlertItem {
  id: string;
  type: 'warning' | 'success' | 'info';
  message: string;
}

// Fallback alerts when API is unavailable
const FALLBACK_ALERTS: AlertItem[] = [
  { id: 'a1', type: 'warning', message: '⚠️ Unusual transaction detected on your account – review your recent activity.' },
  { id: 'a2', type: 'success', message: '✅ You are on track to hit your Emergency Fund goal 2 months early!' },
  { id: 'a3', type: 'info',    message: '💡 AI Tip: Reducing transport spending by 15% could save you RWF 8,500 this month.' },
];

const SmartAlertBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    aiService.getInsights()
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          const mapped: AlertItem[] = data.map((ins: any, i: number) => ({
            id: ins.id ?? `api-${i}`,
            type: ins.type ?? (ins.impact?.toLowerCase().includes('warn') ? 'warning' : 'success'),
            message: ins.message ?? ins.detail ?? ins.title ?? 'New AI Insight',
          }));
          setAlerts(mapped);
        } else {
          setAlerts(FALLBACK_ALERTS);
        }
      })
      .catch(() => setAlerts(FALLBACK_ALERTS));
  }, []);

  // Auto-rotate banners every 6 s
  useEffect(() => {
    if (alerts.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % alerts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [alerts.length]);

  const visible = alerts.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  const current = visible[activeIndex % visible.length];
  const isWarning = current.type === 'warning';
  const isSuccess = current.type === 'success';

  const bgClass = isWarning
    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50'
    : isSuccess
    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/50'
    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50';

  const textClass = isWarning
    ? 'text-amber-800 dark:text-amber-300'
    : isSuccess
    ? 'text-emerald-800 dark:text-emerald-300'
    : 'text-blue-800 dark:text-blue-300';

  const Icon = isWarning ? AlertTriangle : isSuccess ? CheckCircle2 : Sparkles;
  const iconClass = isWarning
    ? 'text-amber-500'
    : isSuccess
    ? 'text-emerald-500'
    : 'text-blue-500';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: -12, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -12, height: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`w-full border rounded-xl mb-6 px-4 py-3 flex items-center gap-3 ${bgClass}`}
      >
        <Icon size={18} className={`flex-shrink-0 ${iconClass}`} />
        <span className={`flex-1 text-sm font-medium ${textClass}`}>{current.message}</span>

        {/* Dot indicators */}
        {visible.length > 1 && (
          <div className="flex gap-1.5 flex-shrink-0">
            {visible.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === activeIndex % visible.length
                    ? (isWarning ? 'bg-amber-500' : isSuccess ? 'bg-emerald-500' : 'bg-blue-500')
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => setDismissed((prev) => new Set(prev).add(current.id))}
          className={`p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0 ${textClass}`}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default SmartAlertBanner;
