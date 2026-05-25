'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: string;
  type: string;
  isResolved: boolean;
  triggeredAt: string;
  Device?: { deviceName: string; deviceModel: string };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/alerts?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setAlerts(data.data);
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const severityColors: Record<string, string> = {
    critical: 'bg-accent/20 text-accent border-accent/30',
    high: 'bg-warning/20 text-warning border-warning/30',
    medium: 'bg-primary/20 text-primary border-primary/30',
    low: 'bg-success/20 text-success border-success/30',
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Security Alerts</h1>
        <p className="text-gray-400 text-sm mt-1">All system-wide alerts across devices</p>
      </div>

      <GlassCard>
        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No alerts found</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-4 p-4 rounded-xl bg-surface-light border border-glass-border">
                <div className={`w-2 h-full min-h-[3rem] rounded-full ${severityColors[alert.severity]?.split(' ')[0] || 'bg-gray-500'}`} style={{ width: 4 }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold">{alert.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${severityColors[alert.severity] || 'bg-gray-500/20 text-gray-400'}`}>
                      {alert.severity}
                    </span>
                    {alert.isResolved && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{alert.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-gray-500 text-xs">
                      {alert.Device?.deviceName || 'Unknown Device'}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(alert.triggeredAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </DashboardLayout>
  );
}
