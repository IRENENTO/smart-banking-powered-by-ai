import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const actions = [
  { id: '1', title: 'Transfer', icon: '💸' },
  { id: '2', title: 'Pay Bills', icon: '🧾' },
  { id: '3', title: 'Deposit', icon: '🏦' },
  { id: '4', title: 'More', icon: 'grid' },
];

export default function QuickActions() {
  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <Pressable key={action.id} style={styles.actionBtn}>
          <Text style={styles.icon}>{action.icon}</Text>
          <Text style={styles.text}>{action.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  actionBtn: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '22%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  text: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
});
