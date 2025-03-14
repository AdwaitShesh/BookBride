import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBookContext } from '../contexts/BookContext';
import { SIZES, COLORS, FONTS } from '../constants';

const BookDetailsScreen = () => {
  const navigation = useNavigation();
  const { book } = useBookContext();

  const handleBuyNow = useCallback(() => {
    navigation.navigate('PaymentSelection' as never, { book });
  }, [navigation, book]);

  return (
    <View style={styles.container}>
      {/* ... existing code ... */}
      
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price:</Text>
          <Text style={styles.price}>₹{book.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... existing styles ...
  
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    ...FONTS.h3,
    color: COLORS.text,
    marginRight: 8,
  },
  price: {
    ...FONTS.h2,
    color: COLORS.primary,
  },
  buyNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  buyNowButtonText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
});

export default BookDetailsScreen; 