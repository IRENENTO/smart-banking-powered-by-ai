'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';

interface Device {
  id: string;
  deviceName: string;
  deviceModel: string;
  osVersion: string;
  isOnline: boolean;
  isProtected: boolean;
  batteryLevel: number;
  lastSeen: string;
  User?: { name: string; email: string };
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/devices`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setDevices(data.data);
      } catch (err) {
        console.error('Failed to load devices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Device Management</h1>
        <p className="text-gray-400 text-sm mt-1">Monitor all registered devices</p>
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="text-left text-gray-400 text-sm font-medium pb-3 pr-4">Device</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3 pr-4">Owner</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3 pr-4">Status</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3 pr-4">Battery</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    {loading ? 'Loading...' : 'No devices registered'}
                  </td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr key={device.id} className="border-b border-glass-border/50 hover:bg-glass-light transition-colors">
                    <td className="py-4 pr-4">
                      <p className="text-white font-medium">{device.deviceName || 'Unnamed'}</p>
                      <p className="text-gray-500 text-sm">{device.deviceModel} - {device.osVersion}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="text-white">{device.User?.name || 'Unknown'}</p>
                      <p className="text-gray-500 text-sm">{device.User?.email}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${device.isOnline ? 'bg-success/20 text-success' : 'bg-gray-500/20 text-gray-400'}`}>
                        {device.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white font-mono">{device.batteryLevel}%</span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-400 text-sm">
                        {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
