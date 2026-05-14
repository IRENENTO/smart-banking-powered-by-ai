import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ApplyLoanScreen from './screens/ApplyLoanScreen';
import LoanResultScreen from './screens/LoanResultScreen';

const Stack = createStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ApplyLoan" component={ApplyLoanScreen} options={{ title: 'Loan Application' }} />
                <Stack.Screen name="LoanResult" component={LoanResultScreen} options={{ title: 'Loan Status' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
