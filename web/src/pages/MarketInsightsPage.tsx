import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { TrendingUp, Shield, Globe, Sparkles } from 'lucide-react';

const MarketInsightsPage: React.FC = () => {
  return (
    <PageLayout
      title="Market Insights"
      subtitle="Actionable sector analysis and AI recommendations to help you grow safely."
    >
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
          <SectionCard title="Rwanda Sector Pulse">
            <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
              <div style={{ padding: 18, borderRadius: 16, background: '#ecfdf5', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>Agriculture</div>
                <div style={{ marginTop: 6, color: '#166534' }}>Strong demand for food processing and livestock markets. Good entry point for value-chain investments.</div>
              </div>
              <div style={{ padding: 18, borderRadius: 16, background: '#fffbeb', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>Retail</div>
                <div style={{ marginTop: 6, color: '#92400e' }}>Competition is high, so focus on niche products and strong customer service to protect margins.</div>
              </div>
              <div style={{ padding: 18, borderRadius: 16, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8' }}>Transport</div>
                <div style={{ marginTop: 6, color: '#1d4ed8' }}>Consumer demand is stable. Operational efficiency and cost control will be more important than expansion now.</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="AI Guidance">
            <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
              <div style={{ fontSize: 13, color: '#475569' }}>
                <Sparkles size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                AI recommends growing your savings by reinvesting up to 15% of monthly surplus into safer assets.
              </div>
              <div style={{ fontSize: 13, color: '#475569' }}>
                <Sparkles size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Keep a minimum emergency reserve equal to 3 months of average expenses to reduce financial risk.
              </div>
              <div style={{ fontSize: 13, color: '#475569' }}>
                <Sparkles size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Monitor seasonal demand: agriculture and transport show the best growth signals for the next quarter.
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="What to do next">
          <div style={{ display: 'grid', gap: 18, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', padding: 16, borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <Globe size={18} color="#0f766e" />
              <div>
                <div style={{ fontWeight: 600, color: '#0f766e' }}>Track market signals</div>
                <div style={{ fontSize: 13, color: '#475569' }}>Review the sector momentum and adjust your plans monthly.</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff7ed', padding: 16, borderRadius: 14, border: '1px solid #fed7aa' }}>
              <Shield size={18} color="#b45309" />
              <div>
                <div style={{ fontWeight: 600, color: '#b45309' }}>Reduce risk exposure</div>
                <div style={{ fontSize: 13, color: '#475569' }}>Keep at least 30% of your portfolio in stable cash or savings targets.</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginTop: 22, gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <Link to="/ai-insights" style={{ textDecoration: 'none' }}>
              <LoadingButton variant="primary" style={{ width: '100%' }}>
                View AI Insights
              </LoadingButton>
            </Link>
            <Link to="/investments" style={{ textDecoration: 'none' }}>
              <LoadingButton variant="secondary" style={{ width: '100%' }}>
                Explore Investment Plans
              </LoadingButton>
            </Link>
          </div>
        </SectionCard>
      </div>
    </PageLayout>
  );
};

export default MarketInsightsPage;
