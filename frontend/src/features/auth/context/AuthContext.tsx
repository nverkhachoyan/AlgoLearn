import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { tokenService } from "../services/tokenService";
import * as authService from "../services/authService";
import type {
  ApiResponse,
  AuthResponse,
  EmailCheckResponse,
} from "../services/authService";
import { AxiosError, AxiosResponse } from "axios";
import { useRouter, useRootNavigation } from "expo-router";
import { Platform } from "react-native";
import AuthEvents from "../events/authEvents";

const PROTECTED_ROUTE = "/(protected)/(tabs)" as const;
const AUTH_ROUTE = "/(auth)" as const;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkEmail: (
    email: string
  ) => Promise<AxiosResponse<ApiResponse<EmailCheckResponse>>>;
}

interface AuthProviderProps {
  children: React.ReactNode;
  onAuthSuccess?: () => void;
  onSignOut?: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  onAuthSuccess,
  onSignOut,
}: AuthProviderProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const rootNavigation = useRootNavigation();

  const defaultOnAuthSuccess = useCallback(() => {
    if (!rootNavigation?.isReady) return;

    if (Platform.OS === "web") {
      setTimeout(() => {
        router.replace(PROTECTED_ROUTE);
      }, 0);
    } else {
      router.replace(PROTECTED_ROUTE);
    }
  }, [router, rootNavigation?.isReady]);

  const defaultOnSignOut = useCallback(() => {
    if (!rootNavigation?.isReady) return;
    router.replace(AUTH_ROUTE);
  }, [router, rootNavigation?.isReady]);

  const effectiveOnAuthSuccess = onAuthSuccess || defaultOnAuthSuccess;
  const effectiveOnSignOut = onSignOut || defaultOnSignOut;

  const handleSignOut = useCallback(async () => {
    console.debug("[AuthContext] Signing out...");
    queryClient.setQueryData(["authToken"], null);
    queryClient.removeQueries({ queryKey: ["user"] });
    await tokenService.clearTokens();
    effectiveOnSignOut();
  }, [queryClient, effectiveOnSignOut]);

  const { data: token = null, isLoading } = useQuery({
    queryKey: ["auth", "token"],
    queryFn: async () => {
      const token = await tokenService.getToken();
      console.debug(
        "[AuthContext] Token from query:",
        token ? "exists" : "null"
      );
      return token;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await tokenService.getToken();
        if (storedToken) {
          queryClient.setQueryData(["auth", "token"], storedToken);
          console.debug("[AuthContext] Restored auth state from storage");
          if (router.canGoBack()) {
            effectiveOnAuthSuccess();
          }
        } else if (router.canGoBack()) {
          effectiveOnSignOut();
        }
      } catch (error) {
        console.error("[AuthContext] Error initializing auth state:", error);
        await handleSignOut();
      }
    };

    initAuth();
  }, []);

  const handleAuthError = useCallback(
    async (error?: AxiosError) => {
      console.debug(
        "[AuthContext] Handling auth error...",
        error?.response?.data
      );
      const errorCode = (error?.response?.data as any)?.errorCode;

      if (errorCode === "ACCOUNT_NOT_FOUND" || errorCode === "UNAUTHORIZED") {
        console.debug(
          "[AuthContext] User not found or unauthorized, clearing auth state..."
        );
        queryClient.setQueryData(["authToken"], null);
        queryClient.removeQueries();

        await tokenService.clearTokens();

        if (Platform.OS === "web") {
          window.location.replace("/");
        } else {
          router.replace(AUTH_ROUTE);
        }
      }
    },
    [router, queryClient]
  );

  useEffect(() => {
    AuthEvents.setAuthFailureHandler(handleAuthError);
  }, [handleAuthError]);

  const checkEmailMutation = useMutation<
    ApiResponse<EmailCheckResponse>,
    AxiosError,
    string
  >({
    mutationFn: async (email: string) => {
      const axiosResponse = await authService.checkEmailExists(email);
      return axiosResponse.data;
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
      const response = await authService.signUp(username, email, password);
      if (!response.data.success || !response.data.payload) {
        throw new Error(response.data.message || "Failed to sign up");
      }
      const authResponse = response.data.payload;
      await tokenService.setToken(authResponse.token);
      if (typeof authResponse.refreshToken === "string") {
        await tokenService.setRefreshToken(authResponse.refreshToken);
      }
      queryClient.setQueryData(["auth", "token"], authResponse.token);
      await router.replace("/(protected)/(tabs)");
    },
    onError: (error: AxiosError) => {
      handleAuthError(error);
    },
  });

  const signInMutation = useMutation<
    ApiResponse<AuthResponse>,
    AxiosError,
    { email: string; password: string }
  >({
    mutationFn: async (credentials) => {
      console.debug("[AuthContext] Starting signin...");
      const axiosResponse = await authService.signIn(
        credentials.email,
        credentials.password
      );
      const response = axiosResponse.data;
      if (!response.success) {
        throw new Error(response.message);
      }
      if (response.payload?.token) {
        console.debug("[AuthContext] Setting tokens from signin...");
        await tokenService.setToken(response.payload.token);
        if (response.payload.refreshToken) {
          await tokenService.setRefreshToken(response.payload.refreshToken);
        }
        queryClient.setQueryData(["authToken"], response.payload.token);
        console.debug("[AuthContext] Tokens set from signin");
      }
      return response;
    },
    onSuccess: () => {
      console.debug("[AuthContext] Signin successful");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      effectiveOnAuthSuccess();
    },
  });

  const checkEmail = async (email: string) => {
    try {
      const response = await authService.checkEmailExists(email);
      return response;
    } catch (error) {
      handleAuthError(error as AxiosError);
      throw error;
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
    try {
      const response = await authService.signUp(username, email, password);
      if (!response.data.success || !response.data.payload) {
        throw new Error(response.data.message || "Failed to sign up");
      }
      const { token, refreshToken } = response.data.payload;
      await tokenService.setToken(token);
      if (typeof refreshToken === "string") {
        await tokenService.setRefreshToken(refreshToken);
      }
      queryClient.setQueryData(["auth", "token"], token);
      await router.replace("/(protected)/(tabs)");
    } catch (error) {
      handleAuthError(error as AxiosError);
      throw error;
    }
  };

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
    checkEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
