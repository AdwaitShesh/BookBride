import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DatabaseService, Book } from '../lib/database';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<CartScreenNavigationProp>();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const items = await DatabaseService.getCartItems();
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      Alert.alert('Error', 'Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (bookId: string) => {
    try {
      await DatabaseService.removeFromCart(bookId);
      setCartItems(prevItems => prevItems.filter(item => item.id !== bookId));
      Alert.alert('Success', 'Item removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to your cart before proceeding');
      return;
    }
    navigation.navigate('PaymentSelection', { book: cartItems[0] }); // For now, handle single item
  };

  const renderItem = ({ item }: { item: Book }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.bookImage}
        defaultSource={require('../assets/book1.jpg')}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>
        <Text style={styles.bookPrice}>₹{item.price}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveFromCart(item.id)}
      >
        <Ionicons name="trash-outline" size={24} color="#00796b" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#00796b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.cartList}
        ListEmptyComponent={
          <View style={styles.emptyCart}>
            <MaterialCommunityIcons name="cart-outline" size={64} color="#999" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>₹{calculateTotal()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleProceedToPayment}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp('4%'),
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  cartList: {
    padding: wp('4%'),
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: wp('3%'),
    marginBottom: wp('3%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bookImage: {
    width: wp('20%'),
    height: wp('25%'),
    borderRadius: 4,
  },
  bookInfo: {
    flex: 1,
    marginLeft: wp('3%'),
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
    color: '#333',
  },
  bookAuthor: {
    fontSize: wp('3.2%'),
    color: '#666',
  },
  bookPrice: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#00796b',
  },
  removeButton: {
    padding: 8,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('10%'),
  },
  emptyText: {
    fontSize: wp('4%'),
    color: '#999',
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
  },
  shopButton: {
    backgroundColor: '#00796b',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('8%'),
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: wp('3.5%'),
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  totalLabel: {
    fontSize: wp('4%'),
    color: '#666',
  },
  totalAmount: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#00796b',
  },
  checkoutButton: {
    backgroundColor: '#00796b',
    padding: wp('4%'),
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: '500',
  },
});

export default CartScreen; 