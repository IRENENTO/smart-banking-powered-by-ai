import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../../components/ui/GlassCard';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { NeonButton } from '../../../components/ui/NeonButton';

const { width } = Dimensions.get('window');

export default function TrackingScreen() {
  const [location, setLocation] = useState({
    latitude: -1.9441,
    longitude: 30.0619,
    accuracy: 12,
    speed: 0,
    battery: 87,
  });

  return (
    <LinearGradient colors={['#0A0A0F', '#13131A']} className="flex-1">
      <ScrollView className="flex-1 px-4 pt-14" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-2xl font-bold mb-1">Live Tracking</Text>
        <Text className="text-gray-400 text-sm mb-6">Real-time GPS location</Text>

        <GlassCard className="mb-4 h-64" glowColor="rgba(0,245,255,0.1)">
          <View className="flex-1 items-center justify-center">
            <Text className="text-6xl mb-4">🗺️</Text>
            <Text className="text-gray-400 text-sm text-center">
              Map view will appear here{'\n'}with real-time GPS tracking
            </Text>
          </View>
        </GlassCard>

        <GlassCard className="mb-4">
          <Text className="text-white font-bold mb-4">Location Details</Text>
          <View className="flex-row flex-wrap">
            {[
              { label: 'Latitude', value: location.latitude.toFixed(6) },
              { label: 'Longitude', value: location.longitude.toFixed(6) },
              { label: 'Accuracy', value: `${location.accuracy}m` },
              { label: 'Speed', value: `${location.speed} km/h` },
              { label: 'Battery', value: `${location.battery}%` },
              { label: 'Network', value: '4G LTE' },
            ].map((item, i) => (
              <View key={i} className="w-1/3 mb-3">
                <Text className="text-gray-500 text-xs">{item.label}</Text>
                <Text className="text-white text-sm font-mono">{item.value}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        <View className="flex-row mb-6">
          <NeonButton
            title="Share Location"
            variant="primary"
            size="sm"
            className="flex-1 mr-2"
            onPress={() => {}}
          />
          <NeonButton
            title="Geofence"
            variant="secondary"
            size="sm"
            className="flex-1 ml-2"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
