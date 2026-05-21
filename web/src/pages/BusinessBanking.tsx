import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import SectionCard from '../components/SectionCard';
import { motion } from 'framer-motion';
import { Briefcase, BarChart3, TrendingUp, PieChart, Brain, Zap, Shield, DollarSign, Target } from 'lucide-react';
import * as aiEngine from '../services/aiService';
import { marketService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const BusinessBanking: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sectorData, setSectorData] = useState<any[]>([]);
  const [marketTrends, setMarketTrends] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiOnline, setAiOnline] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trends, sectors, modelStatus, recs] = await Promise.all([
        marketService.getTrends().catch(() => ({ data: null })),
        marketService.getSectors().catch(() => ({ data: null })),
        aiEngine.getModelStatus().catch(() => null),
        aiEngine.getRecommendations({ income: 500000, expenses: 200000, risk_tolerance: 'moderate', goals: ['investment', 'growth'] }).catch(() => null),
      ]);
      const isOnline = modelStatus?.success && modelStatus?.status !== 'offline';
      setAiOnline(isOnline);
      setMarketTrends(trends.data);
      setSectorData(Array.isArray(sectors.data) ? sectors.data : generateSectors());
      setAiRecommendations(recs || generateFallbackRecs());
    } catch {
      setSectorData(generateSectors());
      setAiRecommendations(generateFallbackRecs());
    } finally {
      setLoading(false);
    }
  };

  const generateSectors = () => [
    { name: 'Agriculture', growth: 16, risk: 'low', opportunities: 'Export, Agri-tech', demand: 'High' },
    { name: 'Technology', growth: 22, risk: 'medium', opportunities: 'Fintech, E-commerce', demand: 'Very High' },
    { name: 'Real Estate', growth: 12, risk: 'low', opportunities: 'Housing, Commercial', demand: 'High' },
    { name: 'Energy', growth: 18, risk: 'low', opportunities: 'Renewable, Solar', demand: 'Growing' },
    { name: 'Transport', growth: 8, risk: 'medium', opportunities: 'Logistics, Ride-hailing', demand: 'Moderate' },
    { name: 'Retail', growth: 5, risk: 'high', opportunities: 'E-commerce, M-Commerce', demand: 'Stable' },
  ];

  const generateFallbackRecs = () => ({
    sector_recommendations: generateSectors().map(s => ({
      sector_name: s.name,
      risk_level: s.risk,
      growth_rate: s.growth,
      expected_return: `+${s.growth}%`,
      recommendation: `${s.name} sector shows ${s.growth}% growth potential in Rwanda.`,
      insight: `${s.opportunities} driving expansion.`,
    })),
    priority_actions: ['Explore Agriculture tech opportunities in Rwanda', 'Consider renewable energy investments', 'Leverage Kigali fintech growth'],
    ai_powered: false,
  });

  const features = [
    { icon: Briefcase, title: 'Business Accounts', description: 'Dedicated accounts designed for your business. Manage payroll, invoices, and business expenses efficiently.' },
    { icon: BarChart3, title: 'Revenue Tracking', description: 'Real-time tracking of business revenue and expenses. Automated reporting and financial analytics for better decisions.' },
    { icon: TrendingUp, title: 'SME Loan Support', description: 'Access growth capital quickly with our AI-powered SME loans. Flexible terms tailored to your business needs.' },
    { icon: PieChart, title: 'Business Analytics', description: 'Advanced analytics dashboard showing cash flow, profitability, and business performance metrics.' },
  ];

  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <PageLayout title="Business Banking" subtitle="Financial solutions for SMEs and enterprises">
      <div style={{ display: 'grid', gap: 40 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'linear-gradient(135deg, #0A9396, #059669)', color: 'white', padding: '30px', borderRadius: 12 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ marginTop: 0 }}>Grow Your Business with AI</h2>
              <p style={{ lineHeight: 1.8, fontSize: '16px', maxWidth: 600 }}>
                AI-powered business intelligence for Rwanda's growing economy. Make data-driven decisions with real-time market analytics.
              </p>
            </div>
            <div style={{
              padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: aiOnline ? 'rgba(255,255,255,0.2)' : 'rgba(245,158,11,0.3)',
              color: 'white', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Brain size={14} />
              AI {aiOnline ? 'Active' : 'Fallback'}
            </div>
          </div>
        </motion.div>

        {!loading && sectorData.length > 0 && (
          <div>
            <h2 style={{ color: '#0B1F3A', marginBottom: 20 }}>Rwanda Sector Opportunities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {sectorData.map((sector: any, idx: number) => (
                <motion.div key={sector.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -4 }}
                  style={{
                    padding: 24, borderRadius: 16, background: isDark ? '#0f172a' : 'white',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h4 style={{ margin: 0, color: textColor, fontSize: 16 }}>{sector.name}</h4>
                    <span style={{
                      padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      background: sector.risk === 'low' ? 'rgba(16,185,129,0.15)' : sector.risk === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                      color: sector.risk === 'low' ? '#10b981' : sector.risk === 'medium' ? '#f59e0b' : '#ef4444',
                    }}>
                      {sector.risk} risk
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: mutedColor }}>Growth Rate</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#0A9396' }}>+{sector.growth}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: mutedColor }}>Demand</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: textColor }}>{sector.demand}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: mutedColor }}>{sector.opportunities}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {aiRecommendations?.sector_recommendations && (
          <SectionCard title="AI Business Investment Analysis" subtitle={aiOnline ? 'Powered by real-time AI' : 'Based on market data'}>
            <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
              {aiRecommendations.sector_recommendations.slice(0, 4).map((s: any, idx: number) => (
                <motion.div key={s.sector_name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                  style={{ padding: 16, borderRadius: 14, background: isDark ? '#0f172a' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #0A9396, #4ECDC4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Target size={16} color="white" />
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 14, color: textColor }}>{s.sector_name}</span>
                        <span style={{ fontSize: 12, color: mutedColor, marginLeft: 8 }}>{s.expected_return}</span>
                      </div>
                    </div>
                    <span style={{
                      padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                      background: s.risk_level === 'low' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: s.risk_level === 'low' ? '#10b981' : '#f59e0b',
                    }}>{s.risk_level}</span>
                  </div>
                  <div style={{ fontSize: 13, color: mutedColor, lineHeight: 1.5 }}>{s.recommendation}</div>
                  {s.insight && (
                    <div style={{ marginTop: 8, fontSize: 12, color: isDark ? '#7dd3fc' : '#0A9396', fontStyle: 'italic' }}>
                      {s.insight}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </SectionCard>
        )}

        <div>
          <h2 style={{ color: '#0B1F3A', marginBottom: 24 }}>Business Solutions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.1 }} whileHover={{ y: -5 }}
                  style={{ background: 'white', padding: '30px', borderRadius: 12, boxShadow: '0 4px 15px rgba(10, 147, 150, 0.1)', border: '1px solid rgba(10, 147, 150, 0.1)' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 10, background: 'linear-gradient(135deg, #0A9396, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon size={24} color="white" />
                  </div>
                  <h3 style={{ color: '#0B1F3A', marginTop: 0, marginBottom: 12 }}>{feature.title}</h3>
                  <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {aiRecommendations?.priority_actions && (
          <SectionCard title="AI-Powered Business Recommendations">
            <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
              {aiRecommendations.priority_actions.map((action: string, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, background: isDark ? '#0f172a' : '#f8fafc' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #0A9396, #4ECDC4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                  <span style={{ fontSize: 13, color: mutedColor, flex: 1 }}>{action}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: 'white', padding: '40px', borderRadius: 12, border: '1px solid rgba(10, 147, 150, 0.1)' }}>
          <h2 style={{ color: '#0B1F3A', marginTop: 0 }}>Business Loans</h2>
          <p style={{ color: '#64748b', lineHeight: 1.8, marginBottom: 24 }}>
            Access capital to grow your business with our AI-powered loan assessment. Get approved in hours, not weeks.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            {[
              { name: 'Working Capital', amount: 'Up to 50M RWF', term: '12-36 months' },
              { name: 'Equipment Loan', amount: 'Up to 100M RWF', term: '24-60 months' },
              { name: 'Expansion Loan', amount: 'Customized', term: 'Flexible' }
            ].map((loan) => (
              <div key={loan.name} style={{ background: '#f8fafc', padding: '20px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <h4 style={{ color: '#0A9396', marginTop: 0 }}>{loan.name}</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}><strong>Amount:</strong> {loan.amount}<br /><strong>Term:</strong> {loan.term}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default BusinessBanking;
