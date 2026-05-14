import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import api from '../services/api';
import QuickActions from '../components/QuickActions';
import MarketInsights from '../components/MarketInsights';
import IncomePattern from '../components/IncomePattern';
import RiskAlerts from '../components/RiskAlerts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function HomeScreen({ navigation }: Props) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // In a real app, fetch balance here
    // api.get('/account/balance').then(...)
    setBalance(15420.50);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning, User</Text>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balance}>${balance.toFixed(2)}</Text>
      </View>

      <QuickActions />

      <Pressable style={styles.aiBtn} onPress={() => navigation.navigate('AIInsights')}>
        <Text style={styles.aiBtnText}>✨ View AI Insights</Text>
      </Pressable>

      <RiskAlerts />
      <IncomePattern />
      <MarketInsights />

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  header: {
    marginVertical: 16,
  },
  greeting: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceLabel: {
    color: '#F8FAFC',
    fontSize: 14,
  },
  balance: {
    color: '#38BDF8',
    fontSize: 36,
    fontWeight: 'bold',
  },
  aiBtn: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
    alignItems: 'center',
    marginVertical: 16,
  },
  aiBtnText: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 16,
  },
  spacer: {
    height: 40,
  },
});
