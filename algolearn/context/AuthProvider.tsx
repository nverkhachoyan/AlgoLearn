import React, { useEffect, useCallback } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAuth } from '@/hooks/useAuth';
import { AuthContextType } from '@/types/authTypes';
import { createContext, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    token,
    isAuthed,
    deleteAccountMutate,
    signOut,
    handleSuccess,
    checkAuthState,
    doesEmailExist,
    checkEmailMutate,
    signInMutate,
  } = useAuth();

  const handleError = useCallback(
    (error: Error) => {
      console.error('Authentication error:', error);
      signOut();
    },
    [signOut]
  );

  const { promptAsync } = useGoogleAuth(handleSuccess, handleError);

  const signInWithGoogle = useCallback(async () => {
    await promptAsync();
  }, [promptAsync]);

  useEffect(() => {
    checkAuthState();
  }, [isAuthed, token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        signOut,
        isAuthed,
        loading: !isAuthed && !!token,
        deleteAccount: deleteAccountMutate,
        checkEmailMutate,
        doesEmailExist,
        signInMutate,
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
