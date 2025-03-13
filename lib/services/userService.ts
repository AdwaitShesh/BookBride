import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encode as base64Encode } from 'base-64';

const USERS_KEY = '@users';
const SESSIONS_KEY = '@sessions';
const REFRESH_TOKENS_KEY = '@refresh_tokens';
const VERIFICATION_TOKENS_KEY = '@verification_tokens';

export class UserService {
  private static generateToken(userId: string): string {
    const timestamp = Date.now();
    const payload = {
      userId,
      timestamp,
      exp: timestamp + 3600000 // 1 hour expiration
    };
    return base64Encode(JSON.stringify(payload));
  }

  private static generateRefreshToken(userId: string): string {
    const timestamp = Date.now();
    const payload = {
      userId,
      timestamp,
      exp: timestamp + 604800000 // 7 days expiration
    };
    return base64Encode(JSON.stringify(payload));
  }

  private static async getUsers() {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private static async getSessions() {
    const sessionsJson = await AsyncStorage.getItem(SESSIONS_KEY);
    return sessionsJson ? JSON.parse(sessionsJson) : [];
  }

  private static async getRefreshTokens() {
    const tokensJson = await AsyncStorage.getItem(REFRESH_TOKENS_KEY);
    return tokensJson ? JSON.parse(tokensJson) : [];
  }

  private static async getVerificationTokens() {
    const tokensJson = await AsyncStorage.getItem(VERIFICATION_TOKENS_KEY);
    return tokensJson ? JSON.parse(tokensJson) : [];
  }

  static async register(userData: {
    name: string;
    email: string;
    username: string;
    password: string;
    contact: string;
  }) {
    try {
      const users = await this.getUsers();
      
      // Check if user exists
      if (users.some(u => u.email === userData.email || u.username === userData.username)) {
        throw new Error('User with this email or username already exists');
      }

      // Hash password
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        userData.password
      );

      // Create user
      const userId = Crypto.randomUUID();
      const newUser = {
        id: userId,
        name: userData.name,
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        contact: userData.contact,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isVerified: false,
        role: 'USER'
      };

      // Save user
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));

      // Generate tokens
      const token = this.generateToken(userId);
      const refreshToken = this.generateRefreshToken(userId);

      // Save session
      const sessions = await this.getSessions();
      const newSession = {
        id: Crypto.randomUUID(),
        userId,
        token,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify([...sessions, newSession]));

      // Save refresh token
      const refreshTokens = await this.getRefreshTokens();
      const newRefreshToken = {
        id: Crypto.randomUUID(),
        userId,
        token: refreshToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 604800000).toISOString(),
        isRevoked: false
      };
      await AsyncStorage.setItem(REFRESH_TOKENS_KEY, JSON.stringify([...refreshTokens, newRefreshToken]));

      return {
        user: {
          id: userId,
          name: userData.name,
          email: userData.email,
          username: userData.username,
          contact: userData.contact,
          isVerified: false,
          role: 'USER'
        },
        token,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  }

  static async login(credentials: { username: string; password: string }) {
    try {
      const users = await this.getUsers();
      
      // Hash password
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        credentials.password
      );

      // Find user
      const user = users.find(u => 
        u.username === credentials.username && u.password === hashedPassword
      );

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const token = this.generateToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Save session
      const sessions = await this.getSessions();
      const newSession = {
        id: Crypto.randomUUID(),
        userId: user.id,
        token,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify([...sessions, newSession]));

      // Save refresh token
      const refreshTokens = await this.getRefreshTokens();
      const newRefreshToken = {
        id: Crypto.randomUUID(),
        userId: user.id,
        token: refreshToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 604800000).toISOString(),
        isRevoked: false
      };
      await AsyncStorage.setItem(REFRESH_TOKENS_KEY, JSON.stringify([...refreshTokens, newRefreshToken]));

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          contact: user.contact,
          isVerified: user.isVerified,
          role: user.role
        },
        token,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  }

  static async verifyEmail(token: string) {
    try {
      const verificationTokens = await this.getVerificationTokens();
      const users = await this.getUsers();

      const verificationToken = verificationTokens.find(t => 
        t.token === token && 
        t.type === 'EMAIL_VERIFICATION' && 
        new Date(t.expiresAt) > new Date()
      );

      if (!verificationToken) {
        throw new Error('Invalid or expired verification token');
      }

      // Update user
      const updatedUsers = users.map(user => {
        if (user.email === verificationToken.email) {
          return { ...user, isVerified: true };
        }
        return user;
      });

      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

      // Remove used token
      const remainingTokens = verificationTokens.filter(t => t.token !== token);
      await AsyncStorage.setItem(VERIFICATION_TOKENS_KEY, JSON.stringify(remainingTokens));

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async logout() {
    try {
      const sessions = await this.getSessions();
      const now = new Date().toISOString();
      
      // Expire all active sessions
      const updatedSessions = sessions.map(session => ({
        ...session,
        expiresAt: now
      }));

      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
      return true;
    } catch (error) {
      throw error;
    }
  }
} 