'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  gradient?: boolean;
}

export default function GlassCard({ children, className, glow, gradient }: GlassCardProps) {
  return (
    <div
      className={clsx(
        'glass-card p-6 transition-all duration-300',
        glow && 'glass-card-hover',
        gradient && 'gradient-border',
        className
      )}
    >
      {children}
    </div>
  );
}
