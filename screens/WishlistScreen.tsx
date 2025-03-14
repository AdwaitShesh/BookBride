import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DatabaseService, Book } from '../lib/database';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import CustomHeader from '../components/CustomHeader';
import { COLORS } from '../constants';

type WishlistScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Wishlist'>;

const WishlistScreen: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<WishlistScreenNavigationProp>();

  useFocusEffect(
    useCallback(() => {
      loadWishlistItems();
    }, [])
  );

  const loadWishlistItems = async () => {
    try {
      setLoading(true);
      const items = await DatabaseService.getWishlist();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist items:', error);
      Alert.alert('Error', 'Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (bookId: string) => {
    try {
      await DatabaseService.removeFromWishlist(bookId);
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== bookId));
      Alert.alert('Success', 'Item removed from wishlist');
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      Alert.alert('Error', 'Failed to remove item from wishlist');
    }
  };

  const handleAddToCart = async (book: Book) => {
    try {
      await DatabaseService.addToCart(book);
      Alert.alert('Success', 'Item added to cart');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const renderWishlistItem = ({ item }: { item: Book }) => (
    <View style={styles.wishlistItem}>
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => navigation.navigate('BookDetails', { bookId: item.id })}
      >
        <Image 
          source={{ uri: item.imageUrl || item.image?.uri || 'https://via.placeholder.com/150' }} 
          style={styles.bookImage}
          defaultSource={require('../assets/placeholder-book.png')}
        />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.bookAuthor}>{item.author}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{DatabaseService.formatPrice(item.price)}</Text>
            <Text style={styles.originalPrice}>
              {DatabaseService.formatPrice(item.originalPrice || (Number(item.price) * 1.5))}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFromWishlist(item.id)}
            >
              <Ionicons name="heart-dislike-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const EmptyWishlistComponent = () => (
    <View style={styles.emptyWishlist}>
      <Ionicons name="heart-outline" size={64} color="#999" />
      <Text style={styles.emptyText}>Your wishlist is empty</Text>
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
      <CustomHeader title="My Wishlist" />
      <FlatList
        data={wishlistItems}
        renderItem={renderWishlistItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.wishlistList}
        ListEmptyComponent={EmptyWishlistComponent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wishlistList: {
    padding: wp('4%'),
  },
  wishlistItem: {
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
    color: COLORS.primary,
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
  addToCartButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addToCartButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  emptyWishlist: {
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
    backgroundColor: COLORS.primary,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('8%'),
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: wp('3.5%'),
    fontWeight: '500',
  },
});

export default WishlistScreen; 