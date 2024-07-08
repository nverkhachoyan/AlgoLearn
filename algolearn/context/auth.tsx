import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export type User = {
  name: string;
  email: string;
  token: string | null;
} | null;

export type AuthContextType = {
  user: User;
  setUser: (
    user: {
      name: string;
      email: string;
      token: string | null;
    } | null
  ) => void;
  handleSignOut: () => void;
  signInWithGoogle: () => Promise<void>;
  isAuthed: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [user, setUser] = useState<User>(null);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('authToken');
    setUser(null);
    setIsAuthed(false);
  };

  console.log('User', user);
  console.log('isAuthed', isAuthed);

  const handleSignIn = async (token: string) => {
    await AsyncStorage.setItem('authToken', token);
    setUser({
      name: 'Nverig',
      email: 'gmil',
      token: token,
    });
    setIsAuthed(true);
  };

  const handleSuccess = async (token: string) => {
    setUser({
      name: 'Nverik',
      email: 'gmailnvo',
      token: token,
    });
    await AsyncStorage.setItem('authToken', token);
    setIsAuthed(true);
  };

  const handleError = (error: Error) => {
    console.error('Authentication error:', error);
    handleSignOut();
  };

  const { promptAsync } = useGoogleAuth(handleSuccess, handleError);

  const signInWithGoogle = async () => {
    promptAsync();
  };

  useEffect(() => {
    const checkAuthState = async () => {
      const authToken = await AsyncStorage.getItem('authToken');
      if (authToken) {
        await AsyncStorage.setItem('authToken', authToken);
        setUser({
          name: 'Nverik',
          email: 'gmailnvo',
          token: authToken,
        });
        setIsAuthed(true);
      }
      setLoading(false);
    };

    checkAuthState();
  }, []);

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
