import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { Transaction } from '../types';
import { colors, typography } from '../theme';

const TransactionCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const positive = transaction.type === 'deposit' || transaction.type === 'payment';

  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.title}>{transaction.description || transaction.type}</Text>
          <Text style={styles.subtitle}>{new Date(transaction.created_at).toLocaleString()}</Text>
        </View>
        <Text style={[styles.amount, positive ? styles.positive : styles.negative]}>
          {positive ? '+' : '-'}{transaction.amount.toLocaleString()} RWF
        </Text>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.dark.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.dark.textSecondary,
    fontSize: typography.small,
    marginTop: 6,
  },
  amount: {
    fontSize: typography.body,
    fontWeight: '800',
  },
  positive: {
    color: colors.dark.success,
  },
  negative: {
    color: colors.dark.error,
  },
});

export default TransactionCard;
