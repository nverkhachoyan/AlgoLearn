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
import api from "../setup";
import { View, ActivityIndicator } from "react-native";

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

  const clearAuthHandler = () => {
    AuthEvents.setAuthFailureHandler(async () => {});
  };

  const handleSignOut = useCallback(async () => {
    console.debug("[AuthContext] Signing out...");
    try {
      // Prevent further auth error handling during sign out
      clearAuthHandler();

      // First, clear tokens from storage
      await tokenService.clearTokens();
      console.debug("[AuthContext] Tokens cleared from storage");

      // Then clear auth-related queries
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["auth"] });
      queryClient.setQueryData(["auth", "token"], null);
      console.debug("[AuthContext] Auth queries cleared");

      // Finally, navigate to auth screen
      console.debug("[AuthContext] Navigating to auth screen");
      effectiveOnSignOut();
    } catch (error) {
      console.error("[AuthContext] Error during sign out:", error);
      // Force navigation to auth screen even if cleanup fails
      router.replace(AUTH_ROUTE);
    }
  }, [queryClient, router, effectiveOnSignOut]);

  const handleAuthError = useCallback(
    async (error?: AxiosError) => {
      console.debug(
        "[AuthContext] Handling auth error...",
        error?.response?.data
      );
      const errorCode = (error?.response?.data as any)?.errorCode;

      if (errorCode === "ACCOUNT_NOT_FOUND" || errorCode === "UNAUTHORIZED") {
        console.debug(
          "[AuthContext] User not found or unauthorized, signing out..."
        );
        // Clear the auth failure handler before signing out to prevent loops
        clearAuthHandler();
        await handleSignOut();
      }
    },
    [handleSignOut]
  );

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
    retry: false,
  });

  useEffect(() => {
    // Only set the auth failure handler if we have a token
    if (token) {
      AuthEvents.setAuthFailureHandler(handleAuthError);
    } else {
      clearAuthHandler();
    }
    return clearAuthHandler;
  }, [handleAuthError, token]);

  const checkEmailMutation = useMutation<
    AxiosResponse<ApiResponse<EmailCheckResponse>>,
    AxiosError,
    string
  >({
    mutationFn: async (email: string) => {
      return authService.checkEmailExists(email);
    },
  });

  const signInMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      console.debug("[AuthContext] Starting signin...");
      const response = await authService.signIn(email, password);
      if (!response.data.success || !response.data.payload) {
        throw new Error(response.data.message || "Failed to sign in");
      }
      return response.data.payload;
    },
    onSuccess: async (payload: AuthResponse) => {
      console.debug("[AuthContext] Setting tokens from signin...");
      const { token, refreshToken } = payload;
      await tokenService.setToken(token);
      if (typeof refreshToken === "string") {
        await tokenService.setRefreshToken(refreshToken);
      }
      console.debug("[AuthContext] Tokens set from signin");

      // Update auth state
      queryClient.setQueryData(["auth", "token"], token);

      // Invalidate user query to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: ["user"] });

      console.debug("[AuthContext] Signin successful");
      effectiveOnAuthSuccess();
    },
    onError: (error: AxiosError) => {
      console.error("[AuthContext] Signin error:", error);
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
      console.debug("[AuthContext] Starting signup...");
      const response = await authService.signUp(username, email, password);
      if (!response.data.success || !response.data.payload) {
        throw new Error(response.data.message || "Failed to sign up");
      }
      return response.data.payload;
    },
    onSuccess: async (payload: AuthResponse) => {
      console.debug("[AuthContext] Setting tokens from signup...");
      const { token, refreshToken } = payload;
      await tokenService.setToken(token);
      if (typeof refreshToken === "string") {
        await tokenService.setRefreshToken(refreshToken);
      }
      console.debug("[AuthContext] Tokens set from signup");

      // Update auth state
      queryClient.setQueryData(["auth", "token"], token);

      // Invalidate user query to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: ["user"] });

      console.debug("[AuthContext] Signup successful");
      effectiveOnAuthSuccess();
    },
    onError: (error: AxiosError) => {
      console.error("[AuthContext] Signup error:", error);
      handleAuthError(error);
    },
  });

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
  };

  if (isLoading) {
    console.debug("[AuthContext] Still loading, showing loading state");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.debug("[AuthContext] Rendering with auth state:", {
    isAuthenticated: !!token,
    token: !!token,
  });
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
