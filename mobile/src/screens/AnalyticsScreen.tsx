import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenLayout from '../layouts/ScreenLayout';
import { adminService } from '../services/adminService';
import { colors, typography } from '../theme';

const AnalyticsScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await adminService.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.warn('Analytics load error', error);
      }
    };
    loadAnalytics();
  }, []);

  return (
    <ScreenLayout>
      <Text style={styles.title}>Financial Analytics</Text>
      <Text style={styles.subtitle}>Insights and trending data across your account and investments.</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {analytics ? (
          Object.entries(analytics).map(([key, value]) => (
            <View key={key} style={styles.tile}>
              <Text style={styles.metricLabel}>{key.replace(/([A-Z])/g, ' $1')}</Text>
              <Text style={styles.metricValue}>{typeof value === 'number' ? value.toLocaleString() : String(value)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Loading analytics data…</Text>
        )}
      </ScrollView>
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
  content: {
    paddingBottom: 80,
  },
  tile: {
    backgroundColor: colors.dark.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: colors.dark.shadow,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
  },
  metricLabel: {
    color: colors.dark.textSecondary,
    fontSize: typography.small,
    marginBottom: 6,
  },
  metricValue: {
    color: colors.dark.text,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.dark.textSecondary,
    marginTop: 40,
    textAlign: 'center',
  },
});

export default AnalyticsScreen;
