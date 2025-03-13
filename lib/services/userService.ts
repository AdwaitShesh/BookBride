import * as Crypto from 'expo-crypto';
import api, { setAuthToken } from './apiService';

export class UserService {
  static async register(userData: {
    name: string;
    email: string;
    username: string;
    password: string;
    contact: string;
  }) {
    try {
      // Hash password before sending
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        userData.password
      );

      const response = await api.post('/auth/register', {
        ...userData,
        password: hashedPassword
      });

      const { token, refreshToken } = response.data;
      setAuthToken(token);

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw error;
    }
  }

  static async login(credentials: { username: string; password: string }) {
    try {
      // Hash password before sending
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        credentials.password
      );

      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: hashedPassword
      });

      const { token, refreshToken } = response.data;
      setAuthToken(token);

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw error;
    }
  }

  static async verifyEmail(token: string) {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data.success;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Email verification failed');
      }
      throw error;
    }
  }

  static async refreshToken(refreshToken: string) {
    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      setAuthToken(newToken);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Token refresh failed');
      }
      throw error;
    }
  }

  static async logout() {
    try {
      await api.post('/auth/logout');
      setAuthToken(null);
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Logout failed');
      }
      throw error;
    }
  }
} 