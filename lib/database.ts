import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKS_KEY = '@books';
const REVIEWS_KEY = '@reviews';
const ADDRESSES_KEY = '@addresses';
const ORDERS_KEY = '@orders';
const CART_KEY = '@cart';
const USER_PROFILES_KEY = '@user_profiles';
const RECENTLY_ADDED_KEY = '@recently_added';

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  condition: 'Like New' | 'Good' | 'Fair';
  imageUrl: string;
  sellerName: string;
  location: string;
  postedDate: string;
  category: 'Engineering' | 'Computer Science' | 'Electronics' | 'Mechanical' | 'Civil' | 'Chemical';
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

export const DatabaseService = {
  async getCurrentUserId(): Promise<string | null> {
    try {
      // For development, return a temporary user ID
      return 'temp-user-123';
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  },

  async getBooks(): Promise<Book[]> {
    try {
      const booksJson = await AsyncStorage.getItem(BOOKS_KEY);
      return booksJson ? JSON.parse(booksJson) : [];
    } catch (error) {
      console.error('Error getting books:', error);
      return [];
    }
  },

  async addBook(bookData: Omit<Book, 'id' | 'postedDate'>): Promise<Book> {
    try {
      const books = await this.getBooks();
      const newBook = {
        ...bookData,
        id: Date.now().toString(),
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
  },

  async getRecentBooks(): Promise<Book[]> {
    try {
      const recentBooksStr = await AsyncStorage.getItem(RECENTLY_ADDED_KEY);
      if (!recentBooksStr) return [];
      return JSON.parse(recentBooksStr);
    } catch (error) {
      console.error('Error getting recent books:', error);
      return [];
    }
  },

  async getFeaturedBooks(limit: number = 3): Promise<Book[]> {
    try {
      const books = await this.getBooks();
      return books.slice(0, limit);
    } catch (error) {
      console.error('Error getting featured books:', error);
      return [];
    }
  },

  async getBookById(id: string): Promise<Book> {
    try {
      const books = await this.getBooks();
      const book = books.find(b => b.id === id);
      if (!book) {
        throw new Error('Book not found');
      }
      return book;
    } catch (error) {
      console.error('Error getting book by id:', error);
      throw error;
    }
  },

  async getBookReviews(bookId: string): Promise<Review[]> {
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
  },

  async addBookReview(bookId: string, review: { rating: number; comment: string }): Promise<void> {
    try {
      const reviewsJson = await AsyncStorage.getItem(REVIEWS_KEY);
      const allReviews: Review[] = reviewsJson ? JSON.parse(reviewsJson) : [];
      
      // In a real app, you would get the current user's info from auth context
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
  },

  async getSuggestedBooks(currentBookId: string): Promise<Book[]> {
    try {
      const books = await this.getBooks();
      const currentBook = await this.getBookById(currentBookId);
      
      // Get books with similar titles or authors, excluding the current book
      const suggestions = books
        .filter(book => {
          if (book.id === currentBookId) return false;
          
          // Check for similar titles (first word match)
          const currentTitleWords = currentBook.title.toLowerCase().split(' ');
          const bookTitleWords = book.title.toLowerCase().split(' ');
          const hasSimilarTitle = currentTitleWords.some(word => 
            bookTitleWords.some(w => w.includes(word) || word.includes(w))
          );

          // Check for similar authors (first word match)
          const currentAuthorWords = currentBook.author.toLowerCase().split(' ');
          const bookAuthorWords = book.author.toLowerCase().split(' ');
          const hasSimilarAuthor = currentAuthorWords.some(word => 
            bookAuthorWords.some(w => w.includes(word) || word.includes(w))
          );

          return hasSimilarTitle || hasSimilarAuthor;
        })
        .slice(0, 5); // Limit to 5 suggestions

      return suggestions;
    } catch (error) {
      console.error('Error getting suggested books:', error);
      return [];
    }
  },

  async saveAddress(address: Omit<Address, 'id' | 'userId' | 'createdAt'>): Promise<Address> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const addressesJson = await AsyncStorage.getItem(ADDRESSES_KEY);
      const addresses: Address[] = addressesJson ? JSON.parse(addressesJson) : [];

      const newAddress: Address = {
        ...address,
        id: Date.now().toString(),
        userId,
        createdAt: new Date().toISOString(),
      };

      addresses.push(newAddress);
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
      return newAddress;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  },

  async getAddresses(): Promise<Address[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const addressesJson = await AsyncStorage.getItem(ADDRESSES_KEY);
      const addresses: Address[] = addressesJson ? JSON.parse(addressesJson) : [];
      
      return addresses
        .filter(address => address.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting addresses:', error);
      throw error;
    }
  },

  async createOrder(orderData: {
    bookId: string;
    paymentMethod: Order['paymentMethod'];
    address: Address;
    status: Order['status'];
    upiId?: string;
  }): Promise<Order> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const ordersJson = await AsyncStorage.getItem(ORDERS_KEY);
      const orders: Order[] = ordersJson ? JSON.parse(ordersJson) : [];

      const newOrder: Order = {
        ...orderData,
        id: Date.now().toString(),
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      orders.push(newOrder);
      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async getOrders(): Promise<Order[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const ordersJson = await AsyncStorage.getItem(ORDERS_KEY);
      const orders: Order[] = ordersJson ? JSON.parse(ordersJson) : [];

      return orders
        .filter(order => order.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const ordersJson = await AsyncStorage.getItem(ORDERS_KEY);
      const orders: Order[] = ordersJson ? JSON.parse(ordersJson) : [];

      const orderIndex = orders.findIndex(order => order.id === orderId && order.userId === userId);
      if (orderIndex === -1) throw new Error('Order not found');

      orders[orderIndex] = {
        ...orders[orderIndex],
        status,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return orders[orderIndex];
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  async getCartItems(): Promise<Book[]> {
    try {
      const cartJson = await AsyncStorage.getItem(CART_KEY);
      return cartJson ? JSON.parse(cartJson) : [];
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  },

  async addToCart(book: Book): Promise<void> {
    try {
      const cartItems = await this.getCartItems();
      cartItems.push(book);
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  async removeFromCart(bookId: string): Promise<void> {
    try {
      const cartItems = await this.getCartItems();
      const updatedCart = cartItems.filter(item => item.id !== bookId);
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  async clearCart(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CART_KEY);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const profilesJson = await AsyncStorage.getItem(USER_PROFILES_KEY);
      const profiles: UserProfile[] = profilesJson ? JSON.parse(profilesJson) : [];
      return profiles.find(profile => profile.id === userId) || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  async updateUserProfile(profile: Omit<UserProfile, 'id'>): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const profilesJson = await AsyncStorage.getItem(USER_PROFILES_KEY);
      const profiles: UserProfile[] = profilesJson ? JSON.parse(profilesJson) : [];
      
      const existingProfileIndex = profiles.findIndex(p => p.id === userId);
      const updatedProfile: UserProfile = { ...profile, id: userId };

      if (existingProfileIndex >= 0) {
        profiles[existingProfileIndex] = updatedProfile;
      } else {
        profiles.push(updatedProfile);
      }

      await AsyncStorage.setItem(USER_PROFILES_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async getUserOrders(): Promise<Order[]> {
    return this.getOrders(); // We already have this function, just create an alias for it
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const ordersJson = await AsyncStorage.getItem(ORDERS_KEY);
      const orders: Order[] = ordersJson ? JSON.parse(ordersJson) : [];
      
      return orders.find(order => order.id === orderId && order.userId === userId) || null;
    } catch (error) {
      console.error('Error getting order by id:', error);
      return null;
    }
  },

  async getBooksByCategory(category: string): Promise<Book[]> {
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
  },
}; 