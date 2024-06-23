import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStorageState } from '../hooks/useStorageState';
import { apiFetch } from '../utils/api';

const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (username: string, email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<boolean>;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: async (): Promise<string | null> => Promise.resolve(null),
  signUp: async (): Promise<string | null> => Promise.resolve(null),
  signOut: (): Promise<boolean> => Promise.resolve(false),
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setSession(token);
    };
    checkToken();
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    try {
      if (email.length < 3) {
        return 'Username must be at least 3 characters';
      }
      if (password.length < 8) {
        return 'Password must be at least 8 characters';
      }

      const res = await apiFetch('/user/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.data.status === "error") {
        return res.data.message;
      }

      await AsyncStorage.setItem('token', res.data.token);
      setSession(res.data.token);
      console.log('Authentication Successful');
      return null;
    } catch (error: any) {
      setSession(null);
      console.log('Authentication Failed:', error);
      return error.message;
    }
  };

  const signUp = async (username: string, email: string, password: string): Promise<string | null> => {
    try {
      if (username.length < 3) {
        return 'Username must be at least 3 characters';
      }
      if (password.length < 8) {
        return 'Password must be at least 8 characters';
      }

      const res = await apiFetch('/user/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });

      if (res.status === "error") {
        return res.data.message;
      }

      await AsyncStorage.setItem('token', res.data.token);
      setSession(res.data.token);
      return null;
    } catch (error: any) {
      console.log(error);
      setSession(null);
      return error.message;
    }
  };

  const signOut = async (): Promise<boolean> => {
    await AsyncStorage.removeItem('token');
    setSession(null);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        session,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}
