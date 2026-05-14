import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const HomeScreen = ({ route, navigation }: any) => {
    const { user, token } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.welcome}>Welcome, {user.name}!</Text>
            <View style={styles.card}>
                <Text>Intelligent Banking at your fingertips.</Text>
            </View>
            <Button title="Apply for Loan" onPress={() => navigation.navigate('ApplyLoan', { token })} />
            <View style={{ marginVertical: 10 }} />
            <Button title="Loan Status" onPress={() => navigation.navigate('LoanResult', { token })} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    welcome: { fontSize: 20, marginBottom: 20 },
    card: { padding: 20, backgroundColor: '#eee', borderRadius: 10, marginBottom: 20 }
});

export default HomeScreen;
