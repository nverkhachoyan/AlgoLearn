import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

class TokenService {
  private isWeb = Platform.OS === "web";

  async getToken(): Promise<string | null> {
    try {
      // On web, only use AsyncStorage
      if (this.isWeb) {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        console.debug(
          "[TokenService] Token from AsyncStorage (web):",
          token ? "exists" : "null"
        );
        return token;
      }

      // For native platforms, try SecureStore first
      let token = await SecureStore.getItemAsync(TOKEN_KEY);
      console.debug(
        "[TokenService] Token from SecureStore:",
        token ? "exists" : "null"
      );

      // If not in SecureStore, try AsyncStorage
      if (!token) {
        token = await AsyncStorage.getItem(TOKEN_KEY);
        console.debug(
          "[TokenService] Token from AsyncStorage:",
          token ? "exists" : "null"
        );

        // If found in AsyncStorage, migrate it to SecureStore
        if (token) {
          console.debug("[TokenService] Migrating token to SecureStore");
          await this.setToken(token);
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      }

      return token;
    } catch (error) {
      console.error("[TokenService] Error getting token:", error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      // On web, only use AsyncStorage
      if (this.isWeb) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        console.debug("[TokenService] Token saved to AsyncStorage (web)");
        return;
      }

      // For native platforms, try SecureStore first
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      console.debug("[TokenService] Token saved to SecureStore");
    } catch (error) {
      console.error("[TokenService] Error saving token:", error);
      // Fallback to AsyncStorage if SecureStore fails
      try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        console.debug("[TokenService] Token saved to AsyncStorage (fallback)");
      } catch (fallbackError) {
        console.error(
          "[TokenService] Error saving token to AsyncStorage:",
          fallbackError
        );
        throw fallbackError;
      }
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      // On web, only use AsyncStorage
      if (this.isWeb) {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        console.debug(
          "[TokenService] Refresh token from AsyncStorage (web):",
          refreshToken ? "exists" : "null"
        );
        return refreshToken;
      }

      // For native platforms, try SecureStore first
      let refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      console.debug(
        "[TokenService] Refresh token from SecureStore:",
        refreshToken ? "exists" : "null"
      );

      // If not in SecureStore, try AsyncStorage
      if (!refreshToken) {
        refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        console.debug(
          "[TokenService] Refresh token from AsyncStorage:",
          refreshToken ? "exists" : "null"
        );

        // If found in AsyncStorage, migrate it to SecureStore
        if (refreshToken) {
          console.debug(
            "[TokenService] Migrating refresh token to SecureStore"
          );
          await this.setRefreshToken(refreshToken);
          await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }

      return refreshToken;
    } catch (error) {
      console.error("[TokenService] Error getting refresh token:", error);
      return null;
    }
  }

  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      // On web, only use AsyncStorage
      if (this.isWeb) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        console.debug(
          "[TokenService] Refresh token saved to AsyncStorage (web)"
        );
        return;
      }

      // For native platforms, try SecureStore first
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      console.debug("[TokenService] Refresh token saved to SecureStore");
    } catch (error) {
      console.error(
        "[TokenService] Error saving refresh token to SecureStore:",
        error
      );
      // Fallback to AsyncStorage if SecureStore fails
      try {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        console.debug(
          "[TokenService] Refresh token saved to AsyncStorage (fallback)"
        );
      } catch (fallbackError) {
        console.error(
          "[TokenService] Error saving refresh token to AsyncStorage:",
          fallbackError
        );
        throw fallbackError;
      }
    }
  }

  async clearTokens(): Promise<void> {
    try {
      console.debug("[TokenService] Clearing tokens...");
      if (this.isWeb) {
        // On web, only clear AsyncStorage
        await Promise.all([
          AsyncStorage.removeItem(TOKEN_KEY),
          AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        ]);
        console.debug("[TokenService] Tokens cleared from AsyncStorage (web)");
      } else {
        // For native platforms, clear both storages
        await Promise.all([
          SecureStore.deleteItemAsync(TOKEN_KEY),
          SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
          AsyncStorage.removeItem(TOKEN_KEY),
          AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        ]);
        console.debug("[TokenService] Tokens cleared from both storages");
      }
    } catch (error) {
      console.error("[TokenService] Error clearing tokens:", error);
      throw error;
    }
  }
}

export const tokenService = new TokenService();
