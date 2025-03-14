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
  StatusBar,
  ImageBackground,
  RefreshControl,
  Platform,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  AntDesign,
  Feather,
  MaterialIcons,
  Entypo,
} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { DatabaseService, Book } from '../lib/database';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  SellBook: undefined;
  BookDetails: { bookId: string };
  Cart: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

type User = {
  name: string;
  email: string;
  username: string;
};

type HomePageProps = {
  user: User;
};

type BookItem = {
  id: string;
  title: string;
  author: string;
  price: string;
  originalPrice: string;
  condition: 'Like New' | 'Good' | 'Fair';
  image: any;
  rating: number;
  reviews: number;
  seller: string;
  location: string;
  postedDate: string;
};

type CategoryItem = {
  name: string;
  icon: string;
  count: string;
};

const HomePage = ({ user }: HomePageProps) => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [recentlyAddedBooks, setRecentlyAddedBooks] = useState<BookItem[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<BookItem[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBooks();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchBooks = async () => {
    try {
      const [recentBooks, featured] = await Promise.all([
        DatabaseService.getRecentBooks(),
        DatabaseService.getFeaturedBooks(),
      ]);

      setRecentlyAddedBooks(recentBooks.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        price: `₹${book.price}`,
        originalPrice: `₹${book.price * 1.5}`,
        condition: book.condition,
        image: { uri: book.imageUrl },
        rating: 4.5,
        reviews: 0,
        seller: book.sellerName,
        location: book.location,
        postedDate: formatPostedDate(book.postedDate),
      })));

      setFeaturedBooks(featured.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        price: `₹${book.price}`,
        originalPrice: `₹${book.price * 1.5}`,
        condition: book.condition,
        image: { uri: book.imageUrl },
        rating: 4.5,
        reviews: 0,
        seller: book.sellerName,
        location: book.location,
        postedDate: 'Just now',
      })));
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const formatPostedDate = (dateString: string) => {
    const postedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        return 'Just now';
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    }
    return `${diffDays} days ago`;
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchBooks().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const handleSellBook = () => {
    navigation.navigate('SellBook');
  };

  const categories: CategoryItem[] = [
    { name: 'All', icon: 'book', count: '5k+' },
    { name: 'Engineering', icon: 'cogs', count: '2.5k+' },
    { name: 'Computer Science', icon: 'laptop-code', count: '1.8k+' },
    { name: 'Electronics', icon: 'microchip', count: '1.2k+' },
    { name: 'Mechanical', icon: 'tools', count: '900+' },
    { name: 'Civil', icon: 'hard-hat', count: '750+' },
    { name: 'Chemical', icon: 'flask', count: '600+' },
  ];

  const renderCategoryItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity 
      style={[
        styles.categoryCard, 
        activeCategory === item.name && styles.activeCategoryCard
      ]}
      onPress={() => setActiveCategory(item.name)}
    >
      <FontAwesome5 
        name={item.icon} 
        size={24} 
        solid
        color={activeCategory === item.name ? "#fff" : "#00796b"} 
      />
      <Text style={[
        styles.categoryName,
        activeCategory === item.name && styles.activeCategoryText
      ]}>
        {item.name}
      </Text>
      <Text style={[
        styles.categoryCount,
        activeCategory === item.name && styles.activeCategoryText
      ]}>
        {item.count} books
      </Text>
    </TouchableOpacity>
  );

  const renderBookCard = (book: BookItem) => (
    <TouchableOpacity 
      key={book.id} 
      style={styles.bookCard}
      onPress={() => navigation.navigate('BookDetails', { bookId: book.id })}
    >
      <View style={styles.bookImageContainer}>
        <Image source={book.image} style={styles.bookImage} />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {Math.round((1 - parseInt(book.price.substring(1)) / parseInt(book.originalPrice.substring(1))) * 100)}% OFF
          </Text>
        </View>
        <TouchableOpacity style={styles.wishlistButton}>
          <AntDesign name="heart" size={18} color="#00796b" />
        </TouchableOpacity>
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
        <View style={styles.bookMeta}>
          <Text style={styles.bookPrice}>{book.price}</Text>
          <Text style={styles.bookOriginalPrice}>{book.originalPrice}</Text>
        </View>
        <View style={styles.bookFooter}>
          <View style={styles.ratingContainer}>
            <AntDesign name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{book.rating}</Text>
            <Text style={styles.reviewsText}>({book.reviews})</Text>
          </View>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={12} color="#666" />
            {book.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="#00796b" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#00796b" />
            <Text style={styles.logo}>BookBride</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart-outline" size={24} color="#00796b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#00796b" />
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00796b"]} />
        }
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <ImageBackground
            source={require('../assets/book1.jpg')}
            style={styles.bannerImage}
            imageStyle={{ borderRadius: 12, opacity: 0.7 }}
          >
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerTitle}>Engineering Books Marketplace</Text>
              <Text style={styles.bannerSubtitle}>Buy and sell used engineering textbooks</Text>
              <TouchableOpacity style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>Explore Now</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
            placeholder="Search for books, authors, or categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
            placeholderTextColor="#999"
        />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={20} color="#00796b" />
          </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.section}>
          <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
      </View>

      {/* Featured Books */}
      <View style={styles.section}>
          <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Books</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.booksScrollView}>
            {featuredBooks.map(renderBookCard)}
          </ScrollView>
        </View>

        {/* Special Offers */}
        <TouchableOpacity style={styles.offerBanner}>
          <View style={styles.offerContent}>
            <MaterialIcons name="local-offer" size={24} color="#fff" />
            <View style={styles.offerTextContainer}>
              <Text style={styles.offerTitle}>Special Offer!</Text>
              <Text style={styles.offerDescription}>Get 10% off on your first purchase</Text>
                </View>
              </View>
          <View style={styles.offerButton}>
            <Text style={styles.offerButtonText}>Claim</Text>
          </View>
        </TouchableOpacity>

        {/* Recently Added */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.booksScrollView}>
            {recentlyAddedBooks.map(renderBookCard)}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSellBook}>
          <AntDesign name="plus" size={24} color="#fff" />
          <Text style={styles.actionText}>Sell Book</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryActionButton]}>
          <MaterialCommunityIcons name="bookmark-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Wishlist</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 5,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00796b',
    marginLeft: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 16,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  badge: {
    backgroundColor: '#00796b',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroBanner: {
    margin: wp('4%'),
    height: hp('20%'),
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: wp('5%'),
    height: '100%',
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: wp('3.5%'),
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: '#00796b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: wp('4%'),
    padding: wp('3%'),
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: wp('3.8%'),
    color: '#333',
  },
  filterButton: {
    padding: 5,
  },
  section: {
    padding: wp('4%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#00796b',
    fontWeight: '500',
  },
  categoriesList: {
    paddingRight: wp('4%'),
  },
  categoryCard: {
    backgroundColor: '#fff',
    padding: wp('3%'),
    marginRight: wp('3%'),
    borderRadius: 8,
    alignItems: 'center',
    width: wp('25%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeCategoryCard: {
    backgroundColor: '#00796b',
  },
  categoryName: {
    marginTop: 8,
    fontSize: wp('3.2%'),
    fontWeight: '500',
    textAlign: 'center',
  },
  activeCategoryText: {
    color: '#fff',
  },
  categoryCount: {
    fontSize: wp('2.8%'),
    color: '#666',
    marginTop: 4,
  },
  booksScrollView: {
    paddingRight: wp('4%'),
  },
  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: wp('4%'),
    width: wp('42%'),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  bookImageContainer: {
    position: 'relative',
  },
  bookImage: {
    width: '100%',
    height: hp('20%'),
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 0,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: wp('2.8%'),
    fontWeight: 'bold',
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 6,
    borderRadius: 20,
  },
  bookInfo: {
    padding: wp('3%'),
  },
  bookTitle: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  bookAuthor: {
    fontSize: wp('3%'),
    color: '#666',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: wp('2.8%'),
    color: '#666',
    marginLeft: 4,
  },
  bookDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookPrice: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#00796b',
  },
  originalPrice: {
    fontSize: wp('2.8%'),
    color: '#999',
    textDecorationLine: 'line-through',
  },
  bookCondition: {
    fontSize: wp('2.5%'),
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sellerText: {
    fontSize: wp('2.5%'),
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
  },
  locationText: {
    fontSize: wp('2.5%'),
    color: '#666',
    marginLeft: 4,
  },
  offerBanner: {
    backgroundColor: '#00796b',
    margin: wp('4%'),
    borderRadius: 8,
    padding: wp('3%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  offerTextContainer: {
    marginLeft: 12,
  },
  offerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp('3.8%'),
  },
  offerDescription: {
    color: '#e0f2f1',
    fontSize: wp('3%'),
  },
  offerButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  offerButtonText: {
    color: '#00796b',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: wp('4%'),
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginTop: hp('2%'),
    marginBottom: hp('10%'),
  },
  actionButton: {
    backgroundColor: '#00796b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 8,
  },
  secondaryActionButton: {
    backgroundColor: '#4db6ac',
  },
  actionText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
    fontSize: wp('3.5%'),
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookOriginalPrice: {
    fontSize: wp('3%'),
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  bookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewsText: {
    fontSize: wp('2.8%'),
    color: '#666',
    marginLeft: 4,
  },
  location: {
    fontSize: wp('2.8%'),
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HomePage; 