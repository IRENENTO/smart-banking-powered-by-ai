'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';

interface Stats {
  totalUsers: number;
  activeDevices: number;
  totalDevices: number;
  totalAlerts: number;
  criticalAlerts: number;
  todayAlerts: number;
}

interface ActivityData {
  date: string;
  count: number;
}

interface AlertTypeData {
  type: string;
  count: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeDevices: 0,
    totalDevices: 0,
    totalAlerts: 0,
    criticalAlerts: 0,
    todayAlerts: 0,
  });
  const [trends, setTrends] = useState<ActivityData[]>([]);
  const [alertTypes, setAlertTypes] = useState<AlertTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const headers = { Authorization: `Bearer ${token}` };
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

        const [statsRes, trendsRes] = await Promise.all([
          fetch(`${apiUrl}/admin/analytics/overview`, { headers }),
          fetch(`${apiUrl}/admin/analytics/trends?days=7`, { headers }),
        ]);

        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.data);

        const trendsData = await trendsRes.json();
        if (trendsData.success) {
          setTrends(trendsData.data.trends || []);
          setAlertTypes(trendsData.data.alertTypes || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'text-primary' },
    { label: 'Online Devices', value: stats.activeDevices, icon: '📱', color: 'text-success' },
    { label: 'Total Devices', value: stats.totalDevices, icon: '📡', color: 'text-secondary' },
    { label: 'Critical Alerts', value: stats.criticalAlerts, icon: '🚨', color: 'text-accent' },
    { label: 'Today\'s Alerts', value: stats.todayAlerts, icon: '🔔', color: 'text-warning' },
    { label: 'Total Alerts', value: stats.totalAlerts, icon: '⚠️', color: 'text-primary' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time overview of your security ecosystem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => (
          <GlassCard key={i} glow>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>
                  {loading ? '-' : card.value}
                </p>
              </div>
              <span className="text-3xl opacity-50">{card.icon}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard glow>
          <h3 className="text-white font-bold mb-4">Alert Trends (7 Days)</h3>
          {trends.length > 0 ? (
            <div className="space-y-2">
              {trends.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{t.date}</span>
                  <div className="flex items-center gap-2 flex-1 mx-4">
                    <div
                      className="h-2 rounded-full bg-primary/30"
                      style={{ width: `${Math.min(100, (t.count / Math.max(...trends.map((x: any) => x.count))) * 100)}%` }}
                    />
                  </div>
                  <span className="text-white text-sm font-mono">{t.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No trend data available</p>
          )}
        </GlassCard>

        <GlassCard glow>
          <h3 className="text-white font-bold mb-4">Alert Type Distribution</h3>
          {alertTypes.length > 0 ? (
            <div className="space-y-3">
              {alertTypes.map((at, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm capitalize">
                    {at.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-white font-mono">{at.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No alert data yet</p>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
