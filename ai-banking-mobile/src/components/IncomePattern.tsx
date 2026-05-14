import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IncomePattern() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Income Pattern</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Monthly Income</Text>
        <Text style={styles.value}>$5,000</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Expenses</Text>
        <Text style={styles.value}>$2,500</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
  },
  title: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#94A3B8',
    fontSize: 14,
  },
  value: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
});
