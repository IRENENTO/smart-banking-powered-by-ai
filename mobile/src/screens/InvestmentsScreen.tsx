import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import ScreenLayout from '../layouts/ScreenLayout';
import { investmentService } from '../services/investmentService';
import GlassCard from '../components/GlassCard';
import { colors, typography } from '../theme';

const InvestmentsScreen: React.FC = () => {
  const [investments, setInvestments] = useState<any[]>([]);
  const [amount, setAmount] = useState('50000');
  const [type, setType] = useState('stocks');
  const [duration, setDuration] = useState('12');
  const [risk, setRisk] = useState('medium');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await investmentService.getInvestments();
        setInvestments(response.investments || []);
      } catch (error) {
        console.warn('Load investments error', error);
      }
    };
    load();
  }, []);

  const handleCreate = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount) {
      return Alert.alert('Validation', 'Enter a valid amount.');
    }
    setLoading(true);
    try {
      await investmentService.createInvestment({ type, amount: numericAmount, duration: Number(duration), risk_level: risk as 'low' | 'medium' | 'high', expected_return: numericAmount * 1.12 });
      Alert.alert('Saved', 'Investment opportunity has been added.');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.msg || 'Unable to create investment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <Text style={styles.title}>Investments</Text>
      <Text style={styles.subtitle}>Discover AI-led opportunities and growth forecasts for Rwanda markets.</Text>

      <GlassCard>
        <Text style={styles.cardTitle}>Add new investment</Text>
        <View style={styles.row}>
          <TextInput style={styles.smallInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Amount" placeholderTextColor="rgba(248,250,252,0.5)" />
          <TextInput style={styles.smallInput} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="Months" placeholderTextColor="rgba(248,250,252,0.5)" />
        </View>
        <View style={styles.row}>
          <TextInput style={styles.smallInput} value={type} onChangeText={setType} placeholder="Type" placeholderTextColor="rgba(248,250,252,0.5)" />
          <TextInput style={styles.smallInput} value={risk} onChangeText={setRisk} placeholder="Risk" placeholderTextColor="rgba(248,250,252,0.5)" />
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={handleCreate} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? 'Saving...' : 'Invest now'}</Text>
        </TouchableOpacity>
      </GlassCard>

      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Your opportunities</Text>
      <FlatList
        data={investments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <GlassCard style={styles.investmentCard}>
            <Text style={styles.cardTitle}>{item.name || item.type}</Text>
            <Text style={styles.cardLabel}>Amount: {item.amount?.toLocaleString()} RWF</Text>
            <Text style={styles.cardLabel}>Return: {item.expected_return?.toLocaleString()} RWF</Text>
          </GlassCard>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No active investments yet.</Text>}
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
  cardTitle: {
    color: colors.dark.text,
    fontSize: typography.h3,
    fontWeight: '800',
    marginBottom: 14,
  },
  cardLabel: {
    color: colors.dark.textSecondary,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  smallInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.dark.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  primaryButton: {
    backgroundColor: colors.dark.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    color: '#051014',
    fontWeight: '800',
    fontSize: typography.body,
  },
  sectionTitle: {
    color: colors.dark.text,
    fontSize: typography.h3,
    fontWeight: '800',
  },
  investmentCard: {
    paddingVertical: 18,
  },
  emptyText: {
    color: colors.dark.textSecondary,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default InvestmentsScreen;
