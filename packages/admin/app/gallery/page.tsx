'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';

export default function GalleryPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Intruder Gallery</h1>
        <p className="text-gray-400 text-sm mt-1">Captured evidence from all devices</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <GlassCard key={i} className="p-0 overflow-hidden">
            <div className="aspect-square bg-surface-light flex items-center justify-center">
              <span className="text-4xl opacity-30">📷</span>
            </div>
            <div className="p-3 border-t border-glass-border">
              <p className="text-gray-400 text-xs">Device #{i}</p>
              <p className="text-gray-500 text-xs mt-1">No capture yet</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </DashboardLayout>
  );
}
