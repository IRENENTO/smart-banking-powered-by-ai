import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';

interface NeonButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: {
    bg: 'bg-primary',
    text: 'text-black',
    glow: 'shadow-lg shadow-primary/30',
  },
  secondary: {
    bg: 'bg-secondary',
    text: 'text-white',
    glow: 'shadow-lg shadow-secondary/30',
  },
  danger: {
    bg: 'bg-accent',
    text: 'text-white',
    glow: 'shadow-lg shadow-accent/30',
  },
  ghost: {
    bg: 'bg-glass-light',
    text: 'text-white',
    glow: '',
  },
};

const sizes = {
  sm: 'py-2 px-4',
  md: 'py-3 px-6',
  lg: 'py-4 px-8',
};

export const NeonButton: React.FC<NeonButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  icon,
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const v = variants[variant];
  const s = sizes[size];

  return (
    <TouchableOpacity
      className={`
        ${v.bg} ${s} rounded-xl flex-row items-center justify-center
        ${v.glow} ${disabled ? 'opacity-50' : 'active:opacity-80'}
        ${className}
      `}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#000' : '#fff'} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text className={`${v.text} font-bold text-center ${icon ? 'ml-2' : ''} ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
