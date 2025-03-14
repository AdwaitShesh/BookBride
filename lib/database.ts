import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const BOOKS_KEY = '@books';
const REVIEWS_KEY = '@reviews';
const ADDRESSES_KEY = '@addresses';
const ORDERS_KEY = '@orders';
const CART_KEY = '@cart';
const USER_PROFILES_KEY = '@user_profiles';
const RECENTLY_ADDED_KEY = '@recently_added';
const WISHLIST_KEY = '@wishlist';

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  condition: 'Like New' | 'Good' | 'Fair';
  imageUrl: string;
  image?: { uri: string };
  images?: string[];
  sellerName: string;
  location: string;
  postedDate: string;
  category: 'Engineering' | 'Computer Science' | 'Electronics' | 'Mechanical' | 'Civil' | 'Chemical';
  description?: string;
  rating?: number;
  reviews?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string | null;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  createdAt: string;
}

export interface Order {
  id: string;
  bookId: string;
  userId: string;
  paymentMethod: 'cod' | 'upi' | 'card' | 'netbanking';
  address: Address;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  upiId?: string;
  createdAt: string;
  updatedAt: string;
}

// Update the cart storage key to be user-specific
const getCartStorageKey = async () => {
  return CART_KEY;
};

// Update the orders storage key to be user-specific
const getOrdersStorageKey = async () => {
  return ORDERS_KEY;
};

// Get the wishlist storage key for the current user
const getWishlistStorageKey = async () => {
  return WISHLIST_KEY;
};

export class DatabaseService {
  static async getCurrentUserId(): Promise<string> {
    // Return a default user ID since we're removing authentication
    return 'default_user';
  }

  static formatPrice(price: any): string {
    if (price === undefined || price === null || price === '') {
      return '₹0.00';
    }
    
    if (typeof price === 'string' && price.startsWith('₹')) {
      return price;
    }
    
    let numericPrice: number;
    if (typeof price === 'string') {
      numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
    } else {
      numericPrice = Number(price);
    }
    
    if (isNaN(numericPrice) || !isFinite(numericPrice)) {
      return '₹0.00';
    }
    
    return `₹${numericPrice.toFixed(2)}`;
  }

  static async getBooks(): Promise<Book[]> {
    try {
      const booksJson = await AsyncStorage.getItem(BOOKS_KEY);
      const books = booksJson ? JSON.parse(booksJson) : [];
      
      // Ensure all books have properly formatted prices
      return books.map(book => ({
        ...book,
        price: this.formatPrice(book.price),
        originalPrice: this.formatPrice(book.originalPrice || (book.price * 1.5))
      }));
    } catch (error) {
      console.error('Error getting books:', error);
      return [];
    }
  }

