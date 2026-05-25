import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (!isLoading) {
        router.replace(isAuthenticated ? '/(tabs)/dashboard' : '/(auth)/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading]);

  return (
    <View className="flex-1 bg-[#0A0A0F] items-center justify-center">
      <Animated.View style={{ opacity, transform: [{ scale }] }} className="items-center">
        <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-6 shadow-lg shadow-primary/30">
          <View className="w-16 h-16 rounded-full bg-primary/30 items-center justify-center">
            <Text className="text-3xl">🛡️</Text>
          </View>
        </View>
        <Text className="text-primary text-4xl font-bold tracking-wider">
          SENTINEL
        </Text>
        <Text className="text-gray-400 text-lg tracking-[0.3em] uppercase mt-2">
          AI Security
        </Text>
        <View className="flex-row mt-8">
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              className="w-2 h-2 rounded-full bg-primary mx-1"
              style={{
                opacity: opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 1],
                }),
              }}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
