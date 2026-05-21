import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import ScreenLayout from '../layouts/ScreenLayout';
import AIInsightCard from '../components/AIInsightCard';
import { analyticsService } from '../services/analyticsService';
import { colors, typography } from '../theme';
import { AIInsight } from '../types';

const AIInsightsScreen: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const data = await analyticsService.fetchSpendingSummary();
        setInsights(data.insights || []);
      } catch (error) {
        console.warn('AI insights load error', error);
      } finally {
        setLoading(false);
      }
    };
    loadInsights();
  }, []);

  return (
    <ScreenLayout>
      <Text style={styles.title}>AI Insights</Text>
      <Text style={styles.subtitle}>Real-time advice for smarter spending and investments.</Text>
      {loading ? (
        <ActivityIndicator color={colors.dark.accent} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={insights}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AIInsightCard insight={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No AI insights available yet.</Text>}
        />
      )}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.dark.text,
    fontSize: typography.h1,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.dark.textSecondary,
    fontSize: typography.body,
    marginBottom: 18,
  },
  list: {
    paddingBottom: 60,
  },
  emptyText: {
    color: colors.dark.textSecondary,
    fontSize: typography.body,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default AIInsightsScreen;
