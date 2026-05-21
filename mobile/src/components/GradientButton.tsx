import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, borderRadius, shadows } from '../theme';

type GradientButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
};

const GradientButton: React.FC<GradientButtonProps> = ({ title, onPress, style, textStyle, icon }) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.button, style]}>
    <LinearGradient colors={gradients.accent} style={styles.gradient}>
      {icon}
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.button,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  text: {
    color: '#051014',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default GradientButton;
