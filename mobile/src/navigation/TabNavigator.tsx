import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeDashboardScreen from '../screens/HomeDashboardScreen';
import AIInsightsScreen from '../screens/AIInsightsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import InvestmentsScreen from '../screens/InvestmentsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const tabIcons: Record<string, string> = {
  Home: 'home-analytics',
  Insights: 'robot',
  Payments: 'credit-card',
  Investments: 'chart-line',
  Notifications: 'bell-outline',
  Profile: 'account-circle',
};

export const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: true,
      tabBarLabelStyle: styles.label,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.dark.accent,
      tabBarInactiveTintColor: '#A6B7D8',
      tabBarIcon: ({ focused, color, size }) => (
        <View style={[styles.iconWrapper, focused && styles.iconActive]}>
          <MaterialCommunityIcons name={tabIcons[route.name] ?? 'circle'} color={color} size={22} />
        </View>
      ),
    })}
  >
    <Tab.Screen name="Home" component={HomeDashboardScreen} />
    <Tab.Screen name="Insights" component={AIInsightsScreen} />
    <Tab.Screen name="Payments" component={PaymentsScreen} />
    <Tab.Screen name="Investments" component={InvestmentsScreen} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 14,
    borderRadius: 24,
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 18 : 8,
    backgroundColor: 'rgba(10, 20, 44, 0.95)',
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: 'rgba(44,229,213,0.16)',
  },
});
