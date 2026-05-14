import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function SetSecurityScreen({ navigation }: Props) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetPin = async () => {
    if (!pin || pin.length < 4) {
      Alert.alert('Invalid PIN', 'PIN must be at least 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Mismatch', 'PINs do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.put('/security/set-pin', { pin });
      navigation.replace('MainTabs');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.msg || 'Failed to set PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Security PIN</Text>
      <Text style={styles.subtitle}>Create a 4-6 digit PIN for secure transactions</Text>

      <Text style={styles.label}>PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="••••"
        placeholderTextColor="#94A3B8"
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
      />

      <Text style={styles.label}>Confirm PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="••••"
        placeholderTextColor="#94A3B8"
        value={confirmPin}
        onChangeText={setConfirmPin}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
      />

      <Pressable
        style={[styles.btn, isLoading && { opacity: 0.6 }]}
        onPress={handleSetPin}
        disabled={isLoading}
      >
        <Text style={styles.btnText}>{isLoading ? 'Setting PIN...' : 'Complete Setup'}</Text>
      </Pressable>

      <Pressable onPress={() => navigation.replace('MainTabs')}>
        <Text style={styles.skipText}>Set PIN Later</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#38BDF8',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 18,
  },
  btn: {
    backgroundColor: '#38BDF8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipText: {
    color: '#38BDF8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '600',
  },
});
