import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomePage from '../components/HomePage';
import CartScreen from '../screens/CartScreen';
import BookDetails from '../screens/BookDetails';
import PaymentSelectionScreen from '../screens/PaymentSelectionScreen';
import PaymentGatewayScreen from '../screens/PaymentGatewayScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import SellBook from '../screens/SellBook';
import AllBooksScreen from '../screens/AllBooksScreen';
import AuthPage from '../components/AuthPage';
import { COLORS } from '../constants';

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  BookDetails: { bookId: string };
  Cart: undefined;
  PaymentSelection: { book: any };
  PaymentGateway: { book: any; paymentMethod: string; address: any; upiId?: string };
  OrderTracking: { orderId: string };
  SellBook: undefined;
  AllBooks: {
    title: string;
    books: BookItem[];
    type: 'recent' | 'featured';
  };
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Sell') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Sell" component={SellBook} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = ({ initialRouteName = 'Auth' }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="Auth" component={AuthPage} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="BookDetails" component={BookDetails} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="PaymentSelection" component={PaymentSelectionScreen} />
      <Stack.Screen name="PaymentGateway" component={PaymentGatewayScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="SellBook" component={SellBook} />
      <Stack.Screen name="AllBooks" component={AllBooksScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 