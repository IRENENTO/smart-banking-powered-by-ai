import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import api, { setAuthToken } from '../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function VerifyOTPScreen({ navigation }: Props) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const registrationEmail = useAuthStore((state) => state.user?.email);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email: registrationEmail,
        otp,
      });

      if (response.data?.token) {
        setAuthToken(response.data.token);
        // Move to profile completion
        navigation.replace('CompleteProfile');
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.response?.data?.msg || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {registrationEmail}</Text>

      <TextInput
        style={styles.input}
        placeholder="000000"
        placeholderTextColor="#94A3B8"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
      />

      <Pressable
        style={[styles.btn, isLoading && { opacity: 0.6 }]}
        onPress={handleVerifyOTP}
        disabled={isLoading}
      >
        <Text style={styles.btnText}>{isLoading ? 'Verifying...' : 'Verify'}</Text>
      </Pressable>

      <Pressable onPress={() => Alert.alert('Resend OTP', 'OTP has been resent to your email')}>
        <Text style={styles.linkText}>Didn't receive code? Resend</Text>
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
  input: {
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
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
  linkText: {
    color: '#38BDF8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
});
