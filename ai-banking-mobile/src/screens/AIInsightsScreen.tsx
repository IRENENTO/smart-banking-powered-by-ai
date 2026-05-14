import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AIInsightsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>AI Assistant</Text>
      
      <View style={styles.chatBubble}>
        <Text style={styles.chatText}>Hello! I analyzed your spending habits. Your expenses are increasing.</Text>
      </View>

      <View style={styles.chatBubble}>
        <Text style={styles.chatText}>You can save more this month by reducing dining out expenses.</Text>
      </View>

      <View style={[styles.chatBubble, styles.userBubble]}>
        <Text style={styles.userText}>How can I invest?</Text>
      </View>

      <View style={styles.chatBubble}>
        <Text style={styles.chatText}>Based on your risk profile, I recommend exploring low-risk index funds and government bonds.</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  headerTitle: {
    color: '#38BDF8',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  chatBubble: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    marginBottom: 16,
    maxWidth: '85%',
  },
  chatText: {
    color: '#F8FAFC',
    fontSize: 16,
  },
  userBubble: {
    backgroundColor: '#38BDF8',
    alignSelf: 'flex-end',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  userText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '500',
  },
});
