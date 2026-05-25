import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { NeonButton } from '../../components/ui/NeonButton';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOtp(email, otpString);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const { authApi } = require('../../services/api/client');
    try {
      await authApi.resendOtp({ email });
    } catch {}
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <LinearGradient
        colors={['#0A0A0F', '#13131A', '#0A0A0F']}
        className="flex-1 justify-center px-6"
      >
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
            <Text className="text-2xl">📧</Text>
          </View>
          <Text className="text-white text-2xl font-bold">Verify Email</Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Enter the OTP sent to {email}
          </Text>
        </View>

        <GlassCard className="mb-6">
          {error ? (
            <View className="bg-accent/20 border border-accent/30 rounded-xl px-4 py-3 mb-4">
              <Text className="text-accent text-sm">{error}</Text>
            </View>
          ) : null}

          <View className="flex-row justify-between mb-6 px-2">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                className="w-12 h-14 bg-surface-light border border-glass-border rounded-xl text-white text-center text-xl font-bold"
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
              />
            ))}
          </View>

          <NeonButton
            title="Verify OTP"
            onPress={handleVerify}
            loading={loading}
            className="w-full"
          />

          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-500 text-sm">Didn't receive code? </Text>
            <NeonButton
              title="Resend"
              variant="ghost"
              size="sm"
              onPress={handleResend}
            />
          </View>
        </GlassCard>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
