import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // Dummy data for now or real API call if token is available
      // const response = await api.get('/transactions');
      // setTransactions(response.data.transactions);
      
      setTransactions([
        { id: '1', description: 'Grocery Store', amount: -150, date: '2026-05-01' },
        { id: '2', description: 'Salary Deposit', amount: 5000, date: '2026-05-01' },
        { id: '3', description: 'Electric Bill', amount: -80, date: '2026-04-28' },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={[styles.amount, { color: item.amount > 0 ? '#10B981' : '#EF4444' }]}>
        {item.amount > 0 ? '+' : ''}{item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#38BDF8" />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  desc: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
