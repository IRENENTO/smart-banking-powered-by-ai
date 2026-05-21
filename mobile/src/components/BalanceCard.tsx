import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '../theme';

type BalanceCardProps = {
  balance: number;
  currency: string;
  label?: string;
  change?: string;
};

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, currency, label = 'Total balance', change }) => (
  <GlassCard style={styles.card}>
    <View style={styles.header}>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.balance}>{currency} {balance.toLocaleString()}</Text>
      </View>
      <MaterialCommunityIcons name="currency-rub" color={colors.dark.accent} size={28} />
    </View>
    {change ? <Text style={styles.change}>{change}</Text> : null}
  </GlassCard>
);

const styles = StyleSheet.create({
  card: {
    paddingVertical: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.dark.textSecondary,
    fontSize: typography.small,
    marginBottom: 8,
  },
  balance: {
    color: colors.dark.text,
    fontSize: typography.h1,
    fontWeight: '800',
  },
  change: {
    marginTop: 14,
    color: colors.dark.success,
    fontSize: typography.body,
    fontWeight: '600',
  },
});

export default BalanceCard;
