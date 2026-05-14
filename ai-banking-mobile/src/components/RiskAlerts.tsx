import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RiskAlerts() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Risk Alerts</Text>
      <Text style={styles.alert}>⚠️ Market volatility expected next week.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  alert: {
    color: '#EF4444',
    fontSize: 14,
  },
});
