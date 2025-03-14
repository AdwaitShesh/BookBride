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
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import CustomHeader from '../components/CustomHeader';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<CartScreenNavigationProp>();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCartItems();
    });

    return unsubscribe;
  }, [navigation]);

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

  const handleBuyNow = (book: Book) => {
    navigation.navigate('PaymentSelection', { book });
  };

  const renderCartItem = ({ item }: { item: Book }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => navigation.navigate('BookDetails', { bookId: item.id })}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.bookImage} />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.bookAuthor}>{item.author}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{item.price}</Text>
            <Text style={styles.originalPrice}>
              ₹{Math.round(item.price * 1.5)}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => handleBuyNow(item)}
            >
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFromCart(item.id)}
            >
              <Ionicons name="trash-outline" size={24} color="#00796b" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const EmptyCartComponent = () => (
    <View style={styles.emptyCart}>
      <Ionicons name="cart-outline" size={64} color="#999" />
      <Text style={styles.emptyText}>Your cart is empty</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('MainTabs')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="My Cart" />
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.cartList}
        ListEmptyComponent={EmptyCartComponent}
        showsVerticalScrollIndicator={false}
      />
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>
              ₹{cartItems.reduce((sum, item) => sum + item.price, 0)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => {
              if (cartItems.length > 0) {
                navigation.navigate('PaymentSelection', { book: cartItems[0] });
              }
            }}
          >
            <Text style={styles.checkoutButtonText}>Checkout All</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cartList: {
    padding: wp('4%'),
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: wp('4%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemContent: {
    flexDirection: 'row',
    padding: wp('3%'),
  },
  bookImage: {
    width: wp('25%'),
    height: hp('15%'),
    borderRadius: 4,
  },
  bookInfo: {
    flex: 1,
    marginLeft: wp('3%'),
  },
  bookTitle: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: wp('3.2%'),
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#00796b',
  },
  originalPrice: {
    fontSize: wp('3.2%'),
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buyButton: {
    backgroundColor: '#00796b',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '500',
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