import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { AIInsight } from '../types';
import { colors, typography } from '../theme';

const FraudAlertCard: React.FC<{ alert: AIInsight }> = ({ alert }) => (
  <GlassCard style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.label}>Fraud Alert</Text>
      <Text style={styles.status}>{alert.severity.toUpperCase()}</Text>
    </View>
    <Text style={styles.title}>{alert.title}</Text>
    <Text style={styles.message}>{alert.message}</Text>
  </GlassCard>
);

const styles = StyleSheet.create({
  card: {
    paddingVertical: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    color: colors.dark.accent,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  status: {
    color: colors.dark.error,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  title: {
    color: colors.dark.text,
    fontSize: typography.body,
    fontWeight: '800',
    marginBottom: 10,
  },
  message: {
    color: colors.dark.textSecondary,
    fontSize: typography.small,
    lineHeight: 20,
  },
});

export default FraudAlertCard;
