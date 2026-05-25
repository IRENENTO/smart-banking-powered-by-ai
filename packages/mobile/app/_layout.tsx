import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthContext, useAuthProvider } from '../hooks/useAuth';

function RootLayout() {
  const auth = useAuthProvider();

  if (auth.isLoading) {
    return (
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center">
        <ActivityIndicator size="large" color="#00F5FF" />
        <Text className="text-primary mt-4 font-bold text-lg">Sentinel AI</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </GestureHandlerRootView>
    </AuthContext.Provider>
  );
}

export default RootLayout;
