import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import ScreenLayout from '../layouts/ScreenLayout';
import FraudAlertCard from '../components/FraudAlertCard';
import { fraudService } from '../services/fraudService';
import { AIInsight } from '../types';
import { colors, typography } from '../theme';

const FraudAlertsScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<AIInsight[]>([]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await fraudService.fetchFraudAlerts();
        setAlerts(response.alerts || []);
      } catch (error) {
        console.warn('Fraud alerts load error', error);
      }
    };
    loadAlerts();
  }, []);

  return (
    <ScreenLayout>
      <Text style={styles.title}>Fraud Alerts</Text>
      <Text style={styles.subtitle}>Protect your account with real-time suspicious activity detection.</Text>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FraudAlertCard alert={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No fraud alerts at the moment.</Text>}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.dark.text,
    fontSize: typography.h1,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.dark.textSecondary,
    fontSize: typography.body,
    marginBottom: 20,
  },
  emptyText: {
    color: colors.dark.textSecondary,
    marginTop: 40,
    textAlign: 'center',
  },
});

export default FraudAlertsScreen;
