import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '../components/HomePage';
import SellBook from '../screens/SellBook';
import BookDetails from '../screens/BookDetails';
import PaymentSelectionScreen from '../screens/PaymentSelectionScreen';
import PaymentGatewayScreen from '../screens/PaymentGatewayScreen';
import { Book } from '../lib/database';

export type RootStackParamList = {
  Home: undefined;
  SellBook: undefined;
  BookDetails: { bookId: string };
  PaymentSelection: { book: Book };
  PaymentGateway: { book: Book; paymentMethod: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="SellBook" component={SellBook} />
      <Stack.Screen name="BookDetails" component={BookDetails} />
      <Stack.Screen
        name="PaymentSelection"
        component={PaymentSelectionScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PaymentGateway"
        component={PaymentGatewayScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 