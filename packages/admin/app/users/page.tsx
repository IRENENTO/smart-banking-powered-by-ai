'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setUsers(data.data);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)));
      }
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 text-sm mt-1">Manage registered users and their access</p>
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="text-left text-gray-400 text-sm font-medium pb-3 pr-4">User</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3 pr-4">Role</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3 pr-4">Status</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3 pr-4">Verified</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    {loading ? 'Loading...' : 'No users found'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-glass-border/50 hover:bg-glass-light transition-colors">
                    <td className="py-4 pr-4">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-success/20 text-success' : 'bg-accent/20 text-accent'}`}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={user.isVerified ? 'text-success' : 'text-gray-500'}>
                        {user.isVerified ? '✓ Verified' : '✗ Unverified'}
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                          user.isActive
                            ? 'bg-accent/20 text-accent hover:bg-accent/30'
                            : 'bg-success/20 text-success hover:bg-success/30'
                        }`}
                      >
                        {user.isActive ? 'Ban' : 'Unban'}
                      </button>
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
