import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useFetchUser } from '@/hooks/useFetchUser';
import { User } from '@/types/userTypes';
import { AuthContextType } from '@/types/authTypes';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const { user, loading, setUser, refetch } = useFetchUser(token);

  const handleSignOut = useCallback(async () => {
    await AsyncStorage.removeItem('authToken');
    setUser(null);
    setIsAuthed(false);
  }, [setUser]);

  const handleSuccess = useCallback(
    async (token: string) => {
      setToken(token);
      await AsyncStorage.setItem('authToken', token);
      setIsAuthed(true);
      refetch();
    },
    [refetch]
  );

  const handleError = useCallback(
    (error: Error) => {
      console.error('Authentication error:', error);
      handleSignOut();
    },
    [handleSignOut]
  );

  const { promptAsync } = useGoogleAuth(handleSuccess, handleError);

  const signInWithGoogle = useCallback(async () => {
    promptAsync();
  }, [promptAsync]);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const authToken = await AsyncStorage.getItem('authToken');
        if (authToken) {
          setToken(authToken);
          setIsAuthed(true);
          refetch();
        }
      } catch (error) {
        console.error('Failed to check auth state:', error);
      }
    };

    checkAuthState();
  }, [refetch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        signInWithGoogle,
        handleSignOut,
        isAuthed,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
