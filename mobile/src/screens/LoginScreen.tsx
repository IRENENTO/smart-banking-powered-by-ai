import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import ScreenLayout from '../layouts/ScreenLayout';
import { colors, typography } from '../theme';
import { STORAGE_KEYS } from '../constants';
import { secureStorage } from '../utils/storage';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setUser, setToken, setAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Validation', 'Please enter your email and password.');
    }
    setLoading(true);
    try {
      const { token, user } = await authService.login({ email, password, rememberMe: remember });
      setToken(token);
      setUser(user);
      setAuthenticated(true);
      if (remember) {
        await secureStorage.setItem(STORAGE_KEYS.TOKEN, token);
        await secureStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
    } catch (error: any) {
      Alert.alert('Login failed', error?.response?.data?.msg || 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.formContainer}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Secure, seamless AI-powered banking.</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="rgba(248,250,252,0.5)" style={styles.input} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="rgba(248,250,252,0.5)" style={styles.input} secureTextEntry />
        </View>

        <View style={styles.row}> 
          <TouchableOpacity style={styles.rememberButton} onPress={() => setRemember((value) => !value)}>
            <View style={[styles.checkbox, remember && styles.checkboxActive]} />
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Biometric', 'Biometric login is not configured yet')}>
            <Text style={styles.linkText}>Biometric login</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? 'Signing in...' : 'Login'}</Text>
        </TouchableOpacity>

        <View style={styles.socialRow}>
          {['google', 'facebook', 'twitter'].map((provider) => (
            <TouchableOpacity key={provider} style={styles.socialButton} onPress={() => Alert.alert(provider, 'Social login not available yet')}>
              <Text style={styles.socialText}>{provider.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New here?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
            <Text style={styles.linkText}>Create account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.dark.text,
    fontSize: typography.h1,
    fontWeight: '900',
    marginBottom: 10,
  },
  subtitle: {
    color: colors.dark.textSecondary,
    fontSize: typography.body,
    marginBottom: 30,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 18,
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
    borderColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: colors.dark.accent,
    borderColor: colors.dark.accent,
  },
  rememberText: {
    color: colors.dark.textSecondary,
  },
  linkText: {
    color: colors.dark.accent,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: colors.dark.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  primaryText: {
    color: '#051014',
    fontWeight: '800',
    fontSize: typography.body,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 22,
  },
  socialButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  socialText: {
    color: colors.dark.text,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    color: colors.dark.textSecondary,
  },
});

export default LoginScreen;
