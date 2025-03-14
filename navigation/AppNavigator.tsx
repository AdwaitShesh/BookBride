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
import NotificationsScreen from '../screens/NotificationsScreen';
import WishlistScreen from '../screens/WishlistScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';

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
  Notifications: undefined;
  Wishlist: undefined;
  PaymentSuccess: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.white,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sell"
        component={SellStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomePage} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
  </Stack.Navigator>
);

const SellStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SellScreen" component={SellBook} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CartScreen" component={CartScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
  </Stack.Navigator>
);

const AppNavigator = ({ initialRouteName = 'Auth' }) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={AuthPage} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="BookDetails" component={BookDetails} />
      <Stack.Screen name="AllBooks" component={AllBooksScreen} />
      <Stack.Screen name="PaymentSelection" component={PaymentSelectionScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PaymentGateway" component={PaymentGatewayScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="SellBook" component={SellBook} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 