import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

class TokenService {
  private isWeb = Platform.OS === 'web';

  async getToken(): Promise<string | null> {
    try {
      if (this.isWeb) {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        return token;
      }

      const token = await SecureStore.getItemAsync(TOKEN_KEY);

      return token;
    } catch (error) {
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      if (this.isWeb) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        return;
      }

      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('failed to set token in secure store', error);
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      if (this.isWeb) {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        return refreshToken;
      }

      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      return refreshToken;
    } catch (error) {
      return null;
    }
  }

  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      if (this.isWeb) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        return;
      }

      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('failed to set refresh token in secure store', error);
    }
  }

  async clearTokens(): Promise<void> {
    try {
      if (this.isWeb) {
        await Promise.all([
          AsyncStorage.removeItem(TOKEN_KEY),
          AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        ]);
      } else {
        await Promise.all([
          SecureStore.deleteItemAsync(TOKEN_KEY),
          SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
          AsyncStorage.removeItem(TOKEN_KEY),
          AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        ]);
      }
    } catch (error) {
      throw error;
    }
  }
}

export const tokenService = new TokenService();
