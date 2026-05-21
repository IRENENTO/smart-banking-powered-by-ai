import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../layouts/ScreenLayout';
import { authService } from '../services/authService';
import { colors, typography } from '../theme';
import { APP_CONFIG } from '../constants';

const VerifyOTPScreen: React.FC = () => {
  const navigation = useNavigation();
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(APP_CONFIG.OTP_RESEND_TIMER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer <= 0) return undefined;
    const interval = setInterval(() => setTimer((current) => current - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (code.length !== APP_CONFIG.OTP_LENGTH) {
      return Alert.alert('Invalid code', 'Please enter the 6-digit OTP.');
    }
    setLoading(true);
    try {
      await authService.verifyOTP('user@example.com', code);
      Alert.alert('Verified', 'Your account is now verified.');
      navigation.navigate('Login' as never);
    } catch (error: any) {
      Alert.alert('Verification failed', error?.response?.data?.msg || 'Unable to verify code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to your email.</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          placeholder="000000"
          maxLength={APP_CONFIG.OTP_LENGTH}
          placeholderTextColor="rgba(248,250,252,0.5)"
          style={styles.input}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleVerify} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
        </TouchableOpacity>
        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          <TouchableOpacity disabled={timer > 0} onPress={() => setTimer(APP_CONFIG.OTP_RESEND_TIMER)}>
            <Text style={[styles.resendLink, timer > 0 && styles.disabledLink]}>{timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.dark.text,
    fontSize: typography.h1,
    fontWeight: '900',
    marginBottom: 12,
  },
  subtitle: {
    color: colors.dark.textSecondary,
    fontSize: typography.body,
    marginBottom: 26,
    lineHeight: 22,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    color: colors.dark.text,
    fontSize: typography.body,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    letterSpacing: 12,
    textAlign: 'center',
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
  resendRow: {
    marginTop: 22,
    alignItems: 'center',
  },
  resendText: {
    color: colors.dark.textSecondary,
    marginBottom: 8,
  },
  resendLink: {
    color: colors.dark.accent,
    fontWeight: '700',
  },
  disabledLink: {
    color: 'rgba(46,229,213,0.5)',
  },
});

export default VerifyOTPScreen;
