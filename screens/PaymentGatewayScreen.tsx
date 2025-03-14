import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS, SIZES } from '../constants';
import { DatabaseService } from '../lib/database';

type PaymentGatewayScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentGateway'>;

const PaymentGatewayScreen = () => {
  const navigation = useNavigation<PaymentGatewayScreenNavigationProp>();
  const route = useRoute();
  const { book, paymentMethod, address, upiId } = route.params as any;

  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      switch (paymentMethod) {
        case 'cod':
          // Process COD order
          await DatabaseService.createOrder({
            bookId: book.id,
            paymentMethod: 'cod',
            address,
            status: 'pending',
          });
          break;

        case 'upi':
          if (!upiId) {
            Alert.alert('Error', 'Please enter UPI ID');
            return;
          }
          await DatabaseService.createOrder({
            bookId: book.id,
            paymentMethod: 'upi',
            address,
            upiId,
            status: 'processing',
          });
          break;

        case 'card':
          if (!validateCardDetails()) return;
          await DatabaseService.createOrder({
            bookId: book.id,
            paymentMethod: 'card',
            address,
            status: 'processing',
          });
          break;

        case 'netbanking':
          if (!validateBankDetails()) return;
          await DatabaseService.createOrder({
            bookId: book.id,
            paymentMethod: 'netbanking',
            address,
            status: 'processing',
          });
          break;
      }

      // Show success message and navigate to success screen
      Alert.alert(
        'Success',
        'Payment processed successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateCardDetails = () => {
    if (cardDetails.number.length !== 16) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return false;
    }
    if (!cardDetails.name.trim()) {
      Alert.alert('Error', 'Please enter cardholder name');
      return false;
    }
    if (cardDetails.expiry.length !== 5) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (cardDetails.cvv.length !== 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }
    return true;
  };

  const validateBankDetails = () => {
    if (!bankDetails.bankName.trim()) {
      Alert.alert('Error', 'Please select a bank');
      return false;
    }
    if (!bankDetails.accountNumber.trim()) {
      Alert.alert('Error', 'Please enter account number');
      return false;
    }
    if (!bankDetails.ifscCode.trim()) {
      Alert.alert('Error', 'Please enter IFSC code');
      return false;
    }
    return true;
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'cod':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cash on Delivery</Text>
            <Text style={styles.description}>
              Pay ₹{book.price + 40} when your order arrives at:
            </Text>
            <View style={styles.addressBox}>
              <Text style={styles.addressText}>{address.fullName}</Text>
              <Text style={styles.addressText}>{address.street}</Text>
              <Text style={styles.addressText}>
                {address.city}, {address.state} - {address.pincode}
              </Text>
              <Text style={styles.addressText}>Phone: {address.phone}</Text>
            </View>
          </View>
        );

      case 'upi':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UPI Payment</Text>
            <Text style={styles.description}>
              Complete payment using UPI ID: {upiId}
            </Text>
            <View style={styles.upiInfo}>
              <MaterialCommunityIcons name="qrcode-scan" size={100} color={COLORS.primary} />
              <Text style={styles.upiAmount}>₹{book.price + 40}</Text>
            </View>
          </View>
        );

      case 'card':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Payment</Text>
            <View style={styles.cardForm}>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                value={cardDetails.number}
                onChangeText={(text) => setCardDetails({ ...cardDetails, number: text })}
                keyboardType="numeric"
                maxLength={16}
              />
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                value={cardDetails.name}
                onChangeText={(text) => setCardDetails({ ...cardDetails, name: text })}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChangeText={(text) => setCardDetails({ ...cardDetails, expiry: text })}
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVV"
                  value={cardDetails.cvv}
                  onChangeText={(text) => setCardDetails({ ...cardDetails, cvv: text })}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        );

      case 'netbanking':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Net Banking</Text>
            <View style={styles.bankForm}>
              <TextInput
                style={styles.input}
                placeholder="Select Bank"
                value={bankDetails.bankName}
                onChangeText={(text) => setBankDetails({ ...bankDetails, bankName: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Account Number"
                value={bankDetails.accountNumber}
                onChangeText={(text) => setBankDetails({ ...bankDetails, accountNumber: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="IFSC Code"
                value={bankDetails.ifscCode}
                onChangeText={(text) => setBankDetails({ ...bankDetails, ifscCode: text })}
                autoCapitalize="characters"
              />
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderPaymentForm()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Book Price</Text>
            <Text style={styles.summaryValue}>₹{book.price}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₹40</Text>
          </View>
          <View style={[styles.summaryItem, styles.totalItem]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{book.price + 40}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.payButtonText}>
              {paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
            </Text>
          )}
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
  description: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  addressBox: {
    backgroundColor: COLORS.lightPrimary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  addressText: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: 4,
  },
  upiInfo: {
    alignItems: 'center',
    padding: SIZES.padding,
  },
  upiAmount: {
    ...FONTS.h1,
    color: COLORS.primary,
    marginTop: SIZES.padding,
  },
  cardForm: {
    gap: SIZES.padding,
  },
  bankForm: {
    gap: SIZES.padding,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.padding,
  },
  halfInput: {
    flex: 1,
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
  payButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  payButtonText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
});

export default PaymentGatewayScreen; 