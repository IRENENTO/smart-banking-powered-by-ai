import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ScreenLayout from '../layouts/ScreenLayout';
import { paymentService } from '../services/paymentService';
import { colors, typography } from '../theme';

const PaymentsScreen: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const numericAmount = Number(amount);
    if (!recipient || !numericAmount) {
      return Alert.alert('Validation', 'Enter recipient and amount.');
    }
    setLoading(true);
    try {
      await paymentService.sendMoney(recipient, numericAmount, description);
      Alert.alert('Success', 'Payment submitted successfully.');
      setRecipient('');
      setAmount('');
      setDescription('');
    } catch (error: any) {
      Alert.alert('Payment failed', error?.response?.data?.msg || 'Unable to process payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <Text style={styles.title}>Payments</Text>
      <Text style={styles.subtitle}>Send money, top-up airtime, or pay bills instantly.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Recipient account</Text>
        <TextInput value={recipient} onChangeText={setRecipient} style={styles.input} placeholder="Account number or email" placeholderTextColor="rgba(248,250,252,0.5)" />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amount</Text>
        <TextInput value={amount} onChangeText={setAmount} style={styles.input} placeholder="0.00" placeholderTextColor="rgba(248,250,252,0.5)" keyboardType="numeric" />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput value={description} onChangeText={setDescription} style={styles.input} placeholder="Invoice, airtime, etc." placeholderTextColor="rgba(248,250,252,0.5)" />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSend} disabled={loading}>
        <Text style={styles.primaryText}>{loading ? 'Processing...' : 'Send Payment'}</Text>
      </TouchableOpacity>
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.dark.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: colors.dark.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  primaryButton: {
    marginTop: 16,
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
});

export default PaymentsScreen;
