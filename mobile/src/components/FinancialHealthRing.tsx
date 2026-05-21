import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

type Props = {
  score: number;
};

const FinancialHealthRing: React.FC<Props> = ({ score }) => (
  <View style={styles.container}>
    <View style={styles.ring}>
      <View style={[styles.inner, { borderColor: colors.dark.accent }]}>
        <Text style={styles.value}>{score}%</Text>
        <Text style={styles.label}>Health</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ring: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 8,
    borderColor: 'rgba(46,229,213,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: colors.dark.text,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  label: {
    color: colors.dark.textSecondary,
    fontSize: typography.small,
    marginTop: 6,
  },
});

export default FinancialHealthRing;
