import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { tokenService } from './tokenService';
import type { ApiResponse, AuthResponse, EmailCheckResponse } from '.';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter, useNavigationContainerRef } from 'expo-router';

import { Platform } from 'react-native';
import api from '.';
import { View, ActivityIndicator } from 'react-native';
import { AuthenticatedFetcher } from './authenticatedFetcher';

const PROTECTED_ROUTE = '/(protected)/(tabs)' as const;
const AUTH_ROUTE = '/(auth)' as const;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkEmail: (email: string) => Promise<AxiosResponse<ApiResponse<EmailCheckResponse>>>;
  authFetcher: AuthenticatedFetcher;
}

interface AuthProviderProps {
  children: React.ReactNode;
  onAuthSuccess?: () => void;
  onSignOut?: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children, onAuthSuccess, onSignOut }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const rootNavigation = useNavigationContainerRef();
  const [authFetcher, setAuthFetcher] = useState<AuthenticatedFetcher | null>(null);

  const defaultOnAuthSuccess = useCallback(() => {
    if (!rootNavigation?.isReady()) return;

    if (Platform.OS === 'web') {
      setTimeout(() => {
        router.replace(PROTECTED_ROUTE);
      }, 0);
    } else {
      router.replace(PROTECTED_ROUTE);
    }
  }, [router, rootNavigation?.isReady()]);

  const defaultOnSignOut = useCallback(() => {
    if (!rootNavigation?.isReady()) return;
    router.replace(AUTH_ROUTE);
  }, [router, rootNavigation?.isReady()]);

  const effectiveOnAuthSuccess = onAuthSuccess || defaultOnAuthSuccess;
  const effectiveOnSignOut = onSignOut || defaultOnSignOut;

  const handleSignOut = useCallback(async () => {
    try {
      await tokenService.clearTokens();

      queryClient.removeQueries({ queryKey: ['user'] });
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.setQueryData(['auth', 'token'], null);

      effectiveOnSignOut();
    } catch (error) {
      router.replace(AUTH_ROUTE);
    }
  }, [queryClient, router, effectiveOnSignOut]);

  const handleAuthError = useCallback(
    async (error?: AxiosError) => {
      console.debug('[AuthContext] Handling auth error...', error?.response?.data);
      const errorCode = (error?.response?.data as any)?.errorCode;

      if (errorCode === 'ACCOUNT_NOT_FOUND' || errorCode === 'UNAUTHORIZED') {
        await handleSignOut();
      }
    },
    [handleSignOut]
  );

  const { data: token = null, isLoading } = useQuery({
    queryKey: ['auth', 'token'],
    queryFn: async () => {
      const token = await tokenService.getToken();
      console.debug('[AuthContext] Token from query:', token ? 'exists' : 'null');
      return token;
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

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await api.post('/users/sign-in', { email, password });
      if (!response.data.success || !response.data.payload) {
        throw new Error(response.data.message || 'Failed to sign in');
      }
      return response.data.payload;
    },
    onSuccess: async (payload: AuthResponse) => {
      const { token, refreshToken } = payload;
      await tokenService.setToken(token);
      if (typeof refreshToken === 'string') {
        await tokenService.setRefreshToken(refreshToken);
      }

      // Update auth state
      queryClient.setQueryData(['auth', 'token'], token);

      // Invalidate user query to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: ['user'] });

      effectiveOnAuthSuccess();
    },
    onError: (error: AxiosError) => {
      handleAuthError(error);
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
      if (!response.data.success || !response.data.payload) {
        throw new Error(response.data.message || 'Failed to sign up');
      }
      return response.data.payload;
    },
    onSuccess: async (payload: AuthResponse) => {
      const { token, refreshToken } = payload;
      await tokenService.setToken(token);
      if (typeof refreshToken === 'string') {
        await tokenService.setRefreshToken(refreshToken);
      }

      // Update auth state
      queryClient.setQueryData(['auth', 'token'], token);

      // Invalidate user query to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: ['user'] });

      effectiveOnAuthSuccess();
    },
    onError: (error: AxiosError) => {
      handleAuthError(error);
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

  const value = {
    isAuthenticated: !!token,
    isLoading,
    token,
    signIn: async (email: string, password: string) => {
      await signInMutation.mutateAsync({ email, password });
    },
    signUp: async (username: string, email: string, password: string) => {
      await signUpMutation.mutateAsync({ username, email, password });
    },
    signOut: handleSignOut,
    checkEmail: async (email: string) => {
      return checkEmailMutation.mutateAsync(email);
    },
    authFetcher,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
