import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export const fetchWithAuth = async (url, options = {}, navigation) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      // Redirect to sign-in screen if token is missing
      navigation.replace('auth/SignInScreen');
      return;
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Redirect to sign-in screen if token is invalid or expired
      await AsyncStorage.removeItem('token');
      navigation.replace('auth/SignInScreen');
      return;
    }

    return response;
  } catch (error) {
    console.error('Fetch with auth failed', error);
    throw error;
  }
};

