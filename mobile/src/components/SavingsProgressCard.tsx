import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { colors, typography } from '../theme';
import { SavingsGoal } from '../types';

type Props = {
  goal: SavingsGoal;
};

const SavingsProgressCard: React.FC<Props> = ({ goal }) => (
  <GlassCard style={styles.card}>
    <Text style={styles.goal}>{goal.title}</Text>
    <View style={styles.progressBarBackground}>
      <View style={[styles.progressBarFill, { width: `${Math.min(goal.progress, 100)}%` }]} />
    </View>
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{goal.savedAmount.toLocaleString()} saved</Text>
      <Text style={styles.metaLabel}>Target {goal.goalAmount.toLocaleString()}</Text>
    </View>
  </GlassCard>
);

const styles = StyleSheet.create({
  card: {
    paddingVertical: 18,
  },
  goal: {
    color: colors.dark.text,
    fontSize: typography.body,
    fontWeight: '800',
    marginBottom: 14,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.dark.accent,
    borderRadius: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: colors.dark.textSecondary,
    fontSize: typography.small,
  },
});

export default SavingsProgressCard;
