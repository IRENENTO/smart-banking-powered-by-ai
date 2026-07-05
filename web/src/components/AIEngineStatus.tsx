import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, Clock, Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import SectionCard from './SectionCard';
import ThreeBody from './ThreeBody';
import { useTheme } from '../context/ThemeContext';
import * as aiEngine from '../services/aiService';

const AIEngineStatus: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchStatus = async () => {
        setLoading(true);
        setError(false);
        try {
            const result = await aiEngine.getModelStatus();
            setStatus(result);
        } catch (err) {
            setError(true);
            setStatus(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const isOnline = status?.status !== 'offline' && status?.success;
    const mutedColor = isDark ? '#94a3b8' : '#64748b';
    const textColor = isDark ? '#e2e8f0' : '#1e293b';

    return (
        <SectionCard title="AI Engine Status" headerRight={
            <button onClick={fetchStatus} disabled={loading} style={{
                padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: isDark ? '#1e293b' : '#f1f5f9', color: mutedColor,
            }}>
                {loading ? <ThreeBody size={14} /> : <RefreshCw size={14} />}
            </button>
        }>
            {loading && !status ? (
                <div style={{ padding: 20, textAlign: 'center', color: mutedColor }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#0A9396', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                    Checking AI Engine...
                </div>
            ) : error || !isOnline ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 20 }}>
                    <AlertTriangle size={40} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#f59e0b', marginBottom: 8 }}>AI Engine Offline</div>
                    <div style={{ fontSize: 13, color: mutedColor }}>Using fallback predictions. Start the AI Engine for real-time ML-powered analysis.</div>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ padding: 16, borderRadius: 12, background: isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                            <Brain size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Engine Status</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>Active</div>
                        </div>
                        <div style={{ padding: 16, borderRadius: 12, background: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', border: '1px solid rgba(59,130,246,0.2)', textAlign: 'center' }}>
                            <Activity size={24} color="#3b82f6" style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Accuracy</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>{status?.accuracy || 'N/A'}%</div>
                        </div>
                        <div style={{ padding: 16, borderRadius: 12, background: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb', border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center' }}>
                            <Clock size={24} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Last Trained</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: textColor }}>{status?.last_trained || 'N/A'}</div>
                        </div>
                        <div style={{ padding: 16, borderRadius: 12, background: isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                            <Zap size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Version</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: textColor }}>{status?.version || '1.0'}</div>
                        </div>
                    </div>
                    {status?.models && (
                        <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: mutedColor, marginBottom: 4 }}>Models</div>
                            {status.models.map((model: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                    <span style={{ fontSize: 13, color: textColor }}>{model.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: model.status === 'unavailable' ? '#ef4444' : '#10b981' }}>
                                        {model.status === 'unavailable' ? 'Offline' : model.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: mutedColor }}>
                {isOnline ? <CheckCircle size={12} color="#10b981" /> : <AlertTriangle size={12} color="#f59e0b" />}
                Auto-refreshes every 30 seconds
            </div>
        </SectionCard>
    );
};

export default AIEngineStatus;
