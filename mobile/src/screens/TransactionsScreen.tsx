import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import ScreenLayout from '../layouts/ScreenLayout';
import TransactionCard from '../components/TransactionCard';
import { transactionService } from '../services/transactionService';
import { useTransactionStore } from '../store/transactionStore';
import { colors, typography } from '../theme';

const TransactionsScreen: React.FC = () => {
  const { transactions, setTransactions, setLoading, isLoading } = useTransactionStore();
  const [search, setSearch] = React.useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await transactionService.fetchTransactions();
        setTransactions(data);
      } catch (error) {
        console.warn('Transactions load error', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = transactions.filter((item) => item.description.toLowerCase().includes(search.toLowerCase()) || item.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScreenLayout>
      <Text style={styles.title}>Transaction History</Text>
      <Text style={styles.subtitle}>Search, filter, and review your payment activity.</Text>
      <TextInput style={styles.searchInput} placeholder="Search transactions" placeholderTextColor="rgba(248,250,252,0.5)" value={search} onChangeText={setSearch} />
      {isLoading ? (
        <Text style={styles.emptyText}>Loading transactions...</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TransactionCard transaction={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No transactions match your search.</Text>}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
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
    marginBottom: 18,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: colors.dark.text,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  emptyText: {
    color: colors.dark.textSecondary,
    marginTop: 40,
    textAlign: 'center',
  },
});

export default TransactionsScreen;
