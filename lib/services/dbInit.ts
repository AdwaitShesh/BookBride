import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@users';
const SESSIONS_KEY = '@sessions';
const REFRESH_TOKENS_KEY = '@refresh_tokens';
const VERIFICATION_TOKENS_KEY = '@verification_tokens';

export async function initDatabase() {
  try {
    // Initialize empty arrays for all storage keys if they don't exist
    const keys = [USERS_KEY, SESSIONS_KEY, REFRESH_TOKENS_KEY, VERIFICATION_TOKENS_KEY];
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        await AsyncStorage.setItem(key, JSON.stringify([]));
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  }
} 