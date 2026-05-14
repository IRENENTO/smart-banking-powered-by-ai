import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function CompleteProfileScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCompleteProfile = async () => {
    if (!dob || !address || !city || !state) {
      Alert.alert('Incomplete', 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      await api.put('/profile/complete', {
        dateOfBirth: dob,
        address,
        city,
        state,
      });
      // Move to PIN setup
      navigation.replace('SetSecurity');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.msg || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Profile',
      'You can complete your profile later, but it\'s required to request loans.',
      [
        { text: 'Go Back', onPress: () => {} },
        {
          text: 'Skip for Now',
          onPress: () => navigation.replace('MainTabs'),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>This helps us verify your identity</Text>

      <Text style={styles.label}>Date of Birth (DD/MM/YYYY)</Text>
      <TextInput
        style={styles.input}
        placeholder="01/01/1990"
        placeholderTextColor="#94A3B8"
        value={dob}
        onChangeText={setDob}
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Street address"
        placeholderTextColor="#94A3B8"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        placeholder="City"
        placeholderTextColor="#94A3B8"
        value={city}
        onChangeText={setCity}
      />

      <Text style={styles.label}>State/Province</Text>
      <TextInput
        style={styles.input}
        placeholder="State"
        placeholderTextColor="#94A3B8"
        value={state}
        onChangeText={setState}
      />

      <Pressable
        style={[styles.btn, isLoading && { opacity: 0.6 }]}
        onPress={handleCompleteProfile}
        disabled={isLoading}
      >
        <Text style={styles.btnText}>{isLoading ? 'Saving...' : 'Continue'}</Text>
      </Pressable>

      <Pressable style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip for Now</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 14,
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
  skipBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 8,
  },
  skipText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
  },
});
