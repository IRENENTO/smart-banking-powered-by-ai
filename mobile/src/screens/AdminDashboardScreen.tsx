import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenLayout from '../layouts/ScreenLayout';
import GlassCard from '../components/GlassCard';
import { adminService } from '../services/adminService';
import { colors, typography } from '../theme';

const AdminDashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<Record<string, number | string> | null>(null);

  useEffect(() => {
    const loadAdminStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (error) {
        console.warn('Admin stats fetch error', error);
      }
    };
    loadAdminStats();
  }, []);

  return (
    <ScreenLayout>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Monitor system health, user growth, and transaction volume in real time.</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {stats ? (
          Object.entries(stats).map(([key, value]) => (
            <GlassCard key={key} style={styles.card}>
              <Text style={styles.cardLabel}>{key.replace(/([A-Z])/g, ' $1')}</Text>
              <Text style={styles.cardValue}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
            </GlassCard>
          ))
        ) : (
          <Text style={styles.emptyText}>Loading admin metrics…</Text>
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
  list: {
    paddingBottom: 80,
  },
  card: {
    padding: 18,
    marginBottom: 14,
  },
  cardLabel: {
    color: colors.dark.textSecondary,
    fontSize: typography.small,
    marginBottom: 8,
  },
  cardValue: {
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

export default AdminDashboardScreen;
