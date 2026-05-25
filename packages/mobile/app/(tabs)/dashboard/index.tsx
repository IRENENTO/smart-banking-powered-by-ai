import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GlassCard, GlassCardHeader } from '../../../components/ui/GlassCard';
import { NeonButton } from '../../../components/ui/NeonButton';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { SecurityGauge } from '../../../components/ui/SecurityGauge';
import { useAuth } from '../../../hooks/useAuth';
import { deviceApi } from '../../../services/api/client';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [securityScore] = useState(85);

  const loadDevices = async () => {
    try {
      const res = await deviceApi.getAll();
      setDevices(res.data.data.devices || []);
    } catch {}
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDevices();
    setRefreshing(false);
  };

  return (
    <LinearGradient colors={['#0A0A0F', '#13131A']} className="flex-1">
      <ScrollView
        className="flex-1 px-4 pt-14"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F5FF" />}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-400 text-sm">Welcome back,</Text>
            <Text className="text-white text-2xl font-bold">{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={logout} className="bg-accent/20 px-4 py-2 rounded-full">
            <Text className="text-accent text-sm font-medium">Logout</Text>
          </TouchableOpacity>
        </View>

        <GlassCard className="mb-4">
          <View className="items-center py-2">
            <SecurityGauge score={securityScore} size={130} />
            <Text className="text-white text-lg font-bold mt-3">Protected</Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              {devices.length} device{devices.length !== 1 ? 's' : ''} monitored
            </Text>
          </View>
        </GlassCard>

        <View className="flex-row mb-4">
          <GlassCard className="flex-1 mr-2">
            <Text className="text-primary text-2xl font-bold">{devices.length}</Text>
            <Text className="text-gray-400 text-xs">Devices</Text>
          </GlassCard>
          <GlassCard className="flex-1 mx-2">
            <Text className="text-warning text-2xl font-bold">0</Text>
            <Text className="text-gray-400 text-xs">Active Alerts</Text>
          </GlassCard>
          <GlassCard className="flex-1 ml-2">
            <Text className="text-success text-2xl font-bold">
              {devices.filter((d: any) => d.isOnline).length}
            </Text>
            <Text className="text-gray-400 text-xs">Online</Text>
          </GlassCard>
        </View>

        <GlassCardHeader
          title="Quick Actions"
          subtitle="Manage your security"
        />
        <View className="flex-row mb-4">
          <NeonButton
            title="Lock All"
            variant="danger"
            size="sm"
            className="flex-1 mr-2"
            onPress={() => {}}
          />
          <NeonButton
            title="Track Now"
            variant="primary"
            size="sm"
            className="flex-1 mx-2"
            onPress={() => router.push('/(tabs)/tracking')}
          />
          <NeonButton
            title="SOS"
            variant="secondary"
            size="sm"
            className="flex-1 ml-2"
            onPress={() => {}}
          />
        </View>

        <GlassCardHeader
          title="Your Devices"
          subtitle="Monitored devices"
          rightElement={
            <NeonButton title="+ Add" variant="ghost" size="sm" onPress={() => {}} />
          }
        />
        {devices.length === 0 ? (
          <GlassCard className="mb-6">
            <View className="items-center py-6">
              <Text className="text-4xl mb-3">📱</Text>
              <Text className="text-gray-400 text-center">
                No devices registered yet.{'\n'}Install Sentinel AI on your phone to begin.
              </Text>
            </View>
          </GlassCard>
        ) : (
          devices.map((device: any, i: number) => (
            <GlassCard key={device.id} className="mb-3" glowColor="rgba(0,245,255,0.1)">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                  <Text className="text-lg">📱</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold">{device.deviceName || 'My Device'}</Text>
                  <Text className="text-gray-500 text-xs">{device.deviceModel}</Text>
                </View>
                <StatusBadge
                  label={device.isOnline ? 'Online' : 'Offline'}
                  variant={device.isOnline ? 'success' : 'neutral'}
                  size="sm"
                  pulse={device.isOnline}
                />
              </View>
            </GlassCard>
          ))
        )}

        <View className="h-8" />
      </ScrollView>
    </LinearGradient>
  );
}
