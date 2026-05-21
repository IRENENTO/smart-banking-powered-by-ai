import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, borderRadius, shadows } from '../theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => (
  <LinearGradient colors={gradients.glass} style={[styles.card, style]}>
    <BlurView intensity={80} tint="dark" style={styles.blur}>
      {children}
    </BlurView>
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginBottom: 16,
    ...shadows.card,
  },
  blur: {
    padding: 18,
    minHeight: 100,
  },
});

export default GlassCard;
