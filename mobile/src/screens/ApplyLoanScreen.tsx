import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { loanService } from '../services/api';

const ApplyLoanScreen = ({ route, navigation }: any) => {
    const { token } = route.params;
    const [amount, setAmount] = useState('');
    const [income, setIncome] = useState('');

    const handleApply = async () => {
        try {
            await loanService.apply({ amount, monthlyIncome: income, purpose: 'Mobile Loan', duration: 12, existingDebt: 0 }, token);
            Alert.alert('Success', 'Application submitted to AI engine');
            navigation.navigate('LoanResult', { token });
        } catch (err) {
            Alert.alert('Error', 'Application failed');
        }
    };

    return (
        <View style={styles.container}>
            <Text>Loan Amount</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount} />
            <Text>Monthly Income</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={income} onChangeText={setIncome} />
            <Button title="Analyze with AI" onPress={handleApply} color="green" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    input: { borderBottomWidth: 1, marginBottom: 20 }
});

export default ApplyLoanScreen;
