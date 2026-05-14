import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MarketInsights() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Market Insights</Text>
      <Text style={styles.text}>Tech stocks are up 2% today.</Text>
      <Text style={styles.text}>Interest rates remain stable.</Text>
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
    marginBottom: 8,
  },
  text: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 4,
  },
});
