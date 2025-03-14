import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';

const PaymentSuccessScreen = () => {
  const navigation = useNavigation();
  const scaleValue = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 500,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start();

    // Auto navigate to home after 3 seconds
    const timer = setTimeout(() => {
      handleContinueShopping();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          { transform: [{ scale: scaleValue }] }
        ]}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="check-circle" size={100} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.message}>
          Your order has been placed successfully. You will receive a confirmation email shortly.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleContinueShopping}
        >
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: wp('8%'),
  },
  iconContainer: {
    marginBottom: hp('4%'),
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: hp('2%'),
  },
  message: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp('4%'),
    lineHeight: wp('6%'),
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('8%'),
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: '500',
  },
});

export default PaymentSuccessScreen; 