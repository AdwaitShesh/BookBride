import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BookItem } from '../types';
import CustomHeader from '../components/CustomHeader';

type RouteParams = {
  title: string;
  books: BookItem[];
  type: 'recent' | 'featured';
};

const AllBooksScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute();
  const { title, books, type } = route.params as RouteParams;

  const renderBook = ({ item }: { item: BookItem }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => navigation.navigate('BookDetails', { bookId: item.id })}
    >
      <View style={styles.bookImageContainer}>
        <Image source={item.image} style={styles.bookImage} />
        {type === 'recent' && (
          <View style={styles.timeStampBadge}>
            <Text style={styles.timeStampText}>{item.postedDate}</Text>
          </View>
        )}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {Math.round((1 - parseInt(item.price.substring(1)) / parseInt(item.originalPrice.substring(1))) * 100)}% OFF
          </Text>
        </View>
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
        <View style={styles.bookMeta}>
          <Text style={styles.bookPrice}>{item.price}</Text>
          <Text style={styles.bookOriginalPrice}>{item.originalPrice}</Text>
        </View>
        <View style={styles.bookFooter}>
          <View style={styles.ratingContainer}>
            <AntDesign name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews})</Text>
          </View>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={12} color="#666" />
            {item.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title={title} 
        onBack={() => navigation.goBack()} 
      />
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.booksList}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  booksList: {
    padding: wp('2%'),
  },
  bookCard: {
    flex: 1,
    margin: wp('2%'),
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  bookImageContainer: {
    width: '100%',
    height: hp('25%'),
    position: 'relative',
  },
  bookImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  timeStampBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 121, 107, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeStampText: {
    color: '#fff',
    fontSize: wp('2.8%'),
    fontWeight: '500',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00796b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: wp('2.8%'),
    fontWeight: '500',
  },
  bookInfo: {
    padding: wp('3%'),
  },
  bookTitle: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: wp('3%'),
    color: '#666',
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookPrice: {
    fontSize: wp('3.8%'),
    fontWeight: 'bold',
    color: '#00796b',
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: wp('2.8%'),
    color: '#666',
    marginLeft: 4,
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

export default AllBooksScreen; 