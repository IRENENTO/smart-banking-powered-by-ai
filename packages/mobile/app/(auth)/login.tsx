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

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
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
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
              <Text className="text-2xl">🛡️</Text>
            </View>
            <Text className="text-primary text-3xl font-bold">SENTINEL</Text>
            <Text className="text-gray-500 text-sm mt-1">AI Anti-Theft Security</Text>
          </View>

          <GlassCard className="mb-6">
            <Text className="text-white text-xl font-bold mb-6">Welcome Back</Text>

            {error ? (
              <View className="bg-accent/20 border border-accent/30 rounded-xl px-4 py-3 mb-4">
                <Text className="text-accent text-sm">{error}</Text>
              </View>
            ) : null}

            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2 ml-1">Email</Text>
              <TextInput
                className="bg-surface-light border border-glass-border rounded-xl px-4 py-3.5 text-white"
                placeholder="your@email.com"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-400 text-sm mb-2 ml-1">Password</Text>
              <TextInput
                className="bg-surface-light border border-glass-border rounded-xl px-4 py-3.5 text-white"
                placeholder="Enter your password"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <NeonButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              className="w-full"
            />

            <TouchableOpacity className="mt-4 items-center">
              <Text className="text-gray-500 text-sm">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </GlassCard>

          <View className="flex-row justify-center">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-primary font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
