import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { secureStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import { TabNavigator } from './TabNavigator';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import LoansScreen from '../screens/LoansScreen';
import FraudAlertsScreen from '../screens/FraudAlertsScreen';
import SavingsScreen from '../screens/SavingsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SecurityScreen from '../screens/SecurityScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen name="Transactions" component={TransactionsScreen} />
    <Stack.Screen name="Loans" component={LoansScreen} />
    <Stack.Screen name="Savings" component={SavingsScreen} />
    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
    <Stack.Screen name="FraudAlerts" component={FraudAlertsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Security" component={SecurityScreen} />
    <Stack.Screen name="Admin" component={AdminDashboardScreen} />
  </Stack.Navigator>
);

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#050E1B',
    card: '#0D1B33',
    text: '#F8FAFC',
    border: 'rgba(255,255,255,0.1)',
  },
};

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, setUser, setToken, setAuthenticated, setLoading } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await secureStorage.getItem(STORAGE_KEYS.TOKEN);
        const userStr = await secureStorage.getItem(STORAGE_KEYS.USER);
        if (token && userStr) {
          setToken(token);
          setUser(JSON.parse(userStr));
          setAuthenticated(true);
        }
      } catch (error) {
        console.warn('Auth bootstrap error', error);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowSplash(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
