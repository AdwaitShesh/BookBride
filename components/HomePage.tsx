import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  AntDesign,
} from '@expo/vector-icons';

type User = {
  name: string;
  email: string;
  username: string;
};

type HomePageProps = {
  user: User;
};

const HomePage = ({ user }: HomePageProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Engineering', icon: 'engineering', count: '2.5k+' },
    { name: 'Computer Science', icon: 'laptop-code', count: '1.8k+' },
    { name: 'Electronics', icon: 'microchip', count: '1.2k+' },
    { name: 'Mechanical', icon: 'tools', count: '900+' },
  ];

  const featuredBooks = [
    {
      id: 1,
      title: 'Data Structures and Algorithms',
      author: 'Thomas H. Cormen',
      price: '₹450',
      condition: 'Like New',
      image: require('../assets/book1.jpg'),
    },
    {
      id: 2,
      title: 'Computer Networks',
      author: 'Andrew S. Tanenbaum',
      price: '₹380',
      condition: 'Good',
      image: require('../assets/book2.jpg'),
    },
    {
      id: 3,
      title: 'Digital Electronics',
      author: 'Morris Mano',
      price: '₹290',
      condition: 'Fair',
      image: require('../assets/book3.jpg'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity>
            <Ionicons name="menu" size={28} color="#00796b" />
          </TouchableOpacity>
          <Text style={styles.logo}>BookBride</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#00796b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.userButton}>
            <Ionicons name="person-circle-outline" size={24} color="#00796b" />
            <Text style={styles.username}>{user?.name || 'User'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for books..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryCard}>
              <FontAwesome5 name={category.icon} size={24} color="#00796b" />
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>{category.count} books</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Books */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Books</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredBooks.map((book) => (
            <TouchableOpacity key={book.id} style={styles.bookCard}>
              <Image source={book.image} style={styles.bookImage} />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{book.title}</Text>
                <Text style={styles.bookAuthor}>{book.author}</Text>
                <View style={styles.bookDetails}>
                  <Text style={styles.bookPrice}>{book.price}</Text>
                  <Text style={styles.bookCondition}>{book.condition}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <AntDesign name="plus" size={24} color="#fff" />
          <Text style={styles.actionText}>Sell Book</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="bookmark-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Wishlist</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 16,
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    marginLeft: 8,
    color: '#00796b',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  categoryCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginRight: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: 120,
    elevation: 2,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 16,
    width: 180,
    elevation: 2,
  },
  bookImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bookDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00796b',
  },
  bookCondition: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e0f2f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#00796b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default HomePage; 