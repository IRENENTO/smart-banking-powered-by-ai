import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { NeonButton } from '../../components/ui/NeonButton';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Name, email, and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({ email, password, name, phone: phone || undefined });
      router.push(`/(auth)/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <LinearGradient
        colors={['#0A0A0F', '#13131A', '#0A0A0F']}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-1 justify-center px-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-8">
            <Text className="text-primary text-3xl font-bold">Create Account</Text>
            <Text className="text-gray-500 text-sm mt-1">Secure your device today</Text>
          </View>

          <GlassCard className="mb-6">
            {error ? (
              <View className="bg-accent/20 border border-accent/30 rounded-xl px-4 py-3 mb-4">
                <Text className="text-accent text-sm">{error}</Text>
              </View>
            ) : null}

            <View className="mb-3">
              <Text className="text-gray-400 text-sm mb-1.5 ml-1">Full Name</Text>
              <TextInput
                className="bg-surface-light border border-glass-border rounded-xl px-4 py-3.5 text-white"
                placeholder="John Doe"
                placeholderTextColor="#6B7280"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View className="mb-3">
              <Text className="text-gray-400 text-sm mb-1.5 ml-1">Email</Text>
              <TextInput
                className="bg-surface-light border border-glass-border rounded-xl px-4 py-3.5 text-white"
                placeholder="your@email.com"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-3">
              <Text className="text-gray-400 text-sm mb-1.5 ml-1">Phone (optional)</Text>
              <TextInput
                className="bg-surface-light border border-glass-border rounded-xl px-4 py-3.5 text-white"
                placeholder="+250 7XX XXX XXX"
                placeholderTextColor="#6B7280"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-400 text-sm mb-1.5 ml-1">Password</Text>
              <TextInput
                className="bg-surface-light border border-glass-border rounded-xl px-4 py-3.5 text-white"
                placeholder="Create a strong password"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <NeonButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              className="w-full"
            />
          </GlassCard>

          <View className="flex-row justify-center mb-10">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
