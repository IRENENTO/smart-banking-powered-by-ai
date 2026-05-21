import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { NotificationItem } from '../types';
import { colors, typography } from '../theme';

const NotificationCard: React.FC<{ item: NotificationItem }> = ({ item }) => (
  <GlassCard style={[styles.card, item.is_read ? styles.read : styles.unread]}>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.message}>{item.message}</Text>
    <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
  </GlassCard>
);

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
  },
  unread: {
    borderColor: colors.dark.accent,
  },
  read: {
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: colors.dark.text,
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    color: colors.dark.textSecondary,
    fontSize: typography.small,
    marginBottom: 10,
  },
  date: {
    color: colors.dark.textSecondary,
    fontSize: typography.caption,
  },
});

export default NotificationCard;
