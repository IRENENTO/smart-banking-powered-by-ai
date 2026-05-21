import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../layouts/ScreenLayout';
import BalanceCard from '../components/BalanceCard';
import QuickActionButton from '../components/QuickActionButton';
import TransactionCard from '../components/TransactionCard';
import FinancialHealthRing from '../components/FinancialHealthRing';
import SavingsProgressCard from '../components/SavingsProgressCard';
import { transactionService } from '../services/transactionService';
import { useTransactionStore } from '../store/transactionStore';
import { useAuthStore } from '../store/authStore';
import { colors, typography } from '../theme';
import { QUICK_ACTIONS, HOME_SHORTCUTS } from '../constants';

const HomeDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { balance, transactions, setBalance, setTransactions, setLoading, isLoading } = useTransactionStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const balanceResult = await transactionService.fetchBalance();
        const transactionList = await transactionService.fetchTransactions();
        setBalance(balanceResult.balance);
        setTransactions(transactionList.slice(0, 4));
      } catch (error) {
        console.warn('Home load error', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ScreenLayout>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'AI Customer'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications' as never)} style={styles.notificationBadge}>
          <Text style={styles.notificationText}>🔔</Text>
        </TouchableOpacity>
      </View>

      <BalanceCard balance={balance} currency="RWF" change="+12.4% this week" />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>AI Health</Text>
          <Text style={styles.statValue}>82%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Loan score</Text>
          <Text style={styles.statValue}>79</Text>
        </View>
      </View>

      <FinancialHealthRing score={82} />

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <FlatList
        data={QUICK_ACTIONS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <QuickActionButton
            icon={item.icon}
            label={item.label}
            onPress={() => navigation.navigate(item.route as never)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
        style={styles.actionsList}
      />

      <Text style={styles.sectionTitle}>Explore more</Text>
      <FlatList
        data={HOME_SHORTCUTS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <QuickActionButton
            icon={item.icon}
            label={item.label}
            onPress={() => navigation.navigate(item.route as never)}
            style={styles.extraAction}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
        style={styles.actionsList}
      />

      <Text style={styles.sectionTitle}>Recent activity</Text>
      {transactions.length > 0 ? (
        transactions.map((transaction) => <TransactionCard key={transaction.id.toString()} transaction={transaction} />)
      ) : (
        <Text style={styles.emptyText}>{isLoading ? 'Loading recent activity...' : 'No recent activity yet.'}</Text>
      )}

      <SavingsProgressCard
        goal={{
          id: 'education',
          title: 'Education fund',
          goalAmount: 300000,
          savedAmount: 187500,
          progress: 63,
          dueDate: '2025-12-31',
        }}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: colors.dark.textSecondary,
    fontSize: typography.body,
    marginBottom: 4,
  },
  userName: {
    color: colors.dark.text,
    fontSize: typography.h2,
    fontWeight: '900',
  },
  notificationBadge: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginRight: 12,
  },
  statLabel: {
    color: colors.dark.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    color: colors.dark.text,
    fontSize: typography.h3,
    fontWeight: '800',
  },
  sectionTitle: {
    color: colors.dark.text,
    fontSize: typography.h3,
    fontWeight: '800',
    marginBottom: 14,
  },
  actionsList: {
    marginBottom: 24,
  },
  extraAction: {
    minWidth: 125,
  },
  emptyText: {
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
  },
});

export default HomeDashboardScreen;