  static async addBook(bookData: Omit<Book, 'id' | 'postedDate'>): Promise<Book> {
    try {
      const books = await this.getBooks();
      const newBook = {
        ...bookData,
        id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        postedDate: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify([newBook, ...books]));
      
      // Update recently added books
      const recentBooks = await this.getRecentBooks();
      await AsyncStorage.setItem(RECENTLY_ADDED_KEY, JSON.stringify([newBook, ...recentBooks].slice(0, 10)));
      
      return newBook;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  }

  static async getRecentBooks(): Promise<Book[]> {
    try {
      const recentBooksStr = await AsyncStorage.getItem(RECENTLY_ADDED_KEY);
      if (!recentBooksStr) return [];
      return JSON.parse(recentBooksStr);
    } catch (error) {
      console.error('Error getting recent books:', error);
      return [];
    }
  }

  static async getFeaturedBooks(limit: number = 3): Promise<Book[]> {
    try {
      const books = await this.getBooks();
      return books.slice(0, limit);
    } catch (error) {
      console.error('Error getting featured books:', error);
      return [];
    }
  }

  static async getBookById(id: string): Promise<Book> {
    try {
      const books = await this.getBooks();
      const book = books.find(b => b.id === id);
      if (!book) throw new Error('Book not found');
      return {
        ...book,
        price: this.formatPrice(book.price),
        originalPrice: this.formatPrice(book.originalPrice || (book.price * 1.5))
      };
    } catch (error) {
      console.error('Error getting book by ID:', error);
      throw new Error('Failed to get book');
    }
  }

  static async getBookReviews(bookId: string): Promise<Review[]> {
    try {
      const reviewsJson = await AsyncStorage.getItem(REVIEWS_KEY);
      const allReviews: Review[] = reviewsJson ? JSON.parse(reviewsJson) : [];
      return allReviews
        .filter(review => review.bookId === bookId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting book reviews:', error);
      return [];
    }
  }

  static async addBookReview(bookId: string, review: { rating: number; comment: string }): Promise<void> {
    try {
      const reviewsJson = await AsyncStorage.getItem(REVIEWS_KEY);
      const allReviews: Review[] = reviewsJson ? JSON.parse(reviewsJson) : [];
      
      const newReview: Review = {
        id: Date.now().toString(),
        bookId,
        userId: 'current-user-id',
        userName: 'Current User',
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date().toISOString(),
      };

      allReviews.push(newReview);
      await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(allReviews));
    } catch (error) {
      console.error('Error adding book review:', error);
      throw error;
    }
  }

  static async getSuggestedBooks(currentBookId: string): Promise<Book[]> {
    try {
      const books = await this.getBooks();
      const currentBook = await this.getBookById(currentBookId);
      
      const suggestions = books
        .filter(book => {
          if (book.id === currentBookId) return false;
          
          const currentTitleWords = currentBook.title.toLowerCase().split(' ');
          const bookTitleWords = book.title.toLowerCase().split(' ');
          const hasSimilarTitle = currentTitleWords.some(word => 
            bookTitleWords.some(w => w.includes(word) || word.includes(w))
          );

          const currentAuthorWords = currentBook.author.toLowerCase().split(' ');
          const bookAuthorWords = book.author.toLowerCase().split(' ');
          const hasSimilarAuthor = currentAuthorWords.some(word => 
            bookAuthorWords.some(w => w.includes(word) || word.includes(w))
          );

          return hasSimilarTitle || hasSimilarAuthor;
        })
        .slice(0, 5);

      return suggestions;
    } catch (error) {
      console.error('Error getting suggested books:', error);
      return [];
    }
  }

  static async addToCart(book: Book): Promise<void> {
    try {
      const cartKey = await getCartStorageKey();
      const cartItems = await AsyncStorage.getItem(cartKey) || '[]';
      const cart = JSON.parse(cartItems);
      
      if (!cart.some((item: Book) => item.id === book.id)) {
        cart.push(book);
        await AsyncStorage.setItem(cartKey, JSON.stringify(cart));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw new Error('Failed to add to cart');
    }
  }

  static async getCartItems(): Promise<Book[]> {
    try {
      const cartKey = await getCartStorageKey();
      const cartItems = await AsyncStorage.getItem(cartKey) || '[]';
      return JSON.parse(cartItems);
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  }

  static async removeFromCart(bookId: string): Promise<void> {
    try {
      const cartKey = await getCartStorageKey();
      const cartItems = await AsyncStorage.getItem(cartKey) || '[]';
      const cart = JSON.parse(cartItems);
      const updatedCart = cart.filter((item: Book) => item.id !== bookId);
      await AsyncStorage.setItem(cartKey, JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw new Error('Failed to remove from cart');
    }
  }

  static async clearCart(): Promise<void> {
    try {
      const cartKey = await getCartStorageKey();
      await AsyncStorage.removeItem(cartKey);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  static async addToWishlist(book: Book): Promise<void> {
    try {
      const wishlistKey = await getWishlistStorageKey();
      const wishlistItems = await AsyncStorage.getItem(wishlistKey) || '[]';
      const wishlist = JSON.parse(wishlistItems);
      
      if (!wishlist.some((item: Book) => item.id === book.id)) {
        wishlist.push(book);
        await AsyncStorage.setItem(wishlistKey, JSON.stringify(wishlist));
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw new Error('Failed to add to wishlist');
    }
  }

  static async getWishlist(): Promise<Book[]> {
    try {
      const wishlistKey = await getWishlistStorageKey();
      const wishlistItems = await AsyncStorage.getItem(wishlistKey) || '[]';
      return JSON.parse(wishlistItems);
    } catch (error) {
      console.error('Error getting wishlist:', error);
      return [];
    }
  }

  static async removeFromWishlist(bookId: string): Promise<void> {
    try {
      const wishlistKey = await getWishlistStorageKey();
      const wishlistItems = await AsyncStorage.getItem(wishlistKey) || '[]';
      const wishlist = JSON.parse(wishlistItems);
      const updatedWishlist = wishlist.filter((item: Book) => item.id !== bookId);
      await AsyncStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw new Error('Failed to remove from wishlist');
    }
  }

  static async isInWishlist(bookId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.some(item => item.id === bookId);
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  }

  static async saveAddress(address: Omit<Address, 'id' | 'userId' | 'createdAt'>): Promise<Address> {
    try {
      const addressesJson = await AsyncStorage.getItem(ADDRESSES_KEY);
      const addresses: Address[] = addressesJson ? JSON.parse(addressesJson) : [];

      const newAddress: Address = {
        ...address,
        id: Date.now().toString(),
        userId: 'default_user',
        createdAt: new Date().toISOString(),
      };

      addresses.push(newAddress);
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
      return newAddress;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  }

  static async getAddresses(): Promise<Address[]> {
    try {
      const addressesJson = await AsyncStorage.getItem(ADDRESSES_KEY);
      const addresses: Address[] = addressesJson ? JSON.parse(addressesJson) : [];
      return addresses;
    } catch (error) {
      console.error('Error getting addresses:', error);
      return [];
    }
  }

  static async createOrder(order: Order): Promise<Order> {
    try {
      const ordersKey = await getOrdersStorageKey();
      const ordersJson = await AsyncStorage.getItem(ordersKey);
      const orders: Order[] = ordersJson ? JSON.parse(ordersJson) : [];

      const newOrder = {
        ...order,
        userId: 'default_user',
      };

      orders.push(newOrder);
      await AsyncStorage.setItem(ordersKey, JSON.stringify(orders));

      // Clear the cart after successful order
      await AsyncStorage.setItem(CART_KEY, JSON.stringify([]));

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  static async getOrders(): Promise<Order[]> {
    try {
      const ordersKey = await getOrdersStorageKey();
      const ordersJson = await AsyncStorage.getItem(ordersKey);
      return ordersJson ? JSON.parse(ordersJson) : [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const ordersKey = await getOrdersStorageKey();
      const ordersJson = await AsyncStorage.getItem(ordersKey);
      const orders: Order[] = ordersJson ? JSON.parse(ordersJson) : [];

      const orderIndex = orders.findIndex(order => order.id === orderId);
      if (orderIndex === -1) throw new Error('Order not found');

      orders[orderIndex] = {
        ...orders[orderIndex],
        status,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(ordersKey, JSON.stringify(orders));
      return orders[orderIndex];
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  static async getUserProfile(): Promise<UserProfile> {
    // Return a default user profile
    return {
      id: 'default_user',
      name: 'Guest User',
      email: 'guest@example.com',
      phone: '1234567890',
      address: '',
      avatar: null,
    };
  }

  static async updateUserProfile(profile: Omit<UserProfile, 'id'>): Promise<void> {
    try {
      const profiles = await AsyncStorage.getItem(USER_PROFILES_KEY) || '[]';
      const existingProfiles = JSON.parse(profiles);
      const updatedProfile = { ...profile, id: 'default_user' };
      
      const existingIndex = existingProfiles.findIndex((p: UserProfile) => p.id === 'default_user');
      if (existingIndex >= 0) {
        existingProfiles[existingIndex] = updatedProfile;
      } else {
        existingProfiles.push(updatedProfile);
      }

      await AsyncStorage.setItem(USER_PROFILES_KEY, JSON.stringify(existingProfiles));
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async getUserOrders(): Promise<Order[]> {
    try {
      const ordersKey = await getOrdersStorageKey();
      const ordersJson = await AsyncStorage.getItem(ordersKey);
      return ordersJson ? JSON.parse(ordersJson) : [];
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const ordersKey = await getOrdersStorageKey();
      const ordersJson = await AsyncStorage.getItem(ordersKey);
      const orders: Order[] = ordersJson ? JSON.parse(ordersJson) : [];
      
      return orders.find(order => order.id === orderId) || null;
    } catch (error) {
      console.error('Error getting order by id:', error);
      return null;
    }
  }

  static async getBooksByCategory(category: string): Promise<Book[]> {
    try {
      const books = await this.getBooks();
      if (category === 'All') {
        return books;
      }
      return books.filter(book => book.category === category);
    } catch (error) {
      console.error('Error getting books by category:', error);
      return [];
    }
  }
} 