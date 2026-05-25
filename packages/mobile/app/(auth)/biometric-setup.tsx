import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { NeonButton } from '../../components/ui/NeonButton';
import { GlassCard } from '../../components/ui/GlassCard';
import { storage, KEYS } from '../../utils/storage';

export default function BiometricSetupScreen() {
  const [loading, setLoading] = useState(false);

  const handleEnableBiometric = async () => {
    setLoading(true);
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        router.replace('/(tabs)/dashboard');
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        router.replace('/(tabs)/dashboard');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Set up biometric authentication',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        await storage.set(KEYS.BIOMETRIC_ENABLED, true);
      }

      router.replace('/(tabs)/dashboard');
    } catch {
      router.replace('/(tabs)/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0A0A0F', '#13131A', '#0A0A0F']}
      className="flex-1 justify-center px-6"
    >
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-secondary/20 items-center justify-center mb-4 shadow-lg shadow-secondary/20">
          <Text className="text-3xl">🔒</Text>
        </View>
        <Text className="text-white text-2xl font-bold text-center">
          Enable Biometric Security
        </Text>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          Add an extra layer of protection with fingerprint or face recognition
        </Text>
      </View>

      <GlassCard className="mb-6">
        <View className="mb-6">
          <Text className="text-white font-bold mb-3">Benefits:</Text>
          {['Instant secure access', 'Protect sensitive data', 'Quick app unlock', 'Seamless authentication'].map((benefit, i) => (
            <View key={i} className="flex-row items-center mb-2">
              <Text className="text-primary mr-2">✓</Text>
              <Text className="text-gray-400 text-sm">{benefit}</Text>
            </View>
          ))}
        </View>

        <NeonButton
          title="Enable Biometric"
          variant="secondary"
          onPress={handleEnableBiometric}
          loading={loading}
          className="w-full mb-3"
        />

        <NeonButton
          title="Skip for now"
          variant="ghost"
          onPress={() => router.replace('/(tabs)/dashboard')}
          className="w-full"
        />
      </GlassCard>
    </LinearGradient>
  );
}
