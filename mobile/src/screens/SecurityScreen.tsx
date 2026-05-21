import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import ScreenLayout from '../layouts/ScreenLayout';
import GlassCard from '../components/GlassCard';
import { colors, typography } from '../theme';

const SecurityScreen: React.FC = () => {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <ScreenLayout>
      <Text style={styles.title}>Security</Text>
      <Text style={styles.subtitle}>Control how you access and protect your banking profile.</Text>
      <GlassCard style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.itemLabel}>Biometric login</Text>
            <Text style={styles.itemValue}>Use fingerprint or face unlock for quick access.</Text>
          </View>
          <Switch value={biometricEnabled} onValueChange={setBiometricEnabled} trackColor={{ false: '#525f7f', true: colors.dark.accent }} thumbColor={biometricEnabled ? '#fff' : '#ccc'} />
        </View>
      </GlassCard>
      <GlassCard style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.itemLabel}>Security notifications</Text>
            <Text style={styles.itemValue}>Receive alerts when suspicious activity is detected.</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: '#525f7f', true: colors.dark.accent }} thumbColor={notificationsEnabled ? '#fff' : '#ccc'} />
        </View>
      </GlassCard>
      <GlassCard style={styles.noteCard}>
        <Text style={styles.noteLabel}>Tip</Text>
        <Text style={styles.noteText}>Keep your password and device lock strong to maximize protection.</Text>
      </GlassCard>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.dark.text,
    fontSize: typography.h1,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.dark.textSecondary,
    fontSize: typography.body,
    marginBottom: 22,
  },
  card: {
    marginBottom: 16,
    padding: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    color: colors.dark.text,
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemValue: {
    color: colors.dark.textSecondary,
    fontSize: typography.small,
    maxWidth: '80%',
  },
  noteCard: {
    marginTop: 14,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  noteLabel: {
    color: colors.dark.accent,
    fontSize: typography.small,
    fontWeight: '700',
    marginBottom: 6,
  },
  noteText: {
    color: colors.dark.textSecondary,
    fontSize: typography.body,
  },
});

export default SecurityScreen;
