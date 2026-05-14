import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function InvestmentIdeas() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Investment Ideas</Text>
      <Text style={styles.text}>Consider investing in high-yield savings.</Text>
      <Text style={styles.text}>Explore local green energy projects.</Text>
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
