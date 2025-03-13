import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Auth: undefined;
  Home: { user: any };
};

type AuthPageProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Auth'>;
};

const AuthPage = ({ navigation }: AuthPageProps) => {
  const [isRegistering, setIsRegistering] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (isLoading) return;
    
    if (!name || !email || !password || !contact || !username) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:3000/api/register', {
        name,
        email,
        password,
        contact,
        username
      });
      
      if (response.data.success) {
        Alert.alert('Success', 'User registered successfully');
        if (rememberMe) {
          await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        }
        setName('');
        setEmail('');
        setPassword('');
        setContact('');
        setUsername('');
        navigation.navigate('Home', { user: response.data.user });
      } else {
        Alert.alert('Error', response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to register user. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (isLoading) return;
    
    if (!loginUsername || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:3000/api/login', {
        username: loginUsername,
        password
      });
      
      if (response.data.success) {
        if (rememberMe) {
          await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
          await AsyncStorage.setItem('token', response.data.token);
        }
        navigation.navigate('Home', { user: response.data.user });
      } else {
        Alert.alert('Error', response.data.message || 'Invalid credentials');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to login. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{isRegistering ? 'Register' : 'Login'}</Text>
        
        {isRegistering ? (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={24} color="#00796b" style={styles.icon} />
              <TextInput 
                placeholder="Name" 
                value={name} 
                onChangeText={setName} 
                style={styles.input} 
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="person-circle-outline" size={24} color="#00796b" style={styles.icon} />
              <TextInput 
                placeholder="Username" 
                value={username} 
                onChangeText={setUsername} 
                style={styles.input} 
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={24} color="#00796b" style={styles.icon} />
              <TextInput 
                placeholder="Email" 
                value={email} 
                onChangeText={setEmail} 
                style={styles.input} 
                keyboardType="email-address" 
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#00796b" style={styles.icon} />
              <TextInput 
                placeholder="Password" 
                value={password} 
                onChangeText={setPassword} 
                style={styles.input} 
                secureTextEntry 
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={24} color="#00796b" style={styles.icon} />
              <TextInput 
                placeholder="Contact No" 
                value={contact} 
                onChangeText={setContact} 
                style={styles.input} 
                keyboardType="phone-pad" 
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>{isLoading ? 'Registering...' : 'Register'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setIsRegistering(false)}>
              <Text style={styles.switchText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={24} color="#00796b" style={styles.icon} />
              <TextInput 
                placeholder="Username" 
                value={loginUsername} 
                onChangeText={setLoginUsername} 
                style={styles.input} 
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#00796b" style={styles.icon} />
              <TextInput 
                placeholder="Password" 
                value={password} 
                onChangeText={setPassword} 
                style={styles.input} 
                secureTextEntry 
              />
            </View>
            
            <View style={styles.rememberContainer}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={rememberMe ? "#00796b" : "#f4f3f4"}
              />
              <Text style={styles.rememberText}>Remember me</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setIsRegistering(true)}>
              <Text style={styles.switchText}>Don't have an account? Register</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  icon: {
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  button: {
    backgroundColor: '#00796b',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchText: {
    color: '#00796b',
    textAlign: 'center',
    marginTop: 10,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rememberText: {
    marginLeft: 10,
    color: '#00796b',
  },
});

export default AuthPage; 