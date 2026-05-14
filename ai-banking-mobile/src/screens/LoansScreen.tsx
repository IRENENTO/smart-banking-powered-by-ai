import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import api from '../services/api';

export default function LoansScreen() {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [purpose, setPurpose] = useState('');

  const applyForLoan = async () => {
    try {
      // In a real app with token:
      // await api.post('/loans/apply', { amount: Number(amount), duration: Number(duration), purpose });
      Alert.alert('Success', 'Loan application submitted successfully for review.');
      setAmount('');
      setDuration('');
      setPurpose('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.msg || 'Could not apply for loan');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Apply for a Loan</Text>
      
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Loan Amount"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Duration (months)"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />
        <TextInput
          style={styles.input}
          placeholder="Purpose"
          placeholderTextColor="#94A3B8"
          value={purpose}
          onChangeText={setPurpose}
        />

        <Pressable style={styles.btn} onPress={applyForLoan}>
          <Text style={styles.btnText}>Submit Application</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Your Loans</Text>
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Personal Loan - $5000</Text>
        <Text style={styles.statusText}>Status: <Text style={{ color: '#F59E0B' }}>Pending Review</Text></Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  btn: {
    backgroundColor: '#38BDF8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  statusTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
