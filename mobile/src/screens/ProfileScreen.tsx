import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../layouts/ScreenLayout';
import GlassCard from '../components/GlassCard';
import { useAuthStore } from '../store/authStore';
import { colors, typography } from '../theme';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  return (
    <ScreenLayout>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage your personal details and account security.</Text>
      <GlassCard style={styles.card}>
        <Text style={styles.itemLabel}>Name</Text>
        <Text style={styles.itemValue}>{user?.name || 'N/A'}</Text>
      </GlassCard>
      <GlassCard style={styles.card}>
        <Text style={styles.itemLabel}>Email</Text>
        <Text style={styles.itemValue}>{user?.email || 'N/A'}</Text>
      </GlassCard>
      <GlassCard style={styles.card}>
        <Text style={styles.itemLabel}>Account Number</Text>
        <Text style={styles.itemValue}>{user?.account_number || 'Not available'}</Text>
      </GlassCard>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Security' as never)}>
          <Text style={styles.actionText}>Security</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Notifications' as never)}>
          <Text style={styles.actionText}>Notifications</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Analytics' as never)}>
          <Text style={styles.actionText}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Savings' as never)}>
          <Text style={styles.actionText}>Savings</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
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
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  itemLabel: {
    color: colors.dark.textSecondary,
    fontSize: typography.small,
    marginBottom: 6,
  },
  itemValue: {
    color: colors.dark.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: colors.dark.accent,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: typography.body,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionText: {
    color: colors.dark.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
});

export default ProfileScreen;
