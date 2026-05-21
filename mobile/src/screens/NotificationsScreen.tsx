import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import ScreenLayout from '../layouts/ScreenLayout';
import NotificationCard from '../components/NotificationCard';
import { NotificationItem } from '../types';
import { notificationService } from '../services/notificationService';
import { colors, typography } from '../theme';

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await notificationService.fetchNotifications();
        setNotifications(response.notifications || []);
      } catch (error) {
        console.warn('Notifications load error', error);
      }
    };
    loadNotifications();
  }, []);

  return (
    <ScreenLayout>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>All account alerts, security updates, and service news in one place.</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationCard item={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No new notifications.</Text>}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
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
    marginBottom: 20,
  },
  emptyText: {
    color: colors.dark.textSecondary,
    marginTop: 40,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
