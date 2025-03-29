import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { tokenService } from './tokenService';
import type { ApiResponse, AuthResponse, EmailCheckResponse } from './utils';
import { AxiosError, AxiosResponse } from 'axios';
import { useNavigationContainerRef } from 'expo-router';

import { api, ApiErrorResponse } from './utils';
import { View, ActivityIndicator } from 'react-native';
import { AuthenticatedFetcher } from './authenticatedFetcher';
import useToast from '@/src/hooks/useToast';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarding: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkEmail: (email: string) => Promise<AxiosResponse<ApiResponse<EmailCheckResponse>>>;
  setHasOnboarded: (hasOnboarded: boolean) => Promise<void>;
  authFetcher: AuthenticatedFetcher;
}

interface AuthProviderProps {
  children: React.ReactNode;
  onAuthSuccess?: () => void;
  onSignOut?: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const rootNavigation = useNavigationContainerRef();
  const [authFetcher, setAuthFetcher] = useState<AuthenticatedFetcher | null>(null);
  const { showToast } = useToast();

  const handleSignOut = async () => {
    try {
      await tokenService.clearTokens();
      queryClient.setQueryData(['auth', 'token'], null);
    } catch (error) {
      throw error;
    }
  };

  const { data: token = null, isLoading } = useQuery({
    queryKey: ['auth', 'token'],
    queryFn: async () => {
      const token = await tokenService.getToken();
      console.debug('[AuthContext] Token from query:', token ? 'exists' : 'null');
      return token;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 5,
  });

  const { data: isOnboarding = false } = useQuery({
    queryKey: ['isOnboarding'],
    queryFn: async () => {
      const isOnboarding = await tokenService.getIsOnboarding();
      return isOnboarding;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  // Initialize AuthenticatedFetcher
  useEffect(() => {
    if (!authFetcher) {
      const fetcher = new AuthenticatedFetcher(queryClient, handleSignOut);
      setAuthFetcher(fetcher);
    }
  }, [queryClient, handleSignOut]);

  // Check for tokens on mount and log out if none exist
  useEffect(() => {
    const checkTokens = async () => {
      const token = await tokenService.getToken();
      const refreshToken = await tokenService.getRefreshToken();

      if (!token && !refreshToken && rootNavigation?.isReady()) {
        await handleSignOut();
      }
    };

    checkTokens();
  }, [handleSignOut, rootNavigation?.isReady()]);

  const checkEmailMutation = useMutation<
    AxiosResponse<ApiResponse<EmailCheckResponse>>,
    AxiosError,
    string
  >({
    mutationFn: async (email: string) => {
      return api.get(`/users/check-email?email=${encodeURIComponent(email)}`);
    },
  });

  const setIsOnboarding = useMutation({
    mutationFn: async ({ isUserOnboarding }: { isUserOnboarding: boolean }) => {
      await tokenService.setIsOnboarding(isUserOnboarding);
    },
  });

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await api.post('/users/sign-in', { email, password });

      if (response.data.success) {
        return response.data.payload;
      }
    },
    onSuccess: async (payload: AuthResponse) => {
      await tokenService.setToken(payload.token);
      await tokenService.setRefreshToken(payload.refreshToken);
      queryClient.setQueryData(['auth', 'token'], payload.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorResponse = error.response;
      const data = errorResponse?.data;
      if (data?.errorCode === 'INVALID_CREDENTIALS') {
        showToast('Invalid email or password');
        return;
      }

      showToast(data?.message || 'An unexpected error occurred');
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async ({
      username,
      email,
      password,
    }: {
      username: string;
      email: string;
      password: string;
    }) => {
      const response = await api.post('/users/sign-up', { username, email, password });
      if (response.data.success) {
        return response.data.payload;
      }
    },
    onSuccess: async payload => {
      await setIsOnboarding.mutateAsync({ isUserOnboarding: true });
      await tokenService.setToken(payload.token);
      await tokenService.setRefreshToken(payload.refreshToken);
      queryClient.setQueryData(['auth', 'token'], payload.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorResponse = error.response;
      const data = errorResponse?.data;
      if (data?.errorCode === 'ACCOUNT_EXISTS') {
        showToast('An account with this email already exists');
        return;
      }

      showToast(data?.message || 'An unexpected error occurred');
    },
  });

  // Wait for AuthFetcher to be initialized
  if (isLoading || !authFetcher) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        isLoading,
        token,
        isOnboarding,
        setHasOnboarded: async (isUserOnboarding: boolean) => {
          await setIsOnboarding.mutateAsync({ isUserOnboarding });
        },
        signIn: async (email: string, password: string) => {
          await signInMutation.mutateAsync({ email, password });
        },
        signUp: async (username: string, email: string, password: string) => {
          await signUpMutation.mutateAsync({ username, email, password });
        },
        signOut: handleSignOut,
        checkEmail: async (email: string) => {
          return await checkEmailMutation.mutateAsync(email);
        },
        authFetcher,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
