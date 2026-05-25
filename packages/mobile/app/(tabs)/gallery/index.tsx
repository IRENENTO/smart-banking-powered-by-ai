import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../../components/ui/GlassCard';

export default function GalleryScreen() {
  return (
    <LinearGradient colors={['#0A0A0F', '#13131A']} className="flex-1">
      <ScrollView className="flex-1 px-4 pt-14" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-2xl font-bold mb-1">Intruder Gallery</Text>
        <Text className="text-gray-400 text-sm mb-6">Captured evidence</Text>

        <GlassCard>
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">📸</Text>
            <Text className="text-gray-400 text-center text-base mb-2">
              No intruders captured yet
            </Text>
            <Text className="text-gray-600 text-sm text-center">
              Photos and videos of failed unlock attempts{'\n'}will appear here
            </Text>
          </View>
        </GlassCard>

        <View className="flex-row flex-wrap mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <GlassCard key={i} className="w-[48%] mr-[4%] mb-4 p-0 overflow-hidden">
              <View className="aspect-square bg-surface-light items-center justify-center">
                <Text className="text-gray-600">📷</Text>
              </View>
              <View className="p-2">
                <Text className="text-gray-500 text-xs">Placeholder</Text>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
