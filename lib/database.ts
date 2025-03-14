import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKS_KEY = '@books';

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
}

export const DatabaseService = {
  async getBooks(): Promise<Book[]> {
    try {
      const booksJson = await AsyncStorage.getItem(BOOKS_KEY);
      return booksJson ? JSON.parse(booksJson) : [];
    } catch (error) {
      console.error('Error getting books:', error);
      return [];
    }
  },

  async addBook(book: Omit<Book, 'id' | 'postedDate'>): Promise<Book> {
    try {
      const books = await this.getBooks();
      const newBook: Book = {
        ...book,
        id: Date.now().toString(),
        postedDate: new Date().toISOString(),
      };
      books.push(newBook);
      await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
      return newBook;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  },

  async getRecentBooks(limit: number = 3): Promise<Book[]> {
    try {
      const books = await this.getBooks();
      return books
        .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
        .slice(0, limit);
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
}; 