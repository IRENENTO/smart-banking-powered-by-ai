import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { loanService } from '../services/api';

const LoanResultScreen = ({ route }: any) => {
    const { token } = route.params;
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            const res = await loanService.getLoans(token);
            setLoans(res.data);
        };
        fetch();
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={loans}
                keyExtractor={(item: any) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={{ fontWeight: 'bold' }}>Status: {item.status}</Text>
                        <Text>Amount: ${item.amount}</Text>
                        {item.aiDecision && <Text>AI Score: {item.aiDecision.riskScore}</Text>}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    item: { padding: 15, borderBottomWidth: 1 }
});

export default LoanResultScreen;
