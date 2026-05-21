import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import ScreenLayout from '../layouts/ScreenLayout';
import SavingsProgressCard from '../components/SavingsProgressCard';
import { aiService } from '../services/aiService';
import { SavingsGoal } from '../types';
import { colors, typography } from '../theme';

const SavingsScreen: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  useEffect(() => {
    const loadSavings = async () => {
      try {
        const response = await aiService.fetchSavingsGoals();
        setGoals(response.goals || []);
      } catch (error) {
        console.warn('Savings load error', error);
      }
    };
    loadSavings();
  }, []);

  return (
    <ScreenLayout>
      <Text style={styles.title}>Savings Goals</Text>
      <Text style={styles.subtitle}>Stay on track with automated savings recommendations and progress tracking.</Text>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SavingsProgressCard goal={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No savings goals yet. Start one now.</Text>}
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

export default SavingsScreen;
