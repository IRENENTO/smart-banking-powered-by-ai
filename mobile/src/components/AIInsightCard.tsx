import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { AIInsight } from '../types';
import { colors, typography } from '../theme';

const severityColors: Record<string, string> = {
  high: '#FF5B7F',
  medium: '#F59E0B',
  low: '#3BFFB1',
};

const AIInsightCard: React.FC<{ insight: AIInsight }> = ({ insight }) => (
  <GlassCard style={styles.card}>
    <View style={styles.header}>
      <View style={[styles.badge, { backgroundColor: `${severityColors[insight.severity] ?? '#0ACBFF'}22` }]}> 
        <Text style={[styles.badgeText, { color: severityColors[insight.severity] ?? '#0ACBFF' }]}>{insight.severity.toUpperCase()}</Text>
      </View>
      <Text style={styles.time}>{new Date(insight.created_at).toLocaleDateString()}</Text>
    </View>
    <Text style={styles.title}>{insight.title}</Text>
    <Text style={styles.message}>{insight.message}</Text>
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
    marginBottom: 12,
  },
  badge: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  time: {
    color: colors.dark.textSecondary,
    fontSize: typography.caption,
  },
  title: {
    color: colors.dark.text,
    fontSize: typography.body,
    fontWeight: '800',
    marginBottom: 8,
  },
  message: {
    color: colors.dark.textSecondary,
    fontSize: typography.small,
    lineHeight: 20,
  },
});

export default AIInsightCard;
