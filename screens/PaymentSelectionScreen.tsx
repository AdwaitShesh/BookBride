import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS, SIZES } from '../constants';
import { DatabaseService } from '../lib/database';

type PaymentSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentSelection'>;

type Address = {
  fullName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

const PaymentSelectionScreen = () => {
  const navigation = useNavigation<PaymentSelectionScreenNavigationProp>();
  const route = useRoute();
  const { book } = route.params as { book: any };

  const [address, setAddress] = useState<Address>({
    fullName: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  });

  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateAddress = () => {
    const fields = Object.entries(address);
    for (const [key, value] of fields) {
      if (!value.trim()) {
        Alert.alert('Error', `Please enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (address.pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return false;
    }
    if (address.phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateAddress()) return;

    try {
      setIsProcessing(true);
      
      // Save address to database
      await DatabaseService.saveAddress(address);

      switch (selectedPayment) {
        case 'cod':
          // Process COD order
          await handlePlaceOrder();
          break;

        case 'upi':
          if (!upiId.trim()) {
            Alert.alert('Error', 'Please enter UPI ID');
            return;
          }
          await handlePlaceOrder();
          break;

        case 'card':
          await handlePlaceOrder();
          break;

        case 'netbanking':
          await handlePlaceOrder();
          break;

        default:
          Alert.alert('Error', 'Please select a payment method');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);
      
      // Generate a unique order ID using timestamp and random string
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the order
      const newOrder = {
        id: orderId,
        bookId: book.id,
        userId: await DatabaseService.getCurrentUserId(),
        paymentMethod: selectedPayment,
        address: address,
        status: 'pending',
        upiId: selectedPayment === 'upi' ? upiId : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save the order
      await DatabaseService.createOrder(newOrder);
      
      // Navigate to payment success screen
      navigation.navigate('PaymentSuccess');
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressForm}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={address.fullName}
              onChangeText={(text) => setAddress({ ...address, fullName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              value={address.street}
              onChangeText={(text) => setAddress({ ...address, street: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={address.city}
              onChangeText={(text) => setAddress({ ...address, city: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={address.state}
              onChangeText={(text) => setAddress({ ...address, state: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Pincode"
              value={address.pincode}
              onChangeText={(text) => setAddress({ ...address, pincode: text })}
              keyboardType="numeric"
              maxLength={6}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={address.phone}
              onChangeText={(text) => setAddress({ ...address, phone: text })}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPayment === 'cod' && styles.selectedPayment,
              ]}
              onPress={() => setSelectedPayment('cod')}
            >
              <MaterialCommunityIcons name="cash-multiple" size={24} color={COLORS.primary} />
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPayment === 'upi' && styles.selectedPayment,
              ]}
              onPress={() => setSelectedPayment('upi')}
            >
              <FontAwesome5 name="google-pay" size={24} color={COLORS.primary} />
              <Text style={styles.paymentText}>UPI</Text>
            </TouchableOpacity>

            {selectedPayment === 'upi' && (
              <TextInput
                style={styles.input}
                placeholder="Enter UPI ID"
                value={upiId}
                onChangeText={setUpiId}
              />
            )}

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPayment === 'card' && styles.selectedPayment,
              ]}
              onPress={() => setSelectedPayment('card')}
            >
              <MaterialCommunityIcons name="credit-card" size={24} color={COLORS.primary} />
              <Text style={styles.paymentText}>Credit/Debit Card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPayment === 'netbanking' && styles.selectedPayment,
              ]}
              onPress={() => setSelectedPayment('netbanking')}
            >
              <MaterialCommunityIcons name="bank" size={24} color={COLORS.primary} />
              <Text style={styles.paymentText}>Net Banking</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Book Price</Text>
            <Text style={styles.summaryValue}>{DatabaseService.formatPrice(book.price)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>{DatabaseService.formatPrice(40)}</Text>
          </View>
          <View style={[styles.summaryItem, styles.totalItem]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              {DatabaseService.formatPrice(
                (typeof book.price === 'string' 
                  ? parseFloat(book.price.replace(/[^\d.]/g, '')) 
                  : Number(book.price)) + 40
              )}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.proceedButton} onPress={handlePayment} disabled={isProcessing}>
          <Text style={styles.proceedButtonText}>Proceed to Pay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.text,
    marginLeft: SIZES.padding,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  addressForm: {
    gap: SIZES.padding,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: 16,
  },
  paymentOptions: {
    gap: SIZES.padding,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    gap: SIZES.padding,
  },
  selectedPayment: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightPrimary,
  },
  paymentText: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.base,
  },
  summaryLabel: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  summaryValue: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  totalItem: {
    marginTop: SIZES.padding,
    paddingTop: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  totalValue: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  footer: {
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  proceedButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  proceedButtonText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
});

export default PaymentSelectionScreen; 