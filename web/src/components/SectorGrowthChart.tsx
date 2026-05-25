import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SectionCard from './SectionCard';
import { useTheme } from '../context/ThemeContext';

interface TrendDataPoint {
  month: string;
  [sector: string]: string | number;
}

interface SectorGrowthChartProps {
  data: TrendDataPoint[];
  loading?: boolean;
}

const COLOR_PALETTE = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#14b8a6', '#d946ef', '#0ea5e9',
  '#eab308', '#a855f7', '#22c55e', '#6366f1',
];

const SECTOR_COLORS: Record<string, string> = {
  agriculture: '#10b981',
  technology: '#3b82f6',
  transport: '#f59e0b',
  retail: '#ef4444',
  realestate: '#8b5cf6',
  manufacturing: '#ec4899',
  energy: '#06b6d4',
  healthcare: '#84cc16',
};

const SectorGrowthChart: React.FC<SectorGrowthChartProps> = ({ data, loading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <SectionCard title="Sector Growth Trends">
        <div style={{ height: 300, borderRadius: 12, background: isDark ? '#1e293b' : '#e2e8f0' }} className="shimmer" />
      </SectionCard>
    );
  }

  const chartData = data && data.length > 0 ? data : [];

  return (
    <SectionCard title="Sector Growth Trends" subtitle="Monthly growth percentage by sector">
      <div style={{ width: '100%', height: 300, marginTop: 8 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {Object.entries(SECTOR_COLORS).map(([key, color]) => (
                <linearGradient key={key} id={`gradient_${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
            <XAxis dataKey="month" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} />
            <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} />
            <Tooltip
              contentStyle={{
                background: isDark ? '#0f172a' : 'white',
                border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                borderRadius: 12,
                color: isDark ? '#e2e8f0' : '#1e293b',
              }}
            />
            <Legend />
            {chartData.length > 0 && Object.keys(chartData[0]).filter(k => k !== 'month').map((sector, idx) => (
              <Area
                key={sector}
                type="monotone"
                dataKey={sector}
                stroke={SECTOR_COLORS[sector] || COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                fill={`url(#gradient_${sector})`}
                strokeWidth={2}
                dot={false}
                name={sector.charAt(0).toUpperCase() + sector.slice(1)}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
};

export default SectorGrowthChart;
