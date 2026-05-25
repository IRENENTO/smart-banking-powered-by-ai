import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface SecurityGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

export const SecurityGauge: React.FC<SecurityGaugeProps> = ({
  score,
  size = 120,
  label = 'Security Score',
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));

  let color = '#FF3366';
  let textColor = 'text-accent';
  if (clampedScore > 75) {
    color = '#00E676';
    textColor = 'text-success';
  } else if (clampedScore > 40) {
    color = '#FFB300';
    textColor = 'text-warning';
  }

  const progress = ((100 - clampedScore) / 100) * circumference;

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View className="absolute items-center justify-center">
        <Text className={`${textColor} text-3xl font-bold`}>
          {clampedScore}
        </Text>
        <Text className="text-gray-500 text-xs">{label}</Text>
      </View>
    </View>
  );
};
