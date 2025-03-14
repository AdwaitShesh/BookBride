import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  AntDesign,
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DatabaseService, Book } from '../lib/database';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SIZES, COLORS, FONTS } from '../constants';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomHeader from '../components/CustomHeader';

type BookDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BookDetails'>;

const BookDetails = () => {
  const navigation = useNavigation<BookDetailsScreenNavigationProp>();
  const route = useRoute();
  const { bookId } = route.params as { bookId: string };
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);

  useEffect(() => {
    const loadBookDetails = async () => {
      try {
        setLoading(true);
        const bookId = route.params?.bookId;
        if (!bookId) {
          Alert.alert('Error', 'Book ID not found');
          return;
        }
        const bookData = await DatabaseService.getBookById(bookId);
        if (bookData) {
          setBook(bookData);
          const bookReviews = await DatabaseService.getBookReviews(bookId);
          setReviews(bookReviews);
          const suggestedBooks = await DatabaseService.getSuggestedBooks(bookId);
          setSuggestedBooks(suggestedBooks);
        }
      } catch (error) {
        console.error('Error loading book details:', error);
        Alert.alert('Error', 'Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    loadBookDetails();
  }, [route.params]);

  const getBookImage = () => {
    if (!book) return require('../assets/placeholder-book.png');
    if (book.imageUrl) return { uri: book.imageUrl };
    if (book.image?.uri) return { uri: book.image.uri };
    if (book.images?.[0]) return { uri: book.images[0] };
    return require('../assets/placeholder-book.png');
  };

  const handleAddReview = async () => {
    if (!newReview.comment.trim()) {
      Alert.alert('Error', 'Please enter a review comment');
      return;
    }

    try {
      await DatabaseService.addBookReview(bookId, {
        rating: newReview.rating,
        comment: newReview.comment,
      });
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      
      // Fetch updated reviews
      const bookReviews = await DatabaseService.getBookReviews(bookId);
      setReviews(bookReviews);
    } catch (error) {
      Alert.alert('Error', 'Failed to add review');
    }
  };

  const handleContactSeller = () => {
    // Implement chat functionality
    Alert.alert('Coming Soon', 'Chat with seller feature will be available soon!');
  };

  const handleBuyNow = () => {
    if (!book) return;
    navigation.navigate('PaymentSelection', { book });
  };

  const handleAddToCart = async () => {
    if (!book) return;
    try {
      await DatabaseService.addToCart(book);
      Alert.alert('Success', 'Book added to cart!');
    } catch (error) {
      console.error('Error adding book to cart:', error);
      Alert.alert('Error', 'Failed to add book to cart.');
    }
  };

  const headerRight = (
    <View style={styles.headerRight}>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="share-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading || !book) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796b" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title={book?.title || 'Book Details'} 
        onBack={() => navigation.goBack()}
        rightComponent={headerRight}
      />
      <KeyboardAwareScrollView
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
      >
        {/* Book Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={getBookImage()} 
            style={styles.bookImage as ImageStyle}
          />
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>20% OFF</Text>
          </View>
        </View>

        {/* Book Info */}
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>by {book.author}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{book.price}</Text>
            <Text style={styles.originalPrice}>{book.originalPrice}</Text>
          </View>

          <View style={styles.conditionContainer}>
            <Text style={styles.conditionLabel}>Condition:</Text>
            <Text style={[
              styles.conditionText,
              book.condition === 'Like New' ? styles.conditionNew :
              book.condition === 'Good' ? styles.conditionGood :
              styles.conditionFair
            ]}>
              {book.condition}
            </Text>
          </View>

          <View style={styles.sellerInfo}>
            <View style={styles.sellerHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{book.sellerName.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.sellerName}>{book.sellerName}</Text>
                <Text style={styles.location}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  {book.location}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactSeller}>
              <Ionicons name="chatbubble-outline" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Contact Seller</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity onPress={() => setShowReviewForm(true)}>
              <Text style={styles.addReviewText}>Add Review</Text>
            </TouchableOpacity>
          </View>

          {showReviewForm && (
            <View style={styles.reviewForm}>
              <View style={styles.ratingInput}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setNewReview({ ...newReview, rating: star })}
                  >
                    <AntDesign
                      name={star <= newReview.rating ? "star" : "staro"}
                      size={24}
                      color="#FFD700"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reviewInput}
                placeholder="Write your review..."
                value={newReview.comment}
                onChangeText={(text) => setNewReview({ ...newReview, comment: text })}
                multiline
              />
              <View style={styles.reviewFormButtons}>
                <TouchableOpacity
                  style={[styles.reviewButton, styles.cancelButton]}
                  onPress={() => setShowReviewForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reviewButton, styles.submitButton]}
                  onPress={handleAddReview}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            data={reviews}
            renderItem={({ item }) => (
              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerAvatarText}>{item.userName.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.reviewerName}>{item.userName}</Text>
                      <View style={styles.reviewRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <AntDesign
                            key={star}
                            name={star <= item.rating ? "star" : "staro"}
                            size={12}
                            color="#FFD700"
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{item.date}</Text>
                </View>
                <Text style={styles.reviewComment}>{item.comment}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Suggested Books */}
        <View style={styles.suggestedSection}>
          <Text style={styles.sectionTitle}>Similar Books</Text>
          <FlatList
            data={suggestedBooks}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestedBookCard}
                onPress={() => navigation.push('BookDetails', { bookId: item.id })}
              >
                <Image 
                  source={{ uri: item.imageUrl }} 
                  style={styles.suggestedBookImage as ImageStyle}
                />
                <Text style={styles.suggestedBookTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.suggestedBookPrice}>{item.price}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price:</Text>
          <Text style={styles.price}>{book.price}</Text>
        </View>
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={[styles.footerButton, styles.addToCartButton]}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.footerButtonText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.buyNowButton]}
            onPress={handleBuyNow}
          >
            <Text style={styles.footerButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  imageContainer: {
    position: 'relative',
    height: hp('40%'),
    backgroundColor: '#fff',
  },
  bookImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  } as ImageStyle,
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 0,
    backgroundColor: '#00796b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bookInfo: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    marginTop: 8,
  },
  bookTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#00796b',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: wp('3.5%'),
    color: '#999',
    textDecorationLine: 'line-through',
  },
  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  conditionLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginRight: 8,
  },
  conditionText: {
    fontSize: wp('3.5%'),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  conditionNew: {
    backgroundColor: '#e0f2f1',
    color: '#00796b',
  },
  conditionGood: {
    backgroundColor: '#fff9c4',
    color: '#ffa000',
  },
  conditionFair: {
    backgroundColor: '#ffebee',
    color: '#e57373',
  },
  sellerInfo: {
    backgroundColor: '#f8f8f8',
    padding: wp('4%'),
    borderRadius: 8,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00796b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sellerName: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#333',
  },
  location: {
    fontSize: wp('3%'),
    color: '#666',
    marginTop: 2,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00796b',
    padding: wp('3%'),
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: wp('3.5%'),
    fontWeight: '500',
    marginLeft: 8,
  },
  reviewsSection: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333',
  },
  addReviewText: {
    color: '#00796b',
    fontSize: wp('3.5%'),
  },
  reviewForm: {
    backgroundColor: '#f8f8f8',
    padding: wp('4%'),
    borderRadius: 8,
    marginBottom: 16,
  },
  ratingInput: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: wp('3%'),
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  reviewFormButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  reviewButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  submitButton: {
    backgroundColor: '#00796b',
  },
  cancelButtonText: {
    color: '#666',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00796b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  reviewerAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reviewerName: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#333',
  },
  reviewRating: {
    flexDirection: 'row',
    marginTop: 2,
  },
  reviewDate: {
    fontSize: wp('2.8%'),
    color: '#999',
  },
  reviewComment: {
    fontSize: wp('3.5%'),
    color: '#666',
    lineHeight: 20,
  },
  suggestedSection: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    marginTop: 8,
  },
  suggestedBookCard: {
    width: wp('40%'),
    marginRight: wp('4%'),
  },
  suggestedBookImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  } as ImageStyle,
  suggestedBookTitle: {
    ...FONTS.body1,
    color: COLORS.text,
    padding: SIZES.padding,
    textAlign: 'center',
    fontWeight: '500' as const,
  } as TextStyle,
  suggestedBookPrice: {
    ...FONTS.h4,
    color: COLORS.primary,
    padding: SIZES.padding,
    textAlign: 'center',
    fontWeight: '700' as const,
  } as TextStyle,
  footer: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  priceLabel: {
    fontSize: wp('4%'),
    color: '#666',
  },
  price: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#00796b',
    marginLeft: 8,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp('3%'),
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('3%'),
    borderRadius: 8,
  },
  addToCartButton: {
    backgroundColor: '#4db6ac',
  },
  buyNowButton: {
    backgroundColor: '#00796b',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: wp('3.5%'),
    fontWeight: '500',
    marginLeft: 8,
  },
  wishlistButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00796b',
  },
  wishlistIcon: {
    color: '#00796b',
  },
});

export default BookDetails; 