import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';

// Mock user data for testing
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  username: 'johndoe',
};

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
