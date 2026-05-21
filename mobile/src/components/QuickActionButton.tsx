import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, borderRadius, shadows } from '../theme';

type QuickActionButtonProps = {
  icon: string;
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, onPress, style }) => (
  <TouchableOpacity style={[styles.button, style]} activeOpacity={0.8} onPress={onPress}>
    <View style={styles.iconBox}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.dark.text} />
    </View>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: 110,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(46,229,213,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: {
    color: colors.dark.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default QuickActionButton;
