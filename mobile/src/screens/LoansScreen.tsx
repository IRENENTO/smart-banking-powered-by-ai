import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import ScreenLayout from '../layouts/ScreenLayout';
import GlassCard from '../components/GlassCard';
import { loanService } from '../services/loanService';
import { colors, typography } from '../theme';
import { LoanApplication } from '../types';

const LoansScreen: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [payload, setPayload] = useState<LoanApplication>({ amount: 100000, duration: 12, purpose: 'Business expansion', monthlyIncome: 250000, existingDebt: 50000 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLoans = async () => {
      try {
        const response = await loanService.getLoans();
        setApplications(response.loans || []);
      } catch (error) {
        console.warn('Load loans error', error);
      }
    };
    loadLoans();
  }, []);

  const applyLoan = async () => {
    setLoading(true);
    try {
      await loanService.apply(payload);
      Alert.alert('Loan requested', 'Your loan application has been submitted.');
    } catch (error: any) {
      Alert.alert('Request failed', error?.response?.data?.msg || 'Unable to submit loan request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <Text style={styles.title}>Loans</Text>
      <Text style={styles.subtitle}>AI approval prediction and risk scoring for your next credit request.</Text>
      <GlassCard>
        <Text style={styles.cardTitle}>Apply for a new loan</Text>
        <View style={styles.row}>
          <TextInput style={styles.smallInput} keyboardType="numeric" value={payload.amount.toString()} onChangeText={(value) => setPayload((current) => ({ ...current, amount: Number(value) }))} placeholder="Amount" placeholderTextColor="rgba(248,250,252,0.5)" />
          <TextInput style={styles.smallInput} keyboardType="numeric" value={payload.duration.toString()} onChangeText={(value) => setPayload((current) => ({ ...current, duration: Number(value) }))} placeholder="Months" placeholderTextColor="rgba(248,250,252,0.5)" />
        </View>
        <TextInput style={styles.input} value={payload.purpose} onChangeText={(value) => setPayload((current) => ({ ...current, purpose: value }))} placeholder="Purpose" placeholderTextColor="rgba(248,250,252,0.5)" />
        <View style={styles.row}>
          <TextInput style={styles.smallInput} keyboardType="numeric" value={payload.monthlyIncome.toString()} onChangeText={(value) => setPayload((current) => ({ ...current, monthlyIncome: Number(value) }))} placeholder="Income" placeholderTextColor="rgba(248,250,252,0.5)" />
          <TextInput style={styles.smallInput} keyboardType="numeric" value={payload.existingDebt.toString()} onChangeText={(value) => setPayload((current) => ({ ...current, existingDebt: Number(value) }))} placeholder="Debt" placeholderTextColor="rgba(248,250,252,0.5)" />
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={applyLoan} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? 'Submitting...' : 'Apply Now'}</Text>
        </TouchableOpacity>
      </GlassCard>

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Your applications</Text>
      {applications.length ? (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <GlassCard style={styles.loanCard}>
              <Text style={styles.cardTitle}>{item.purpose || 'Loan request'}</Text>
              <Text style={styles.cardLabel}>Status: {item.status}</Text>
              <Text style={styles.cardLabel}>Amount: {item.amount?.toLocaleString()} RWF</Text>
            </GlassCard>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      ) : (
        <Text style={styles.emptyText}>No loan applications found.</Text>
      )}
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
    marginBottom: 18,
  },
  cardTitle: {
    color: colors.dark.text,
    fontSize: typography.h3,
    fontWeight: '800',
    marginBottom: 12,
  },
  cardLabel: {
    color: colors.dark.textSecondary,
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.dark.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 18,
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
    marginBottom: 14,
  },
  loanCard: {
    paddingVertical: 18,
  },
  emptyText: {
    color: colors.dark.textSecondary,
    marginTop: 20,
  },
});

export default LoansScreen;
