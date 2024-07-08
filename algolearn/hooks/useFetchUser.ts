import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/userTypes';

export const useFetchUser = (token: string | null) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch('https://algolearn.app/user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const { data } = await response.json();
      setUser({ ...data, token });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, setUser, loading, refetch: fetchUser };
};
