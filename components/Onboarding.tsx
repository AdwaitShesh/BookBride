import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the navigation param list type
type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
};

// Define the navigation prop type
type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const Onboarding = () => {
  // Use the typed navigation
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://source.unsplash.com/random/800x600' }}
        style={styles.image}
      />
      <Text style={styles.title}>Welcome to BookBride!</Text>
      <Text style={styles.subtitle}>Your journey to finding the perfect book starts here.</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => {
          try {
            navigation.navigate('Auth');
          } catch (error) {
            console.error('Navigation error:', error);
          }
        }}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#004d40',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00796b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default Onboarding; 