import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps extends ViewProps {
  gradientColors?: string[];
  glowColor?: string;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  gradientColors,
  glowColor,
  children,
  className = '',
  style,
  ...props
}) => {
  return (
    <View
      className={`rounded-2xl border border-glass-border ${className}`}
      style={[
        {
          backgroundColor: 'rgba(19, 19, 26, 0.8)',
          shadowColor: glowColor || 'rgba(0, 245, 255, 0.15)',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        },
        style,
      ]}
      {...props}
    >
      {gradientColors && (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0 rounded-2xl opacity-30"
        />
      )}
      <View className="absolute inset-0 rounded-2xl bg-glass-bg" />
      <View className="p-4 relative z-10">{children}</View>
    </View>
  );
};

export const GlassCardHeader: React.FC<{
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}> = ({ title, subtitle, rightElement }) => (
  <View className="flex-row justify-between items-center mb-3">
    <View className="flex-1">
      <Text className="text-white text-lg font-bold">{title}</Text>
      {subtitle && <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>}
    </View>
    {rightElement}
  </View>
);
