import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../layouts/ScreenLayout';
import { authService } from '../services/authService';
import { SECTORS } from '../constants';
import { colors, typography } from '../theme';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      return Alert.alert('Validation', 'All fields are required.');
    }
    setLoading(true);
    try {
      await authService.register({ name, email, password, phone, sector });
      Alert.alert('Success', 'Registration successful. Please verify your email.');
      navigation.navigate('VerifyOTP' as never);
    } catch (error: any) {
      Alert.alert('Registration failed', error?.response?.data?.msg || 'Unable to register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.formContainer}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Sign up for smart African fintech with AI-powered insights.</Text>

        {[
          { label: 'Full Name', value: name, setter: setName, placeholder: 'Jane Doe' },
          { label: 'Email', value: email, setter: setEmail, placeholder: 'you@example.com', keyboardType: 'email-address' },
          { label: 'Phone', value: phone, setter: setPhone, placeholder: '078 123 4567', keyboardType: 'phone-pad' },
          { label: 'Password', value: password, setter: setPassword, placeholder: '••••••••', secureTextEntry: true },
        ].map((field) => (
          <View key={field.label} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              value={field.value}
              onChangeText={field.setter}
              placeholder={field.placeholder}
              placeholderTextColor="rgba(248,250,252,0.5)"
              style={styles.input}
              keyboardType={field.keyboardType as any}
              secureTextEntry={field.secureTextEntry}
              autoCapitalize="none"
            />
          </View>
        ))}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sector</Text>
          <View style={styles.pickerContainer}>
            {SECTORS.slice(0, 5).map((item) => (
              <TouchableOpacity key={item} style={[styles.sectorOption, sector === item && styles.sectorActive]} onPress={() => setSector(item)}>
                <Text style={[styles.sectorText, sector === item && styles.sectorTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? 'Creating account...' : 'Register'}</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.linkText}>Sign in</Text>
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
    marginBottom: 28,
    lineHeight: 22,
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
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sectorOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectorActive: {
    backgroundColor: colors.dark.accent,
    borderColor: colors.dark.accent,
  },
  sectorText: {
    color: colors.dark.textSecondary,
  },
  sectorTextActive: {
    color: '#051014',
  },
  primaryButton: {
    backgroundColor: colors.dark.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryText: {
    color: '#051014',
    fontWeight: '800',
    fontSize: typography.body,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  footerText: {
    color: colors.dark.textSecondary,
  },
  linkText: {
    color: colors.dark.accent,
    fontWeight: '700',
  },
});

export default RegisterScreen;
