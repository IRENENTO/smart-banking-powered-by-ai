'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/analytics/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Security metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard glow>
          <h3 className="text-white font-bold mb-4">System Overview</h3>
          <div className="space-y-4">
            {[
              { label: 'Total Users', value: stats?.totalUsers || 0 },
              { label: 'Total Devices', value: stats?.totalDevices || 0 },
              { label: 'Active Devices', value: stats?.activeDevices || 0 },
              { label: 'Total Alerts', value: stats?.totalAlerts || 0 },
              { label: 'Critical Alerts', value: stats?.criticalAlerts || 0 },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-400">{item.label}</span>
                <span className="text-white font-bold text-lg font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard glow>
          <h3 className="text-white font-bold mb-4">Security Health</h3>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-6xl mb-4">
              {(stats?.criticalAlerts || 0) > 0 ? '⚠️' : '✅'}
            </div>
            <p className="text-white text-xl font-bold">
              {(stats?.criticalAlerts || 0) > 0 ? 'Attention Needed' : 'All Clear'}
            </p>
            <p className="text-gray-400 text-sm mt-2 text-center">
              {stats?.criticalAlerts || 0} critical alerts need review
            </p>
          </div>
        </GlassCard>

        <GlassCard glow>
          <h3 className="text-white font-bold mb-4">Today's Activity</h3>
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-primary font-mono">
              {stats?.todayAlerts || 0}
            </p>
            <p className="text-gray-400 mt-2">Alerts in last 24 hours</p>
          </div>
        </GlassCard>

        <GlassCard glow>
          <h3 className="text-white font-bold mb-4">Device Status</h3>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Online</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-surface-lighter overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${stats?.totalDevices ? (stats.activeDevices / stats.totalDevices) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-white font-mono w-12 text-right">{stats?.activeDevices || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Offline</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-surface-lighter overflow-hidden">
                  <div
                    className="h-full bg-gray-500 rounded-full transition-all"
                    style={{ width: `${stats?.totalDevices ? ((stats.totalDevices - stats.activeDevices) / stats.totalDevices) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-white font-mono w-12 text-right">{stats?.totalDevices - stats?.activeDevices || 0}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
