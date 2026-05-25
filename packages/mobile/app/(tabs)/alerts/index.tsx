import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../../components/ui/GlassCard';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { NeonButton } from '../../../components/ui/NeonButton';

const MOCK_ALERTS = [
  { id: '1', type: 'suspicious_movement', title: 'Suspicious Movement', description: 'Unusual device movement detected at 2:30 AM', severity: 'high', time: '2 min ago' },
  { id: '2', type: 'failed_unlock', title: 'Failed Unlock Attempt', description: '3 failed password attempts detected', severity: 'critical', time: '15 min ago' },
  { id: '3', type: 'network_change', title: 'Network Change', description: 'Device switched to unknown network', severity: 'medium', time: '1 hour ago' },
  { id: '4', type: 'geofence_breach', title: 'Geofence Breach', description: 'Device left safe zone', severity: 'high', time: '2 hours ago' },
  { id: '5', type: 'low_battery', title: 'Low Battery', description: 'Battery level below 20%', severity: 'low', time: '5 hours ago' },
];

const severityConfig = {
  critical: { color: 'bg-accent', text: 'text-accent' },
  high: { color: 'bg-warning', text: 'text-warning' },
  medium: { color: 'bg-primary', text: 'text-primary' },
  low: { color: 'bg-success', text: 'text-success' },
};

export default function AlertsScreen() {
  const [alerts] = useState(MOCK_ALERTS);
  const [filter, setFilter] = useState<string | null>(null);

  const filteredAlerts = filter ? alerts.filter((a) => a.severity === filter) : alerts;

  const renderAlert = ({ item }: { item: typeof MOCK_ALERTS[0] }) => (
    <GlassCard key={item.id} className="mb-3" glowColor={`${severityConfig[item.severity as keyof typeof severityConfig].color}/10`}>
      <View className="flex-row items-start">
        <View className={`w-2 h-full rounded-full ${severityConfig[item.severity as keyof typeof severityConfig].color} mt-1 mr-3`} style={{ width: 4 }} />
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-white font-bold flex-1">{item.title}</Text>
            <StatusBadge label={item.severity} variant={item.severity as any} size="sm" />
          </View>
          <Text className="text-gray-400 text-sm">{item.description}</Text>
          <Text className="text-gray-600 text-xs mt-1">{item.time}</Text>
        </View>
      </View>
    </GlassCard>
  );

  return (
    <LinearGradient colors={['#0A0A0F', '#13131A']} className="flex-1">
      <View className="flex-1 px-4 pt-14">
        <Text className="text-white text-2xl font-bold mb-1">Security Alerts</Text>
        <Text className="text-gray-400 text-sm mb-4">Real-time threat notifications</Text>

        <View className="flex-row mb-4">
          {['all', 'critical', 'high', 'medium', 'low'].map((f) => (
            <NeonButton
              key={f}
              title={f.charAt(0).toUpperCase() + f.slice(1)}
              variant={filter === f || (f === 'all' && !filter) ? 'primary' : 'ghost'}
              size="sm"
              className="mr-2"
              onPress={() => setFilter(f === 'all' ? null : f)}
            />
          ))}
        </View>

        <FlatList
          data={filteredAlerts}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <GlassCard>
              <View className="items-center py-8">
                <Text className="text-4xl mb-3">✅</Text>
                <Text className="text-gray-400 text-center">No alerts to show</Text>
              </View>
            </GlassCard>
          }
        />
      </View>
    </LinearGradient>
  );
}
