import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import api, { setAuthToken } from '../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.token) {
        setAuthToken(response.data.token);
        navigation.replace('MainTabs');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Smart Banking</Text>
      <Text style={styles.subtitle}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#94A3B8"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#94A3B8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Login</Text>
      </Pressable>

      <Pressable style={styles.linkBtn} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
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
    color: '#F8FAFC',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
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
  linkBtn: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#38BDF8',
    fontSize: 14,
  },
});
