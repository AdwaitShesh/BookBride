import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import { initDatabase } from './lib/services/dbInit';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    initDatabase()
      .then(() => console.log('Database initialized successfully'))
      .catch(error => console.error('Database initialization failed:', error));
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Auth">
          <Stack.Screen 
            name="Auth" 
            component={AuthPage} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomePage}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
