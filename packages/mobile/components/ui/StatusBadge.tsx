import React from 'react';
import { View, Text } from 'react-native';

interface StatusBadgeProps {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const variants = {
  success: { bg: 'bg-success/20', text: 'text-success', dot: 'bg-success' },
  warning: { bg: 'bg-warning/20', text: 'text-warning', dot: 'bg-warning' },
  danger: { bg: 'bg-accent/20', text: 'text-accent', dot: 'bg-accent' },
  info: { bg: 'bg-primary/20', text: 'text-primary', dot: 'bg-primary' },
  neutral: { bg: 'bg-gray-500/20', text: 'text-gray-400', dot: 'bg-gray-500' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant,
  size = 'sm',
  pulse = false,
}) => {
  const v = variants[variant];
  const isSm = size === 'sm';

  return (
    <View className={`${v.bg} rounded-full flex-row items-center px-3 py-1`}>
      <View
        className={`${v.dot} rounded-full ${isSm ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${pulse ? 'opacity-75' : ''}`}
      />
      <Text className={`${v.text} ${isSm ? 'text-xs' : 'text-sm'} ml-1.5 font-medium`}>
        {label}
      </Text>
    </View>
  );
};
