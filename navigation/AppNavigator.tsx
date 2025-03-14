import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '../components/HomePage';
import SellBook from '../screens/SellBook';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="SellBook" component={SellBook} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 